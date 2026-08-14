const axios = require("axios");

const JAVA_SUFFIX = /\.java$/i;
const MAX_BYTES = 400 * 1024;

function toRawGitHubFile(input) {
  const url = String(input || "").trim();
  if (!url) {
    throw new Error("GitHub URL is required");
  }

  const clean = url.split("#")[0].split("?")[0];
  if (!JAVA_SUFFIX.test(clean)) {
    throw new Error("Link must point to a .java file");
  }

  const blobMatch = clean.match(
    /^https?:\/\/(?:www\.)?github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+\.java)$/i,
  );
  if (blobMatch) {
    const [, owner, repo, ref, filePath] = blobMatch;
    return {
      rawUrl: `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${filePath}`,
      filename: filePath.split("/").pop(),
    };
  }

  const rawMatch = clean.match(
    /^https?:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\/(.+\.java)$/i,
  );
  if (rawMatch) {
    const [, , , , filePath] = rawMatch;
    return {
      rawUrl: clean,
      filename: filePath.split("/").pop(),
    };
  }

  throw new Error(
    "Use a GitHub file link, e.g. https://github.com/user/repo/blob/main/BinarySearch.java",
  );
}

function parseJavaSource(code, filename) {
  const classMatch = code.match(/\b(?:class|interface|enum)\s+(\w+)/);
  const className =
    classMatch?.[1] || String(filename || "Algorithm").replace(/\.java$/i, "");

  const methods = [];
  const methodRe =
    /(?:public|private|protected)\s+(?:static\s+)?(?:[\w.<>,\[\]?]+\s+)+([A-Za-z_]\w*)\s*\(/g;
  let match;
  while ((match = methodRe.exec(code))) {
    if (!["if", "for", "while", "switch", "catch", "return"].includes(match[1])) {
      methods.push(match[1]);
    }
  }

  let description = "";
  const header = code.match(/^\s*\/\*\*([\s\S]*?)\*\//);
  if (header) {
    description = header[1]
      .split("\n")
      .map((line) => line.replace(/^\s*\*\s?/, "").trim())
      .filter((line) => line && !line.startsWith("@"))
      .join(" ")
      .trim()
      .slice(0, 500);
  }

  return {
    className,
    methods: [...new Set(methods)],
    description,
    lineCount: code.split(/\r?\n/).length,
  };
}

async function fetchJavaFromGitHub(githubUrl) {
  const { rawUrl, filename } = toRawGitHubFile(githubUrl);

  const response = await axios.get(rawUrl, {
    responseType: "text",
    timeout: 15000,
    maxContentLength: MAX_BYTES,
    headers: {
      Accept: "text/plain",
      "User-Agent": "AlgoTick",
    },
    validateStatus: (status) => status < 500,
  });

  if (response.status === 404) {
    throw new Error("File not found on GitHub. Check the link and branch name.");
  }
  if (response.status !== 200) {
    throw new Error("Could not fetch the Java file from GitHub.");
  }

  const code = typeof response.data === "string" ? response.data : String(response.data);
  if (!code.trim()) {
    throw new Error("The Java file is empty.");
  }

  const parsed = parseJavaSource(code, filename);
  return {
    githubUrl: githubUrl.trim(),
    filename,
    code,
    ...parsed,
  };
}

module.exports = {
  toRawGitHubFile,
  parseJavaSource,
  fetchJavaFromGitHub,
};
