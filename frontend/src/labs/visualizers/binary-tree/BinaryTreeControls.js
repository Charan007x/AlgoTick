import React, { useState } from 'react'

export function BinaryTreeControls({
  onInsert,
  onClear,
  onTraversal,
  traversalHistory,
  isAnimating
}) {
  const [value, setValue] = useState("")

  const handleInsert = () => {
    const num = Number(value)
    if (!isNaN(num)) {
      onInsert(num)
      setValue("")
    }
  }

  return (
    <div className="space-y-4">
      {/* Insert Node Card */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-4">
        <h3 className="text-lg font-semibold mb-4">Insert Node</h3>
        <div className="flex gap-2">
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleInsert()}
            placeholder="Enter value"
            className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded-lg 
                     text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={handleInsert}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg 
                     font-medium transition-colors"
          >
            Insert
          </button>
        </div>
      </div>

      {/* Traversal Controls Card */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-4">
        <h3 className="text-lg font-semibold mb-4">Traversal Controls</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button 
            onClick={() => onTraversal("inorder")} 
            disabled={isAnimating}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium 
                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            In-Order
          </button>
          <button 
            onClick={() => onTraversal("preorder")} 
            disabled={isAnimating}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium 
                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Pre-Order
          </button>
          <button 
            onClick={() => onTraversal("postorder")} 
            disabled={isAnimating}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium 
                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Post-Order
          </button>
          <button 
            onClick={onClear}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium 
                     transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Traversal History */}
      {traversalHistory.length > 0 && (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-4">
          <h3 className="text-lg font-semibold mb-4">Traversal History</h3>
          <div className="flex flex-wrap gap-2">
            {traversalHistory.map((value, index) => (
              <div 
                key={index}
                className="bg-purple-600/20 text-purple-300 px-3 py-1.5 rounded-md 
                         text-sm font-medium border border-purple-500/30"
              >
                {value}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
