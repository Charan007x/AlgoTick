import { useState, useCallback } from 'react';

export function useQueue(maxSize = 8) {
  const [queue, setQueue] = useState([]);
  const [operations, setOperations] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(null);
  const [nodeIdCounter, setNodeIdCounter] = useState(0);

  const enqueue = useCallback((value) => {
    if (queue.length >= maxSize || isAnimating) return;

    setIsAnimating(true);
    const newNode = { id: nodeIdCounter, value };
    setNodeIdCounter(prev => prev + 1);

    setTimeout(() => {
      setQueue(prev => [...prev, newNode]);
      setOperations(prev => [...prev, { type: 'enqueue', value }]);
      setHighlightedIndex(queue.length);
      
      setTimeout(() => {
        setHighlightedIndex(null);
        setIsAnimating(false);
      }, 500);
    }, 300);
  }, [queue, isAnimating, maxSize, nodeIdCounter]);

  const dequeue = useCallback(() => {
    if (queue.length === 0 || isAnimating) return;

    setIsAnimating(true);
    setHighlightedIndex(0);

    setTimeout(() => {
      setQueue(prev => prev.slice(1));
      setOperations(prev => [...prev, { type: 'dequeue', value: queue[0]?.value }]);
      setHighlightedIndex(null);
      setIsAnimating(false);
    }, 500);
  }, [queue, isAnimating]);

  const clear = useCallback(() => {
    if (isAnimating) return;
    setQueue([]);
    setOperations([]);
    setHighlightedIndex(null);
    setNodeIdCounter(0);
  }, [isAnimating]);

  return {
    queue,
    operations,
    isAnimating,
    highlightedIndex,
    enqueue,
    dequeue,
    clear,
    isFull: queue.length >= maxSize,
    isEmpty: queue.length === 0,
  };
}
