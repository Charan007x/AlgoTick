import React from 'react';

export function QueueDisplay({ queue, highlightedIndex }) {
  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
      <h3 className="text-xl font-bold text-white mb-4">Queue Visualization</h3>
      
      <div className="relative">
        {/* Front/Rear Labels */}
        {queue.length > 0 && (
          <div className="flex justify-between mb-2">
            <div className="text-sm font-semibold text-[#61dca3]">← Front</div>
            <div className="text-sm font-semibold text-[#61dca3]">Rear →</div>
          </div>
        )}

        {/* Queue Container */}
        <div className="h-[200px] bg-gray-800/50 rounded-xl p-6 border-2 border-[#61dca3]/50 flex items-center justify-center">
          {queue.length === 0 ? (
            <div className="text-white/40">
              Queue is empty
            </div>
          ) : (
            <div className="flex gap-3 items-center">
              {queue.map((node, index) => (
                <div
                  key={node.id}
                  style={{
                    backgroundColor: highlightedIndex === index ? '#61dca3' : 'rgba(255, 255, 255, 0.1)'
                  }}
                  className="flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center text-xl font-bold text-white border-2 border-white/20"
                >
                  {node.value}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Queue Info */}
        <div className="mt-4 flex justify-between text-sm text-white/60">
          <span>Size: {queue.length}</span>
          <span>Front: {queue.length > 0 ? queue[0].value : 'N/A'}</span>
          <span>Rear: {queue.length > 0 ? queue[queue.length - 1].value : 'N/A'}</span>
        </div>
      </div>
    </div>
  );
}
