import React, { useState } from 'react';

export function QueueControls({ onEnqueue, onDequeue, onClear, isAnimating, isFull, isEmpty }) {
  const [inputValue, setInputValue] = useState('');

  const handleEnqueue = () => {
    const value = parseInt(inputValue);
    if (!isNaN(value) && inputValue.trim() !== '') {
      onEnqueue(value);
      setInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleEnqueue();
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🚶</span>
        <h3 className="text-white font-semibold text-lg">Queue Controls</h3>
      </div>
      
      <div className="space-y-4">
        {/* Status indicators */}
        <div className="flex gap-2 text-xs">
          {isFull && <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full border border-red-500/30">Queue Full</span>}
          {isEmpty && <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">Queue Empty</span>}
          {isAnimating && <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-500/30">Animating...</span>}
        </div>

        <div>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter value"
            disabled={isAnimating || isFull}
            className="w-full px-4 py-3 bg-gray-900/80 border border-gray-600/50 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#61dca3] focus:ring-2 focus:ring-[#61dca3]/20 transition-all disabled:opacity-50"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleEnqueue}
            disabled={isAnimating || isFull || !inputValue}
            className="px-4 py-3 bg-gradient-to-r from-[#61dca3] to-[#61b3dc] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#61dca3]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
          >
            Enqueue
          </button>
          <button
            onClick={onDequeue}
            disabled={isAnimating || isEmpty}
            className="px-4 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Dequeue
          </button>
        </div>

        <button
          onClick={onClear}
          disabled={isAnimating || isEmpty}
          className="w-full px-4 py-3 bg-red-500/20 text-red-400 font-medium rounded-xl hover:bg-red-500/30 border border-red-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear Queue
        </button>
      </div>
    </div>
  );
}
