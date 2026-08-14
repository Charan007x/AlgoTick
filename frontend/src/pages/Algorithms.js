import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Code2, Search, GitBranch, Copy, Check, Folder, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { algorithmsAPI } from "../services/api";
import { queryKeys } from "../lib/queryClient";
import { highlightJava } from "../lib/highlightJava";
import { buildAlgorithmTree, folderPathLabel } from "../lib/algorithmTree";
import AlgorithmTree from "../components/AlgorithmTree";

const Algorithms = () => {
  const navigate = useNavigate();
  const { algorithmSlug } = useParams();
  const selectedSlug = algorithmSlug || null;
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);

  const openFile = (slug) => {
    if (!slug) return;
    navigate(`/algorithms/${slug}`);
  };

  const backToLibrary = () => {
    navigate("/algorithms");
  };

  const { data, isLoading: loading } = useQuery({
    queryKey: queryKeys.algorithms,
    queryFn: async () => {
      const response = await algorithmsAPI.getAll();
      return {
        folders: response.data.folders || [],
        algorithms: response.data.algorithms || [],
      };
    },
  });

  const folders = data?.folders ?? [];
  const tree = useMemo(
    () => buildAlgorithmTree(data?.folders || [], data?.algorithms || []),
    [data],
  );

  const { data: selected, isFetching: loadingCode } = useQuery({
    queryKey: queryKeys.algorithm(selectedSlug),
    queryFn: async () => {
      const response = await algorithmsAPI.getOne(selectedSlug);
      return response.data.algorithm;
    },
    enabled: Boolean(selectedSlug),
  });

  useEffect(() => {
    if (selected?.slug && selectedSlug && selected.slug !== selectedSlug) {
      navigate(`/algorithms/${selected.slug}`, { replace: true });
    }
  }, [selected, selectedSlug, navigate]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return (data?.algorithms || []).filter((algo) =>
      [algo.title, algo.className, algo.filename, algo.description]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(q)),
    );
  }, [data, search]);

  const highlighted = useMemo(
    () => (selected?.code ? highlightJava(selected.code) : ""),
    [selected?.code],
  );

  const copyCode = async () => {
    if (!selected?.code) return;
    try {
      await navigator.clipboard.writeText(selected.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <>
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 sm:mb-8 tracking-tight">
        Algorithm{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">
          Templates
        </span>
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${selectedSlug ? "hidden lg:block" : "block"} lg:col-span-1`}>
          <div className="bg-gradient-to-br from-teal-900/40 via-emerald-900/30 to-teal-900/40 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-teal-500/30 p-4 sm:p-6 shadow-2xl shadow-teal-500/20">
            <div className="flex items-center gap-2 mb-4">
              <Code2 className="w-5 h-5 text-teal-400" />
              <h3 className="text-lg font-bold text-white">Library</h3>
            </div>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search algorithms"
                className="w-full bg-gray-800/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              />
            </div>
            <div className="max-h-[65vh] overflow-y-auto pr-1">
              {loading ? (
                <p className="text-white/50 text-sm text-center py-8">Loading templates...</p>
              ) : search.trim() ? (
                filtered.length === 0 ? (
                  <p className="text-white/50 text-sm text-center py-8">No matches.</p>
                ) : (
                  <div className="space-y-2">
                    {filtered.map((algo) => (
                      <button
                        key={algo._id}
                        onClick={() => openFile(algo.slug || algo._id)}
                        className={`w-full text-left rounded-xl p-3 border transition-all ${
                          selectedSlug === (algo.slug || algo._id)
                            ? "bg-teal-500/15 border-teal-500/40"
                            : "bg-white/5 border-white/10 hover:border-teal-500/30"
                        }`}
                      >
                        <p className="text-white font-semibold text-sm">{algo.title}</p>
                        <p className="text-gray-500 text-xs mt-1 truncate">
                          {folderPathLabel(folders, algo.folderId)}
                        </p>
                      </button>
                    ))}
                  </div>
                )
              ) : (
                <AlgorithmTree
                  tree={tree}
                  selectedAlgoId={selectedSlug}
                  onSelectAlgo={openFile}
                  defaultOpen={false}
                />
              )}
            </div>
          </div>
        </div>

        <div className={`${selectedSlug ? "block" : "hidden lg:block"} lg:col-span-2`}>
          <div className="bg-gradient-to-br from-teal-900/40 via-emerald-900/30 to-teal-900/40 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-teal-500/30 p-4 sm:p-6 shadow-2xl shadow-teal-500/20 min-h-[420px]">
            {!selectedSlug ? (
              <div className="h-full min-h-[360px] flex flex-col items-center justify-center text-center text-white/50">
                <Folder className="w-16 h-16 mb-4 text-teal-400/50" />
                <p className="text-xl text-white">Click an algorithm to view its code</p>
                <p className="text-sm mt-2">Browse folders on the left, then select a file.</p>
              </div>
            ) : loadingCode && !selected ? (
              <p className="text-white/50 text-center py-20">Loading source...</p>
            ) : selected ? (
              <div>
                <button
                  type="button"
                  onClick={backToLibrary}
                  className="lg:hidden inline-flex items-center gap-2 mb-4 text-sm text-teal-400 hover:text-teal-300"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to folders
                </button>
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="text-xs text-teal-400/80 mb-1">
                      {folderPathLabel(folders, selected.folderId)}
                    </p>
                    <h3 className="text-2xl font-bold text-white">{selected.title}</h3>
                    {selected.filename && (
                      <p className="text-gray-500 text-xs mt-1">{selected.filename}</p>
                    )}
                    {selected.description && (
                      <p className="text-white/60 text-sm mt-2 max-w-2xl">{selected.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {selected.githubUrl && (
                      <a
                        href={selected.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-teal-400 text-xs font-medium"
                      >
                        <GitBranch className="w-3.5 h-3.5" />
                        GitHub
                      </a>
                    )}
                    <button
                      onClick={copyCode}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-teal-400 text-xs font-medium"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                <pre className="java-code overflow-x-auto rounded-xl border border-white/10 bg-black/50 p-4 text-[13px] leading-6">
                  <code dangerouslySetInnerHTML={{ __html: highlighted }} />
                </pre>
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-white/60 mb-4">This file could not be found.</p>
                <button
                  type="button"
                  onClick={backToLibrary}
                  className="inline-flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to folders
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Algorithms;
