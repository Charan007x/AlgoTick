import React, { useMemo, useState } from "react";
import { Code2, Plus, Trash2, RefreshCw, ExternalLink, FolderPlus, Pencil, Check, X } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { algorithmsAPI } from "../services/api";
import { queryKeys } from "../lib/queryClient";
import { useConfirm } from "../context/ConfirmContext";
import { buildAlgorithmTree, flattenFolders, folderPathLabel } from "../lib/algorithmTree";
import AlgorithmTree from "./AlgorithmTree";

const AdminAlgorithms = () => {
  const { confirm } = useConfirm();
  const queryClient = useQueryClient();
  const [githubUrl, setGithubUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [folderName, setFolderName] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [refreshingId, setRefreshingId] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.algorithms,
    queryFn: async () => {
      const response = await algorithmsAPI.getAll();
      return {
        folders: response.data.folders || [],
        algorithms: response.data.algorithms || [],
      };
    },
  });

  const folders = data?.folders || [];
  const algorithms = data?.algorithms || [];
  const tree = useMemo(
    () => buildAlgorithmTree(folders, algorithms),
    [folders, algorithms],
  );
  const folderOptions = useMemo(() => flattenFolders(tree), [tree]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  const invalidateLibrary = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.algorithms });
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!folderName.trim()) {
      showMessage("error", "Folder name is required");
      return;
    }
    try {
      setCreatingFolder(true);
      const response = await algorithmsAPI.createFolder({
        name: folderName.trim(),
        parentId: selectedFolderId,
      });
      invalidateLibrary();
      setFolderName("");
      if (response.data.folder?._id) {
        setSelectedFolderId(response.data.folder._id);
      }
      showMessage("success", "Folder created");
    } catch (error) {
      showMessage("error", error.response?.data?.message || "Failed to create folder");
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!githubUrl.trim()) {
      showMessage("error", "GitHub link is required");
      return;
    }

    try {
      setSubmitting(true);
      await algorithmsAPI.create({
        githubUrl: githubUrl.trim(),
        title: title.trim(),
        description: description.trim(),
        folderId: selectedFolderId,
      });
      invalidateLibrary();
      setGithubUrl("");
      setTitle("");
      setDescription("");
      showMessage("success", "Algorithm imported from GitHub");
    } catch (error) {
      showMessage("error", error.response?.data?.message || "Failed to import Java file");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefresh = async (id) => {
    try {
      setRefreshingId(id);
      await algorithmsAPI.refresh(id);
      invalidateLibrary();
      queryClient.invalidateQueries({ queryKey: queryKeys.algorithm(id) });
      showMessage("success", "Code refreshed from GitHub");
    } catch (error) {
      showMessage("error", error.response?.data?.message || "Failed to refresh");
    } finally {
      setRefreshingId(null);
    }
  };

  const handleDeleteAlgo = async (id, name) => {
    const ok = await confirm({
      title: "Delete algorithm",
      message: `Remove "${name}" from the template library?`,
      confirmText: "Delete",
      variant: "danger",
    });
    if (!ok) return;

    try {
      await algorithmsAPI.delete(id);
      invalidateLibrary();
      showMessage("success", "Algorithm deleted");
    } catch (error) {
      showMessage("error", error.response?.data?.message || "Failed to delete");
    }
  };

  const handleRenameFolder = async (folder) => {
    const name = renameValue.trim();
    if (!name) {
      showMessage("error", "Folder name is required");
      return;
    }
    try {
      await algorithmsAPI.updateFolder(folder._id, { name });
      setRenamingId(null);
      setRenameValue("");
      invalidateLibrary();
      showMessage("success", "Folder renamed");
    } catch (error) {
      showMessage("error", error.response?.data?.message || "Failed to rename folder");
    }
  };

  const handleDeleteFolder = async (folder) => {
    const ok = await confirm({
      title: "Delete folder",
      message: `Delete "${folder.name}"? Nested folders and algorithms move up one level.`,
      confirmText: "Delete",
      variant: "danger",
    });
    if (!ok) return;

    try {
      await algorithmsAPI.deleteFolder(folder._id);
      if (String(selectedFolderId) === String(folder._id)) {
        setSelectedFolderId(folder.parentId || null);
      }
      invalidateLibrary();
      showMessage("success", "Folder deleted");
    } catch (error) {
      showMessage("error", error.response?.data?.message || "Failed to delete folder");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Code2 className="w-6 h-6 text-teal-400" />
          <div>
            <h3 className="text-xl font-bold text-white">Algorithm templates</h3>
            <p className="text-sm text-gray-400">
              Create folders, then import a GitHub .java file into the selected folder.
            </p>
          </div>
        </div>

        {message.text && (
          <div
            className={`mb-4 p-3 rounded-xl text-sm border ${
              message.type === "success"
                ? "bg-teal-500/10 text-teal-400 border-teal-500/30"
                : "bg-red-500/10 text-red-400 border-red-500/30"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="mb-5 p-3 rounded-xl bg-black/30 border border-white/10 text-sm text-gray-300">
          Adding to:{" "}
          <span className="text-teal-400 font-medium">
            {folderPathLabel(folders, selectedFolderId)}
          </span>
          {selectedFolderId && (
            <button
              type="button"
              onClick={() => setSelectedFolderId(null)}
              className="ml-3 text-xs text-gray-400 hover:text-white"
            >
              Use root
            </button>
          )}
        </div>

        <form onSubmit={handleCreateFolder} className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder={selectedFolderId ? "New subfolder name" : "New folder name"}
            className="flex-1 bg-gray-800/40 border border-white/10 rounded-xl py-3 px-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
          />
          <button
            type="submit"
            disabled={creatingFolder}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white font-medium disabled:opacity-50"
          >
            <FolderPlus className="w-4 h-4 text-teal-400" />
            {creatingFolder ? "Creating..." : "Create folder"}
          </button>
        </form>

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Folder</label>
            <select
              value={selectedFolderId || ""}
              onChange={(e) => setSelectedFolderId(e.target.value || null)}
              className="w-full bg-gray-800/40 border border-white/10 rounded-xl py-3 px-4 text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            >
              <option value="">Library root</option>
              {folderOptions.map((folder) => (
                <option key={folder._id} value={folder._id}>
                  {"— ".repeat(folder.depth)}
                  {folder.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">GitHub Java file URL</label>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/user/repo/blob/main/BinarySearch.java"
              className="w-full bg-gray-800/40 border border-white/10 rounded-xl py-3 px-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              required
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Title (optional)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Defaults to the Java class name"
                className="w-full bg-gray-800/40 border border-white/10 rounded-xl py-3 px-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Short description (optional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Defaults to the file javadoc"
                className="w-full bg-gray-800/40 border border-white/10 rounded-xl py-3 px-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-400 to-emerald-500 text-black font-semibold px-5 py-3 rounded-xl disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {submitting ? "Importing..." : "Import into folder"}
          </button>
        </form>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h4 className="text-white font-semibold mb-4">
          Library ({algorithms.length} algorithms, {folders.length} folders)
        </h4>
        {isLoading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : (
          <AlgorithmTree
            tree={tree}
            selectedFolderId={selectedFolderId}
            onSelectFolder={setSelectedFolderId}
            renderFolderActions={(folder) =>
              String(renamingId) === String(folder._id) ? (
                <form
                  className="flex items-center gap-1"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleRenameFolder(folder);
                  }}
                >
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    className="w-28 bg-gray-800/80 border border-white/20 rounded-md px-2 py-1 text-xs text-white"
                  />
                  <button type="submit" className="p-1.5 rounded-lg text-teal-400 hover:bg-white/10">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRenamingId(null);
                      setRenameValue("");
                    }}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-white/10"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <div className="flex items-center opacity-0 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => {
                      setRenamingId(folder._id);
                      setRenameValue(folder.name);
                    }}
                    className="p-1.5 rounded-lg text-gray-300 hover:bg-white/10"
                    title="Rename folder"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteFolder(folder)}
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10"
                    title="Delete folder"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            }
            renderAlgoActions={(algo) => (
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
                {algo.githubUrl && (
                  <a
                    href={algo.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-gray-300 hover:bg-white/10"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => handleRefresh(algo._id)}
                  disabled={refreshingId === algo._id}
                  className="p-1.5 rounded-lg text-teal-400 hover:bg-white/10 disabled:opacity-50"
                  title="Refresh from GitHub"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshingId === algo._id ? "animate-spin" : ""}`} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteAlgo(algo._id, algo.title)}
                  className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          />
        )}
      </div>
    </div>
  );
};

export default AdminAlgorithms;
