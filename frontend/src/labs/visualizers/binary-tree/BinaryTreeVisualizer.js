import React, { useState } from 'react';
import { BinaryTreeDisplay } from "./BinaryTreeDisplay";
import { useBinaryTree } from "../../hooks/useBinaryTree";
import { Play, RotateCcw, AlertCircle } from "lucide-react";

export function BinaryTreeVisualizer() {
  const treeHook = useBinaryTree();
  const [input, setInput] = useState('1, 2, 3, n, 5, 6');
  const [error, setError] = useState('');
  const [isBuilt, setIsBuilt] = useState(false);

  // Build tree from level-order array directly
  const buildTreeFromArray = (values) => {
    if (!values || values.length === 0 || values[0] === null) return null;
    
    let nodeIdCounter = 0;
    const root = { 
      id: `node-${nodeIdCounter++}`,
      value: values[0], 
      left: null, 
      right: null 
    };
    
    const queue = [root];
    let i = 1;
    
    while (queue.length > 0 && i < values.length) {
      const node = queue.shift();
      
      // Left child
      if (i < values.length && values[i] !== null) {
        node.left = { 
          id: `node-${nodeIdCounter++}`,
          value: values[i], 
          left: null, 
          right: null 
        };
        queue.push(node.left);
      }
      i++;
      
      // Right child
      if (i < values.length && values[i] !== null) {
        node.right = { 
          id: `node-${nodeIdCounter++}`,
          value: values[i], 
          left: null, 
          right: null 
        };
        queue.push(node.right);
      }
      i++;
    }
    
    return root;
  };

  const handleBuildTree = async () => {
    if (!input.trim()) {
      setError('Please enter tree values (e.g., 1,2,3,n,5,6)');
      return;
    }

    try {
      // Parse the input
      const values = input
        .split(',')
        .map(v => v.trim())
        .map(v => v.toLowerCase() === 'n' || v.toLowerCase() === 'null' ? null : parseInt(v, 10));
      
      if (values.length === 0 || values[0] === null) {
        setError('Root node cannot be null');
        return;
      }

      // Check for invalid numbers
      for (let i = 0; i < values.length; i++) {
        if (values[i] !== null && isNaN(values[i])) {
          setError(`Invalid value at position ${i + 1}: "${input.split(',')[i].trim()}"`);
          return;
        }
      }

      // Build the complete tree
      const tree = buildTreeFromArray(values);
      treeHook.setTree(tree);
      setIsBuilt(true);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClear = () => {
    treeHook.clear();
    setIsBuilt(false);
    setError('');
  };

  const handleTraversal = async (type) => {
    if (!isBuilt) {
      setError('Please build the tree first');
      return;
    }
    
    setError('');
    
    switch (type) {
      case 'inorder':
        await treeHook.inorderTraversal();
        break;
      case 'preorder':
        await treeHook.preorderTraversal();
        break;
      case 'postorder':
        await treeHook.postorderTraversal();
        break;
      case 'levelorder':
        await treeHook.levelOrderTraversal();
        break;
      default:
        break;
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="xl:col-span-1 space-y-6">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4">Build Tree</h3>
                <div className="space-y-4">
                  {/* Input Area */}
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">
                      Enter values (use 'n' for null)
                    </label>
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="1, 2, 3, n, 5, 6"
                      className="w-full h-24 px-3 py-2 bg-gray-900/80 border border-gray-600/50 rounded-xl text-white font-mono text-sm resize-none focus:outline-none focus:border-[#61dca3] focus:ring-2 focus:ring-[#61dca3]/20 placeholder:text-gray-500"
                      disabled={treeHook.isAnimating}
                    />
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  )}

                  {/* Build Button */}
                  <div className="flex gap-2">
                    <button 
                      onClick={handleBuildTree}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-[#61dca3] to-[#61b3dc] hover:from-[#61dca3]/90 hover:to-[#61b3dc]/90 text-white font-medium shadow-lg shadow-[#61dca3]/20 transition-all rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      disabled={treeHook.isAnimating}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Build
                    </button>
                    <button 
                      onClick={handleClear}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      disabled={treeHook.isAnimating}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Traversal Controls */}
              {isBuilt && (
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                  <h3 className="text-white font-semibold mb-4">Traversals</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleTraversal('inorder')}
                      disabled={treeHook.isAnimating}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
                    >
                      Inorder <span className="text-gray-400 text-xs ml-2">(L-Root-R)</span>
                    </button>
                    <button
                      onClick={() => handleTraversal('preorder')}
                      disabled={treeHook.isAnimating}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
                    >
                      Preorder <span className="text-gray-400 text-xs ml-2">(Root-L-R)</span>
                    </button>
                    <button
                      onClick={() => handleTraversal('postorder')}
                      disabled={treeHook.isAnimating}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
                    >
                      Postorder <span className="text-gray-400 text-xs ml-2">(L-R-Root)</span>
                    </button>
                    <button
                      onClick={() => handleTraversal('levelorder')}
                      disabled={treeHook.isAnimating}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
                    >
                      Level Order <span className="text-gray-400 text-xs ml-2">(BFS)</span>
                    </button>
                    
                    {treeHook.traversalHistory.length > 0 && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-[#61dca3]/10 to-[#61b3dc]/10 border border-[#61dca3]/20 rounded-xl">
                        <div className="text-xs text-gray-400 mb-2">Result:</div>
                        <div className="text-sm text-white font-mono">
                          {treeHook.traversalHistory.join(' → ')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Visualization */}
            <div className="xl:col-span-2">
              <BinaryTreeDisplay 
                tree={treeHook.tree}
                highlightedNodes={treeHook.highlightedNodes}
              />
            </div>
          </div>
        </div>
    );
  }
