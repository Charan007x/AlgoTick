import { useState } from "react"

let nodeIdCounter = 0

export function useHeap() {
  const [heap, setHeap] = useState(null)
  const [heapArray, setHeapArray] = useState([])
  const [heapType, setHeapType] = useState('max')
  const [highlightedNodes, setHighlightedNodes] = useState([])

  const shouldSwap = (parent, child) => {
    if (heapType === 'max') {
      return parent < child
    }
    return parent > child
  }

  const heapifyUp = (array, index) => {
    const parentIndex = Math.floor((index - 1) / 2)
    
    if (parentIndex >= 0 && shouldSwap(array[parentIndex], array[index])) {
      // Swap
      [array[parentIndex], array[index]] = [array[index], array[parentIndex]]
      heapifyUp(array, parentIndex)
    }
  }

  const arrayToTree = (array, index = 0) => {
    if (index >= array.length) return null

    return {
      id: `node-${nodeIdCounter++}`,
      value: array[index],
      left: arrayToTree(array, 2 * index + 1),
      right: arrayToTree(array, 2 * index + 2)
    }
  }

  const insert = (value) => {
    if (isNaN(value)) return

    const newArray = [...heapArray, value]
    heapifyUp(newArray, newArray.length - 1)
    
    setHeapArray(newArray)
    nodeIdCounter = 0
    setHeap(arrayToTree(newArray))
  }

  const insertMany = (values) => {
    let newArray = [...heapArray]
    
    values.forEach(value => {
      if (!isNaN(value)) {
        newArray.push(value)
        heapifyUp(newArray, newArray.length - 1)
      }
    })
    
    setHeapArray(newArray)
    nodeIdCounter = 0
    setHeap(arrayToTree(newArray))
  }

  const clear = () => {
    setHeap(null)
    setHeapArray([])
    setHighlightedNodes([])
    nodeIdCounter = 0
  }

  const toggleType = () => {
    const newType = heapType === 'max' ? 'min' : 'max'
    setHeapType(newType)
    
    // Rebuild heap with new type
    if (heapArray.length > 0) {
      const values = [...heapArray]
      setHeap(null)
      setHeapArray([])
      setHighlightedNodes([])
      nodeIdCounter = 0
      
      // Rebuild with new type in next tick
      setTimeout(() => {
        let newArray = []
        values.forEach(value => {
          if (!isNaN(value)) {
            newArray.push(value)
            heapifyUp(newArray, newArray.length - 1)
          }
        })
        setHeapArray(newArray)
        nodeIdCounter = 0
        setHeap(arrayToTree(newArray))
      }, 50)
    }
  }

  return {
    heap,
    heapArray,
    heapType,
    highlightedNodes,
    insert,
    insertMany,
    clear,
    toggleType
  }
}
