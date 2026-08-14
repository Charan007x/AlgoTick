export function buildAlgorithmTree(folders = [], algorithms = []) {
  const buckets = new Map();

  const bucket = (parentId) => {
    const key = parentId ? String(parentId) : "root";
    if (!buckets.has(key)) {
      buckets.set(key, { folders: [], algorithms: [] });
    }
    return buckets.get(key);
  };

  folders.forEach((folder) => {
    bucket(folder.parentId).folders.push(folder);
  });
  algorithms.forEach((algo) => {
    bucket(algo.folderId).algorithms.push(algo);
  });

  const walk = (parentId) => {
    const current = bucket(parentId);
    return {
      folders: [...current.folders]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((folder) => ({
          ...folder,
          children: walk(folder._id),
        })),
      algorithms: [...current.algorithms].sort((a, b) =>
        a.title.localeCompare(b.title),
      ),
    };
  };

  return walk(null);
}

export function flattenFolders(tree, depth = 0, acc = []) {
  tree.folders.forEach((folder) => {
    acc.push({
      _id: folder._id,
      name: folder.name,
      parentId: folder.parentId,
      depth,
    });
    flattenFolders(folder.children, depth + 1, acc);
  });
  return acc;
}

export function folderPathLabel(folders, folderId) {
  if (!folderId) return "Library root";
  const byId = new Map(folders.map((folder) => [String(folder._id), folder]));
  const parts = [];
  let current = byId.get(String(folderId));
  const seen = new Set();
  while (current && !seen.has(String(current._id))) {
    seen.add(String(current._id));
    parts.unshift(current.name);
    current = current.parentId ? byId.get(String(current.parentId)) : null;
  }
  return parts.join(" / ") || "Library root";
}
