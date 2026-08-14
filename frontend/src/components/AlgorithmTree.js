import React, { useState } from "react";
import { ChevronRight, Folder, FileCode2 } from "lucide-react";

function FolderNode({
  folder,
  depth,
  selectedAlgoId,
  selectedFolderId,
  onSelectAlgo,
  onSelectFolder,
  defaultOpen = true,
  renderFolderActions,
  renderAlgoActions,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const isSelected = String(selectedFolderId) === String(folder._id);
  const childCount =
    (folder.children?.folders?.length || 0) +
    (folder.children?.algorithms?.length || 0);

  return (
    <div>
      <div
        className={`group flex items-center gap-1 rounded-lg pr-1 ${
          isSelected ? "bg-teal-500/15" : "hover:bg-white/5"
        }`}
        style={{ paddingLeft: 8 + depth * 12 }}
      >
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="p-1 text-gray-500 hover:text-white"
          aria-label={open ? "Collapse folder" : "Expand folder"}
        >
          <ChevronRight
            className={`w-4 h-4 transition-transform ${open ? "rotate-90" : ""}`}
          />
        </button>
        <button
          type="button"
          onClick={() => {
            if (onSelectFolder) onSelectFolder(folder._id);
            else setOpen((value) => !value);
          }}
          className="flex-1 flex items-center gap-2 py-1.5 text-left min-w-0"
        >
          <Folder className="w-4 h-4 text-teal-400 shrink-0" />
          <span className="text-sm text-white truncate">{folder.name}</span>
          <span className="text-[11px] text-gray-500">{childCount}</span>
        </button>
        {renderFolderActions?.(folder)}
      </div>
      {open && (
        <TreeLevel
          node={folder.children}
          depth={depth + 1}
          selectedAlgoId={selectedAlgoId}
          selectedFolderId={selectedFolderId}
          onSelectAlgo={onSelectAlgo}
          onSelectFolder={onSelectFolder}
          defaultOpen={defaultOpen}
          renderFolderActions={renderFolderActions}
          renderAlgoActions={renderAlgoActions}
        />
      )}
    </div>
  );
}

function TreeLevel({
  node,
  depth,
  selectedAlgoId,
  selectedFolderId,
  onSelectAlgo,
  onSelectFolder,
  defaultOpen = true,
  renderFolderActions,
  renderAlgoActions,
}) {
  return (
    <div>
      {node.folders.map((folder) => (
        <FolderNode
          key={folder._id}
          folder={folder}
          depth={depth}
          selectedAlgoId={selectedAlgoId}
          selectedFolderId={selectedFolderId}
          onSelectAlgo={onSelectAlgo}
          onSelectFolder={onSelectFolder}
          defaultOpen={defaultOpen}
          renderFolderActions={renderFolderActions}
          renderAlgoActions={renderAlgoActions}
        />
      ))}
      {node.algorithms.map((algo) => {
        const isSelected =
          String(selectedAlgoId) === String(algo.slug) ||
          String(selectedAlgoId) === String(algo._id);
        return (
          <div
            key={algo._id}
            className={`group flex items-center gap-1 rounded-lg pr-1 ${
              isSelected ? "bg-teal-500/15 border border-teal-500/30" : "hover:bg-white/5"
            }`}
            style={{ paddingLeft: 28 + depth * 12 }}
          >
            <button
              type="button"
              onClick={() => onSelectAlgo?.(algo.slug || algo._id)}
              className="flex-1 flex items-center gap-2 py-1.5 text-left min-w-0"
            >
              <FileCode2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-sm text-white truncate">{algo.title}</span>
            </button>
            {renderAlgoActions?.(algo)}
          </div>
        );
      })}
    </div>
  );
}

export default function AlgorithmTree({
  tree,
  selectedAlgoId,
  selectedFolderId,
  onSelectAlgo,
  onSelectFolder,
  defaultOpen = true,
  renderFolderActions,
  renderAlgoActions,
}) {
  const isEmpty = tree.folders.length === 0 && tree.algorithms.length === 0;
  if (isEmpty) {
    return (
      <p className="text-white/50 text-sm text-center py-8">
        No folders or algorithms yet.
      </p>
    );
  }

  return (
    <div className="space-y-0.5">
      <TreeLevel
        node={tree}
        depth={0}
        selectedAlgoId={selectedAlgoId}
        selectedFolderId={selectedFolderId}
        onSelectAlgo={onSelectAlgo}
        onSelectFolder={onSelectFolder}
        defaultOpen={defaultOpen}
        renderFolderActions={renderFolderActions}
        renderAlgoActions={renderAlgoActions}
      />
    </div>
  );
}
