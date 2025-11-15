import React, { useState } from 'react'

export function HeapControls({
  onInsert,
  onInsertMany,
  onClear,
  onToggleType,
  heapType
}) {
  const [value, setValue] = useState("")
  const [bulkInput, setBulkInput] = useState("")

  const handleInsert = () => {
    const num = Number(value)
    if (!isNaN(num)) {
      onInsert(num)
      setValue("")
    }
  }

  const handleBulkInsert = () => {
    const values = bulkInput
      .split(',')
      .map(v => Number(v.trim()))
      .filter(v => !isNaN(v))
    
    if (values.length > 0) {
      onInsertMany(values)
      setBulkInput("")
    }
  }

  return (
    <div className="space-y-4">
      {/* Heap Type Toggle */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Heap Type</h3>
          <button
            onClick={onToggleType}
            className="relative inline-flex h-8 w-16 items-center rounded-full 
                     transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 
                     focus:ring-offset-gray-900"
            style={{
              backgroundColor: heapType === 'max' ? '#ef4444' : '#3b82f6',
              boxShadow: heapType === 'max' ? '0 0 10px rgba(239, 68, 68, 0.3)' : '0 0 10px rgba(59, 130, 246, 0.3)'
            }}
          >
            <span
              className="inline-block h-6 w-6 transform rounded-full bg-white shadow-lg 
                       transition-transform"
              style={{
                transform: heapType === 'max' ? 'translateX(2.25rem)' : 'translateX(0.25rem)'
              }}
            />
          </button>
        </div>
        <p className="text-sm text-white/70">
          {heapType === 'max' ? 'Max Heap' : 'Min Heap'}
        </p>
      </div>

      {/* Single Insert */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-4">
        <h3 className="text-lg font-semibold mb-4 text-white">Single Insert</h3>
        <div className="flex gap-2">
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleInsert()}
            placeholder="Enter value"
            className="flex-1 px-3 py-2 bg-gray-900/80 border border-gray-600/50 rounded-lg 
                     text-white placeholder-white/40 focus:outline-none focus:border-[#61dca3] 
                     focus:ring-2 focus:ring-[#61dca3]/20 transition-all"
          />
          <button
            onClick={handleInsert}
            className="px-4 py-2 bg-gradient-to-r from-[#61dca3] to-[#61b3dc] hover:shadow-lg 
                     hover:shadow-[#61dca3]/30 rounded-lg font-medium transition-all text-white"
          >
            Insert
          </button>
        </div>
      </div>

      {/* Bulk Insert */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-4">
        <h3 className="text-lg font-semibold mb-4 text-white">Bulk Insert</h3>
        <div className="space-y-2">
          <input
            value={bulkInput}
            onChange={(e) => setBulkInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleBulkInsert()}
            placeholder="e.g., 1, 2, 3, 4"
            className="w-full px-3 py-2 bg-gray-900/80 border border-gray-600/50 rounded-lg 
                     text-white placeholder-white/40 focus:outline-none focus:border-[#61dca3] 
                     focus:ring-2 focus:ring-[#61dca3]/20 transition-all"
          />
          <button
            onClick={handleBulkInsert}
            className="w-full px-4 py-2 bg-gradient-to-r from-[#61dca3] to-[#61b3dc] 
                     hover:shadow-lg hover:shadow-[#61dca3]/30 rounded-lg font-medium 
                     transition-all text-white"
          >
            Insert All
          </button>
        </div>
      </div>

      {/* Clear Button */}
      <button
        onClick={onClear}
        className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 
                 rounded-lg text-red-400 font-medium transition-all"
      >
        Clear Heap
      </button>
    </div>
  )
}
