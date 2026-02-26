import React, { useState } from 'react';

const HeapVisualizer = () => {
  const [heap, setHeap] = useState([]);
  const [heapType, setHeapType] = useState('min'); // 'min' or 'max'
  const [inputValue, setInputValue] = useState('');
  const [animatingIndices, setAnimatingIndices] = useState([]);
  const [swappingIndices, setSwappingIndices] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(null);
  const [message, setMessage] = useState('');

  // Helper functions
  const getParentIndex = (i) => Math.floor((i - 1) / 2);
  const getLeftChildIndex = (i) => 2 * i + 1;
  const getRightChildIndex = (i) => 2 * i + 2;

  const compare = (a, b) => {
    return heapType === 'min' ? a < b : a > b;
  };

  // Heapify up animation
  const heapifyUp = async (index, newHeap) => {
    if (index === 0) return newHeap;

    const parentIndex = getParentIndex(index);
    setAnimatingIndices([index, parentIndex]);
    await sleep(500);

    if (compare(newHeap[index], newHeap[parentIndex])) {
      setSwappingIndices([index, parentIndex]);
      setMessage(`Swapping ${newHeap[index]} with ${newHeap[parentIndex]}`);
      await sleep(800);

      // Swap
      [newHeap[index], newHeap[parentIndex]] = [newHeap[parentIndex], newHeap[index]];
      setHeap([...newHeap]);
      setSwappingIndices([]);
      await sleep(500);

      return heapifyUp(parentIndex, newHeap);
    }

    setAnimatingIndices([]);
    return newHeap;
  };

  // Heapify down animation
  const heapifyDown = async (index, newHeap) => {
    const leftIndex = getLeftChildIndex(index);
    const rightIndex = getRightChildIndex(index);
    let targetIndex = index;

    if (leftIndex < newHeap.length && compare(newHeap[leftIndex], newHeap[targetIndex])) {
      targetIndex = leftIndex;
    }

    if (rightIndex < newHeap.length && compare(newHeap[rightIndex], newHeap[targetIndex])) {
      targetIndex = rightIndex;
    }

    if (targetIndex !== index) {
      setAnimatingIndices([index, targetIndex]);
      setMessage(`Comparing ${newHeap[index]} with children`);
      await sleep(500);

      setSwappingIndices([index, targetIndex]);
      setMessage(`Swapping ${newHeap[index]} with ${newHeap[targetIndex]}`);
      await sleep(800);

      // Swap
      [newHeap[index], newHeap[targetIndex]] = [newHeap[targetIndex], newHeap[index]];
      setHeap([...newHeap]);
      setSwappingIndices([]);
      await sleep(500);

      return heapifyDown(targetIndex, newHeap);
    }

    setAnimatingIndices([]);
    setMessage('');
    return newHeap;
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Insert element
  const handleInsert = async () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) {
      setMessage('⚠️ Please enter a valid number');
      return;
    }

    setMessage(`Inserting ${value} into the heap...`);
    const newHeap = [...heap, value];
    setHeap(newHeap);
    setHighlightIndex(newHeap.length - 1);
    await sleep(500);

    await heapifyUp(newHeap.length - 1, newHeap);
    
    setHighlightIndex(null);
    setAnimatingIndices([]);
    setMessage(`✅ ${value} inserted successfully!`);
    setInputValue('');
    
    setTimeout(() => setMessage(''), 2000);
  };

  // Extract root (min/max)
  const handleExtract = async () => {
    if (heap.length === 0) {
      setMessage('⚠️ Heap is empty!');
      return;
    }

    const root = heap[0];
    setMessage(`Extracting ${heapType === 'min' ? 'minimum' : 'maximum'}: ${root}`);
    setHighlightIndex(0);
    await sleep(1000);

    if (heap.length === 1) {
      setHeap([]);
      setHighlightIndex(null);
      setMessage(`✅ Extracted ${root}`);
      setTimeout(() => setMessage(''), 2000);
      return;
    }

    // Move last element to root
    const newHeap = [...heap];
    newHeap[0] = newHeap[newHeap.length - 1];
    newHeap.pop();
    setHeap(newHeap);
    setHighlightIndex(null);
    await sleep(500);

    await heapifyDown(0, newHeap);
    
    setMessage(`✅ Extracted ${root}`);
    setTimeout(() => setMessage(''), 2000);
  };

  // Clear heap
  const handleClear = () => {
    setHeap([]);
    setAnimatingIndices([]);
    setSwappingIndices([]);
    setHighlightIndex(null);
    setMessage('');
  };

  // Build heap from array
  const handleBuildHeap = async () => {
    const values = inputValue.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v));
    if (values.length === 0) {
      setMessage('⚠️ Please enter comma-separated numbers (e.g., 5,2,8,1,9)');
      return;
    }

    setMessage('Building heap from array...');
    setHeap(values);
    await sleep(1000);

    // Heapify from bottom to top
    for (let i = Math.floor(values.length / 2) - 1; i >= 0; i--) {
      await heapifyDown(i, values);
    }

    setMessage('✅ Heap built successfully!');
    setInputValue('');
    setTimeout(() => setMessage(''), 2000);
  };

  // Calculate tree position
  const getTreePosition = (index, level, positionInLevel, totalInLevel) => {
    const levelHeight = 80;
    const baseWidth = 600;
    const y = level * levelHeight + 50;
    const spacing = baseWidth / (totalInLevel + 1);
    const x = spacing * (positionInLevel + 1);
    return { x, y };
  };

  // Render tree structure
  const renderTree = () => {
    if (heap.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-white/60">
          <div className="text-center">
            <div className="text-4xl mb-2">🌳</div>
            <div>Heap is empty. Add some elements!</div>
          </div>
        </div>
      );
    }

    const levels = Math.ceil(Math.log2(heap.length + 1));
    const nodes = [];
    const edges = [];

    heap.forEach((value, index) => {
      const level = Math.floor(Math.log2(index + 1));
      const positionInLevel = index - (Math.pow(2, level) - 1);
      const totalInLevel = Math.pow(2, level);
      const pos = getTreePosition(index, level, positionInLevel, totalInLevel);

      // Add edges to children
      const leftChild = getLeftChildIndex(index);
      const rightChild = getRightChildIndex(index);

      if (leftChild < heap.length) {
        const leftLevel = Math.floor(Math.log2(leftChild + 1));
        const leftPos = getTreePosition(
          leftChild,
          leftLevel,
          leftChild - (Math.pow(2, leftLevel) - 1),
          Math.pow(2, leftLevel)
        );
        edges.push(
          <line
            key={`edge-${index}-${leftChild}`}
            x1={pos.x}
            y1={pos.y}
            x2={leftPos.x}
            y2={leftPos.y}
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="2"
          />
        );
      }

      if (rightChild < heap.length) {
        const rightLevel = Math.floor(Math.log2(rightChild + 1));
        const rightPos = getTreePosition(
          rightChild,
          rightLevel,
          rightChild - (Math.pow(2, rightLevel) - 1),
          Math.pow(2, rightLevel)
        );
        edges.push(
          <line
            key={`edge-${index}-${rightChild}`}
            x1={pos.x}
            y1={pos.y}
            x2={rightPos.x}
            y2={rightPos.y}
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="2"
          />
        );
      }

      // Determine node color
      let nodeColor = '#61dca3';
      let nodeClass = 'transition-all duration-500';
      
      if (highlightIndex === index) {
        nodeColor = '#61b3dc';
        nodeClass += ' animate-pulse';
      } else if (swappingIndices.includes(index)) {
        nodeColor = '#eab308';
        nodeClass += ' animate-bounce';
      } else if (animatingIndices.includes(index)) {
        nodeColor = '#ef4444';
      }

      nodes.push(
        <g key={`node-${index}`} className={nodeClass}>
          <circle
            cx={pos.x}
            cy={pos.y}
            r="25"
            fill={nodeColor}
            stroke="white"
            strokeWidth="2"
          />
          <text
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="black"
            fontSize="16"
            fontWeight="bold"
          >
            {value}
          </text>
          <text
            x={pos.x}
            y={pos.y + 40}
            textAnchor="middle"
            fill="rgba(255, 255, 255, 0.5)"
            fontSize="10"
          >
            [{index}]
          </text>
        </g>
      );
    });

    return (
      <div className="overflow-x-auto">
        <svg width="600" height={levels * 80 + 100} className="mx-auto">
          {edges}
          {nodes}
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Heap Type Selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setHeapType('min')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all ${
              heapType === 'min'
                ? 'bg-[#61dca3] text-black'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Min Heap
          </button>
          <button
            onClick={() => setHeapType('max')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all ${
              heapType === 'max'
                ? 'bg-[#61b3dc] text-black'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Max Heap
          </button>
        </div>

        {/* Input and Actions */}
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleInsert()}
            placeholder="Enter number or comma-separated values"
            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#61dca3]"
          />
          <button
            onClick={handleInsert}
            className="px-4 py-2 bg-[#61dca3] text-black rounded-xl font-semibold hover:bg-[#61dca3]/80 transition-all"
          >
            Insert
          </button>
          <button
            onClick={handleBuildHeap}
            className="px-4 py-2 bg-[#61b3dc] text-black rounded-xl font-semibold hover:bg-[#61b3dc]/80 transition-all"
          >
            Build Heap
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleExtract}
            className="px-4 py-2 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all border border-white/20"
          >
            Extract {heapType === 'min' ? 'Min' : 'Max'}
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl font-semibold hover:bg-red-500/30 transition-all border border-red-500/40"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className="bg-[#61dca3]/10 border border-[#61dca3]/30 rounded-xl p-3 text-white text-center">
          {message}
        </div>
      )}

      {/* Array Representation */}
      <div className="bg-white/5 rounded-xl p-4">
        <div className="text-white/60 text-sm mb-2">Array Representation:</div>
        <div className="flex gap-2 flex-wrap">
          {heap.length === 0 ? (
            <div className="text-white/40">[]</div>
          ) : (
            heap.map((value, index) => (
              <div
                key={index}
                className={`px-3 py-2 rounded-lg font-mono transition-all ${
                  highlightIndex === index
                    ? 'bg-[#61b3dc] text-black animate-pulse'
                    : swappingIndices.includes(index)
                    ? 'bg-yellow-500 text-black'
                    : animatingIndices.includes(index)
                    ? 'bg-red-500 text-white'
                    : 'bg-white/10 text-white'
                }`}
              >
                {value}
                <span className="text-xs ml-1 opacity-50">[{index}]</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Tree Visualization */}
      <div className="bg-black/30 rounded-xl p-6 min-h-[300px]">
        <div className="text-white font-semibold mb-4 text-center">
          Tree Structure ({heapType === 'min' ? 'Min' : 'Max'} Heap)
        </div>
        {renderTree()}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#61dca3]"></div>
          <span className="text-white/60">Normal Node</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#61b3dc] animate-pulse"></div>
          <span className="text-white/60">Newly Added</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-red-500"></div>
          <span className="text-white/60">Comparing</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-yellow-500"></div>
          <span className="text-white/60">Swapping</span>
        </div>
      </div>
    </div>
  );
};

export default HeapVisualizer;
