const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Algorithm = require("../models/Algorithm");
const AlgorithmFolder = require("../models/AlgorithmFolder");
const authMiddleware = require("../middleware/auth");
const { isAdmin } = require("../middleware/auth");
const { fetchJavaFromGitHub } = require("../services/githubJava");

router.use(authMiddleware);

const MAX_FOLDER_DEPTH = 8;

function asId(value) {
  if (!value) return null;
  if (!mongoose.Types.ObjectId.isValid(value)) return null;
  return value;
}

async function folderDepth(folderId) {
  let depth = 0;
  let current = folderId;
  const seen = new Set();
  while (current) {
    if (seen.has(String(current))) break;
    seen.add(String(current));
    const folder = await AlgorithmFolder.findById(current).select("parentId");
    if (!folder) break;
    depth += 1;
    current = folder.parentId;
  }
  return depth;
}

async function wouldCycle(folderId, newParentId) {
  if (!newParentId) return false;
  if (String(folderId) === String(newParentId)) return true;
  let current = newParentId;
  const seen = new Set();
  while (current) {
    const key = String(current);
    if (key === String(folderId)) return true;
    if (seen.has(key)) return true;
    seen.add(key);
    const folder = await AlgorithmFolder.findById(current).select("parentId");
    if (!folder) break;
    current = folder.parentId;
  }
  return false;
}

router.get("/", async (req, res) => {
  try {
    const [folders, algorithms] = await Promise.all([
      AlgorithmFolder.find().sort({ name: 1 }),
      Algorithm.find().select("-code").sort({ title: 1 }),
    ]);
    const missingSlug = algorithms.filter((algo) => !algo.slug);
    if (missingSlug.length) {
      await Promise.all(missingSlug.map((algo) => algo.save()));
    }
    res.json({ folders, algorithms });
  } catch (error) {
    console.error("Get algorithms error:", error);
    res.status(500).json({ message: "Failed to load algorithms" });
  }
});

router.post("/folders", isAdmin, async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const parentId = asId(req.body.parentId);
    if (!name) {
      return res.status(400).json({ message: "Folder name is required" });
    }

    if (parentId) {
      const parent = await AlgorithmFolder.findById(parentId);
      if (!parent) {
        return res.status(404).json({ message: "Parent folder not found" });
      }
      const depth = await folderDepth(parentId);
      if (depth >= MAX_FOLDER_DEPTH) {
        return res.status(400).json({ message: "Folder is nested too deeply" });
      }
    }

    const folder = await AlgorithmFolder.create({
      name,
      parentId: parentId || null,
      createdBy: req.user.id,
    });
    res.status(201).json({ message: "Folder created", folder });
  } catch (error) {
    console.error("Create folder error:", error);
    res.status(400).json({ message: error.message || "Failed to create folder" });
  }
});

router.put("/folders/:id", isAdmin, async (req, res) => {
  try {
    const folder = await AlgorithmFolder.findById(req.params.id);
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }
    if (req.body.name != null) {
      const name = String(req.body.name).trim();
      if (!name) {
        return res.status(400).json({ message: "Folder name is required" });
      }
      folder.name = name;
    }
    if (req.body.parentId !== undefined) {
      const parentId = asId(req.body.parentId);
      if (await wouldCycle(folder._id, parentId)) {
        return res.status(400).json({ message: "Cannot move a folder into itself" });
      }
      folder.parentId = parentId;
    }
    await folder.save();
    res.json({ message: "Folder updated", folder });
  } catch (error) {
    console.error("Update folder error:", error);
    res.status(400).json({ message: error.message || "Failed to update folder" });
  }
});

router.delete("/folders/:id", isAdmin, async (req, res) => {
  try {
    const folder = await AlgorithmFolder.findById(req.params.id);
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    const parentId = folder.parentId || null;
    await AlgorithmFolder.updateMany(
      { parentId: folder._id },
      { parentId },
    );
    await Algorithm.updateMany(
      { folderId: folder._id },
      { folderId: parentId },
    );
    await folder.deleteOne();

    res.json({ message: "Folder deleted. Contents moved up one level." });
  } catch (error) {
    console.error("Delete folder error:", error);
    res.status(500).json({ message: "Failed to delete folder" });
  }
});

async function findAlgorithmByParam(param) {
  const slug = String(param || "").trim().toLowerCase();
  let algorithm = slug ? await Algorithm.findOne({ slug }) : null;
  if (!algorithm && mongoose.Types.ObjectId.isValid(param)) {
    algorithm = await Algorithm.findById(param);
  }
  if (algorithm && !algorithm.slug) {
    await algorithm.save();
  }
  return algorithm;
}

router.get("/:id", async (req, res) => {
  try {
    const algorithm = await findAlgorithmByParam(req.params.id);
    if (!algorithm) {
      return res.status(404).json({ message: "Algorithm not found" });
    }
    res.json({ algorithm });
  } catch (error) {
    console.error("Get algorithm error:", error);
    res.status(500).json({ message: "Failed to load algorithm" });
  }
});

router.post("/", isAdmin, async (req, res) => {
  try {
    const { githubUrl, title, description, folderId } = req.body;
    const parentId = asId(folderId);
    if (parentId) {
      const folder = await AlgorithmFolder.findById(parentId);
      if (!folder) {
        return res.status(404).json({ message: "Folder not found" });
      }
    }

    const fetched = await fetchJavaFromGitHub(githubUrl);

    const algorithm = await Algorithm.create({
      title: (title && title.trim()) || fetched.className,
      githubUrl: fetched.githubUrl,
      filename: fetched.filename,
      className: fetched.className,
      description: (description && description.trim()) || fetched.description,
      methods: fetched.methods,
      code: fetched.code,
      lineCount: fetched.lineCount,
      folderId: parentId,
      createdBy: req.user.id,
    });

    res.status(201).json({
      message: "Algorithm added",
      algorithm,
    });
  } catch (error) {
    console.error("Create algorithm error:", error);
    res.status(400).json({
      message: error.message || "Failed to add algorithm from GitHub",
    });
  }
});

router.put("/:id/refresh", isAdmin, async (req, res) => {
  try {
    const algorithm = await Algorithm.findById(req.params.id);
    if (!algorithm) {
      return res.status(404).json({ message: "Algorithm not found" });
    }

    const fetched = await fetchJavaFromGitHub(algorithm.githubUrl);
    algorithm.filename = fetched.filename;
    algorithm.className = fetched.className;
    algorithm.methods = fetched.methods;
    algorithm.code = fetched.code;
    algorithm.lineCount = fetched.lineCount;
    if (!algorithm.description && fetched.description) {
      algorithm.description = fetched.description;
    }
    await algorithm.save();

    res.json({ message: "Code refreshed from GitHub", algorithm });
  } catch (error) {
    console.error("Refresh algorithm error:", error);
    res.status(400).json({
      message: error.message || "Failed to refresh algorithm",
    });
  }
});

router.delete("/:id", isAdmin, async (req, res) => {
  try {
    const algorithm = await Algorithm.findByIdAndDelete(req.params.id);
    if (!algorithm) {
      return res.status(404).json({ message: "Algorithm not found" });
    }
    res.json({ message: "Algorithm deleted" });
  } catch (error) {
    console.error("Delete algorithm error:", error);
    res.status(500).json({ message: "Failed to delete algorithm" });
  }
});

module.exports = router;
