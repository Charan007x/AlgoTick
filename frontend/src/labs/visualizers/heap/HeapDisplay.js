import React from 'react'
import { motion } from 'framer-motion'

export function HeapDisplay({ heap, heapArray, heapType, highlightedNodes }) {
  if (!heap) {
    return (
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 
                    p-12 h-[600px] flex items-center justify-center">
        <p className="text-white/50 text-lg">Insert values to visualize the heap</p>
      </div>
    )
  }

  // Calculate positions for tree nodes (similar to BinaryTree approach)
  const calculatePositions = (node, x, y, level, positions = new Map(), baseSpacing = 150) => {
    if (!node) return positions

    const horizontalSpacing = baseSpacing / Math.pow(2, level)
    positions.set(node.id, { x, y, value: node.value })

    if (node.left) {
      calculatePositions(node.left, x - horizontalSpacing, y + 80, level + 1, positions, baseSpacing)
    }
    if (node.right) {
      calculatePositions(node.right, x + horizontalSpacing, y + 80, level + 1, positions, baseSpacing)
    }

    return positions
  }

  // Render edges between nodes
  const renderEdges = (node, positions) => {
    if (!node) return []

    const edges = []
    const pos = positions.get(node.id)

    if (node.left) {
      const leftPos = positions.get(node.left.id)
      edges.push(
        <line
          key={`edge-${node.id}-left`}
          x1={pos.x}
          y1={pos.y + 25}
          x2={leftPos.x}
          y2={leftPos.y - 25}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="2"
        />
      )
      edges.push(...renderEdges(node.left, positions))
    }

    if (node.right) {
      const rightPos = positions.get(node.right.id)
      edges.push(
        <line
          key={`edge-${node.id}-right`}
          x1={pos.x}
          y1={pos.y + 25}
          x2={rightPos.x}
          y2={rightPos.y - 25}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="2"
        />
      )
      edges.push(...renderEdges(node.right, positions))
    }

    return edges
  }

  // Render nodes
  const renderNodes = (positions) => {
    const nodes = []
    positions.forEach((pos, nodeId) => {
      const isHighlighted = highlightedNodes.includes(nodeId)
      nodes.push(
        <motion.g
          key={nodeId}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <circle
            cx={pos.x}
            cy={pos.y}
            r="25"
            fill={isHighlighted 
              ? 'rgba(97, 220, 163, 0.3)'
              : 'rgba(255, 255, 255, 0.1)'
            }
            stroke="#61dca3"
            strokeWidth="2"
          />
          <text
            x={pos.x}
            y={pos.y + 5}
            textAnchor="middle"
            fill="white"
            fontSize="16"
            fontWeight="bold"
          >
            {pos.value}
          </text>
        </motion.g>
      )
    })
    return nodes
  }

  // Calculate tree depth for proper sizing
  const getTreeDepth = (node) => {
    if (!node) return 0
    return 1 + Math.max(getTreeDepth(node.left), getTreeDepth(node.right))
  }

  const treeDepth = getTreeDepth(heap)
  const baseSpacing = Math.max(100, treeDepth * 40)
  const centerX = 400
  const positions = calculatePositions(heap, centerX, 50, 0, new Map(), baseSpacing)

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 h-[600px] overflow-auto custom-scrollbar">
      {/* Heap Info */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: 'rgba(97, 220, 163, 0.2)',
                color: '#61dca3',
                border: '1px solid #61dca3'
              }}
            >
              {heapType === 'max' ? 'MAX HEAP' : 'MIN HEAP'}
            </div>
            <div>
              <span className="text-white/70 text-sm">Array:</span>
              <span className="ml-2 text-white font-mono">
                [{heapArray.join(', ')}]
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-white/70 text-sm">Size:</span>
            <span className="ml-2 text-white font-mono">{heapArray.length}</span>
          </div>
        </div>
      </div>

      {/* Tree Visualization */}
      <div className="p-6">
        <svg
          width="100%"
          height="500"
          viewBox="0 0 800 500"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Render edges first (behind nodes) */}
          {renderEdges(heap, positions)}
          {/* Render nodes on top */}
          {renderNodes(positions)}
        </svg>
      </div>
    </div>
  )
}
