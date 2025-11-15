import React from 'react';

export function QueueOperations({ operations }) {
  if (operations.length === 0) return null;

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
      <h3 className="text-xl font-bold text-white mb-4">Operations History</h3>
      
      <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
        {operations.map((op, index) => (
          <div
            key={index}
            className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-lg"
          >
            <span className={`text-lg ${op.type === 'enqueue' ? 'text-green-400' : 'text-red-400'}`}>
              {op.type === 'enqueue' ? '←' : '→'}
            </span>
            <span className="text-white/80 flex-1">
              {op.type === 'enqueue' ? 'Enqueued' : 'Dequeued'}
            </span>
            <span className="text-white font-mono font-bold">
              {op.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
