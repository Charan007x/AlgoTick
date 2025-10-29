import { useState } from "react"

// Add a counter for generating unique IDs
let nodeIdCounter = 0;

export function useBinaryTree() {
  const [tree, setTree] = useState(null)
  const [highlightedNodes, setHighlightedNodes] = useState([])
  const [traversalHistory, setTraversalHistory] = useState([])
  const [isAnimating, setIsAnimating] = useState(false)

  const insert = (value) => {
    if (isNaN(value)) return

    const newNode = { 
      id: `node-${nodeIdCounter++}`,
      value, 
      left: null, 
      right: null 
    }

    if (!tree) {
      setTree(newNode)
      return
    }

    const insertIntoTree = (node) => {
      if (value <= node.value) {
        if (!node.left) {
          return {
            ...node,
            left: newNode
          }
        }
        return {
          ...node,
          left: insertIntoTree(node.left)
        }
      } else {
        if (!node.right) {
          return {
            ...node,
            right: newNode
          }
        }
        return {
          ...node,
          right: insertIntoTree(node.right)
        }
      }
    }

    setTree(insertIntoTree(tree))
  }

  const traverseWithAnimation = async (
    node,
    visit,
    order
  ) => {
    if (!node) return

    const highlight = (nodeId, value) => {
      setHighlightedNodes(prev => [...prev, nodeId])
      setTraversalHistory(prev => [...prev, value])
      
      setTimeout(() => {
        setHighlightedNodes(prev => prev.filter(id => id !== nodeId))
      }, 1000)
    }

    const wait = () => new Promise(resolve => setTimeout(resolve, 800))

    try {
      if (order === "preorder") {
        highlight(node.id, node.value)
        visit(node)
        await wait()
        if (node.left) await traverseWithAnimation(node.left, visit, order)
        if (node.right) await traverseWithAnimation(node.right, visit, order)
      } else if (order === "inorder") {
        if (node.left) await traverseWithAnimation(node.left, visit, order)
        highlight(node.id, node.value)
        visit(node)
        await wait()
        if (node.right) await traverseWithAnimation(node.right, visit, order)
      } else {
        if (node.left) await traverseWithAnimation(node.left, visit, order)
        if (node.right) await traverseWithAnimation(node.right, visit, order)
        highlight(node.id, node.value)
        visit(node)
        await wait()
      }
    } catch (error) {
      console.error('Traversal error:', error)
      setIsAnimating(false)
    }
  }

  const clear = () => {
    setTree(null)
    setHighlightedNodes([])
    setTraversalHistory([])
  }

  const inorderTraversal = async () => {
    if (isAnimating) return
    setIsAnimating(true)
    setHighlightedNodes([])
    setTraversalHistory([])
    
    try {
      await traverseWithAnimation(tree, (node) => {
        // Traversal in progress
      }, "inorder")
    } finally {
      setTimeout(() => {
        setIsAnimating(false)
      }, 500)
    }
  }

  const preorderTraversal = async () => {
    if (isAnimating) return
    setIsAnimating(true)
    setHighlightedNodes([])
    setTraversalHistory([])

    try {
      await traverseWithAnimation(tree, (node) => {
        // Traversal in progress
      }, "preorder")
    } finally {
      setTimeout(() => {
        setIsAnimating(false)
      }, 500)
    }
  }

  const postorderTraversal = async () => {
    if (isAnimating) return
    setIsAnimating(true)
    setHighlightedNodes([])
    setTraversalHistory([])

    try {
      await traverseWithAnimation(tree, (node) => {
        // Traversal in progress
      }, "postorder")
    } finally {
      setTimeout(() => {
        setIsAnimating(false)
      }, 500)
    }
  }

  return {
    tree,
    setTree,
    highlightedNodes,
    traversalHistory,
    isAnimating,
    insert,
    clear,
    inorderTraversal,
    preorderTraversal,
    postorderTraversal,
  }
}
