import React from 'react'
import { useHeap } from '../../hooks/useHeap'
import { HeapControls } from './HeapControls'
import { HeapDisplay } from './HeapDisplay'

export function HeapVisualizer() {
  const {
    heap,
    heapArray,
    heapType,
    highlightedNodes,
    insert,
    insertMany,
    clear,
    toggleType
  } = useHeap()

  return (
    <div className="w-full h-full grid grid-cols-1 xl:grid-cols-3 gap-6 p-6">
      {/* Controls */}
      <div>
        <HeapControls
          onInsert={insert}
          onInsertMany={insertMany}
          onClear={clear}
          onToggleType={toggleType}
          heapType={heapType}
        />
      </div>

      {/* Display */}
      <div className="xl:col-span-2">
        <HeapDisplay
          heap={heap}
          heapArray={heapArray}
          heapType={heapType}
          highlightedNodes={highlightedNodes}
        />
      </div>
    </div>
  )
}
