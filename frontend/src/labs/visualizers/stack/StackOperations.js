import React from 'react';

export function StackOperations({ operations }) {
  if (operations.length === 0) return null;

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
      <h3 className="text-white font-semibold mb-4">Operation History</h3>
      <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
        {operations.map((op) => (
          <div
            key={op.timestamp}
            className="flex items-center gap-2 text-sm text-white/80"
          >
            {op.type === 'push' ? (
              <>
                <span className="text-green-400">↓</span>
                <span>Push: {op.value}</span>
              </>
            ) : (
              <>
                <span className="text-red-400">↑</span>
                <span>Pop: {op.value}</span>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
