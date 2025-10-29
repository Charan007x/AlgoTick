import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const BinaryTreeControls = ({ 
  onInsert, 
  onClear, 
  onTraversal, 
  traversalHistory, 
  isAnimating 
}) => {
  const [value, setValue] = useState('');

  const handleInsert = () => {
    const num = Number(value);
    if (!isNaN(num)) {
      onInsert(num);
      setValue('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
        <h3 className="text-lg font-semibold mb-4">Insert Node</h3>
        <div className="flex gap-2">
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleInsert()}
            placeholder="Enter value"
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleInsert}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg font-medium transition-colors"
          >
            Insert
          </button>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
        <h3 className="text-lg font-semibold mb-4">Traversal Controls</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onTraversal('inorder')}
            disabled={isAnimating}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            In-Order
          </button>
          <button
            onClick={() => onTraversal('preorder')}
            disabled={isAnimating}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Pre-Order
          </button>
          <button
            onClick={() => onTraversal('postorder')}
            disabled={isAnimating}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Post-Order
          </button>
          <button
            onClick={onClear}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-medium transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {traversalHistory.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <h3 className="text-lg font-semibold mb-4">Traversal History</h3>
          <div className="flex flex-wrap gap-2">
            {traversalHistory.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-purple-500/20 text-purple-300 px-3 py-1.5 rounded-md text-sm font-medium border border-purple-500/30"
              >
                {value}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
