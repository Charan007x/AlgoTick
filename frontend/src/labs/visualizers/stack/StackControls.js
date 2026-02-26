import React, { useState } from 'react';

export function StackControls({ onPush, onPop, onClear, isAnimating, isFull, isEmpty }) {
  const [value, setValue] = useState('');

  const handlePush = () => {
    const num = Number(value);
    if (!isNaN(num)) {
      onPush(num);
      setValue('');
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-white font-semibold text-lg">Stack Controls</h3>
      </div>
      <div className="space-y-4">
        {/* Status indicators */}
        <div className="flex gap-2 text-xs">
          {isFull && <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full border border-red-500/30">Stack Full</span>}
          {isEmpty && <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">Stack Empty</span>}
          {isAnimating && <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-500/30">Animating...</span>}
        </div>

        <div className="flex gap-2">
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter value"
            onKeyDown={(e) => e.key === 'Enter' && !isFull && handlePush()}
            disabled={isAnimating || isFull}
            className="flex-1 px-4 py-3 bg-gray-900/80 border border-gray-600/50 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#61dca3] focus:ring-2 focus:ring-[#61dca3]/20 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            onClick={handlePush}
            disabled={isAnimating || isFull}
            className="px-6 py-3 bg-gradient-to-r from-[#61dca3] to-[#61b3dc] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-[#61dca3]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
          >
            Push
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onPop}
            disabled={isAnimating || isEmpty}
            className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Pop
          </button>
          <button
            onClick={onClear}
            disabled={isAnimating || isEmpty}
            className="px-4 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-xl text-red-400 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
