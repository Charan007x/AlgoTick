import React from 'react';

export function StackDisplay({ stack, highlightedIndex }) {
  return (
    <div className="relative h-[450px] bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 flex items-center justify-center">
      <div className="relative w-48 h-full border-2 border-[#61dca3]/50 rounded-lg overflow-hidden">
        {/* Stack pointer */}
        <div
          className="absolute right-full mr-4 flex items-center text-[#61dca3]"
          style={{
            top: stack.length > 0 ? `${64 * (6 - stack.length)}px` : 'calc(100% - 64px)'
          }}
        >
          <span className="mr-2 font-mono">top</span>
          <span className="text-xl">→</span>
        </div>

        {/* Stack elements */}
        <div className="absolute bottom-0 left-0 right-0 flex flex-col-reverse">
          {stack.map((node) => (
            <div
              key={node.id}
              style={{
                backgroundColor: highlightedIndex === node.index
                  ? 'rgba(97, 220, 163, 0.3)'
                  : 'rgba(255, 255, 255, 0.1)'
              }}
              className="h-16 border-t border-white/20 flex items-center justify-center"
            >
              <span className={`text-lg font-mono ${
                highlightedIndex === node.index ? 'text-white font-bold' : 'text-white/80'
              }`}>
                {node.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
