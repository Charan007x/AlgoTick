import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

export function BinaryTreeDisplay({ tree, highlightedNodes }) {
  const svgRef = useRef(null);
  const [zoom, setZoom] = useState(1);

  // Calculate tree depth to determine sizing
  const getTreeDepth = (node) => {
    if (!node) return 0;
    return 1 + Math.max(getTreeDepth(node.left), getTreeDepth(node.right));
  };

  // Calculate positions for tree nodes with dynamic spacing
  const calculatePositions = (node, x, y, level, positions = new Map(), baseSpacing = 150) => {
    if (!node) return positions;

    const horizontalSpacing = baseSpacing / Math.pow(2, level);
    
    positions.set(node.id, { x, y, value: node.value });

    if (node.left) {
      calculatePositions(node.left, x - horizontalSpacing, y + 100, level + 1, positions, baseSpacing);
    }
    if (node.right) {
      calculatePositions(node.right, x + horizontalSpacing, y + 100, level + 1, positions, baseSpacing);
    }

    return positions;
  };

  // Draw lines between nodes
  const renderEdges = (node, positions) => {
    if (!node) return [];

    const edges = [];
    const pos = positions.get(node.id);

    if (node.left) {
      const leftPos = positions.get(node.left.id);
      edges.push(
        <line
          key={`edge-${node.id}-${node.left.id}`}
          x1={pos.x}
          y1={pos.y}
          x2={leftPos.x}
          y2={leftPos.y}
          stroke="#4b5563"
          strokeWidth="2"
        />
      );
      edges.push(...renderEdges(node.left, positions));
    }

    if (node.right) {
      const rightPos = positions.get(node.right.id);
      edges.push(
        <line
          key={`edge-${node.id}-${node.right.id}`}
          x1={pos.x}
          y1={pos.y}
          x2={rightPos.x}
          y2={rightPos.y}
          stroke="#4b5563"
          strokeWidth="2"
        />
      );
      edges.push(...renderEdges(node.right, positions));
    }

    return edges;
  };

  // Render tree nodes
  const renderNodes = (positions) => {
    const nodes = [];
    positions.forEach((pos, nodeId) => {
      const isHighlighted = highlightedNodes.includes(nodeId);
      nodes.push(
        <g key={nodeId}>
          <circle
            cx={pos.x}
            cy={pos.y}
            r="25"
            fill={isHighlighted ? '#3b82f6' : '#1f2937'}
            stroke={isHighlighted ? '#60a5fa' : '#4b5563'}
            strokeWidth="2"
          />
          <text
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="16"
            fontWeight="bold"
          >
            {pos.value}
          </text>
        </g>
      );
    });
    return nodes;
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  if (!tree) {
    return (
      <div className="h-[600px] bg-gray-800 rounded-lg flex items-center justify-center">
        <p className="text-gray-400 text-lg">Insert values to build a tree</p>
      </div>
    );
  }

  const treeDepth = getTreeDepth(tree);
  const baseSpacing = Math.max(150, treeDepth * 50);
  const svgWidth = Math.max(800, baseSpacing * 4);
  const svgHeight = Math.max(600, treeDepth * 120);
  const centerX = svgWidth / 2;
  
  const positions = calculatePositions(tree, centerX, 60, 0, new Map(), baseSpacing);

  return (
    <div className="relative h-[600px] bg-gray-800 rounded-lg">
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={handleResetZoom}
          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          title="Reset Zoom (100%)"
        >
          <Maximize2 className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5 text-white" />
        </button>
        <div className="px-3 py-2 bg-gray-700 rounded-lg text-white text-sm font-mono">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* Scrollable Tree Container */}
      <div 
        className="h-full p-6 overflow-auto custom-scrollbar"
      >
        <svg 
          ref={svgRef} 
          width={svgWidth * zoom} 
          height={svgHeight * zoom}
          className="mx-auto"
          style={{ minWidth: '100%' }}
        >
          <g transform={`scale(${zoom})`}>
            {renderEdges(tree, positions)}
            {renderNodes(positions)}
          </g>
        </svg>
      </div>
    </div>
  );
}
