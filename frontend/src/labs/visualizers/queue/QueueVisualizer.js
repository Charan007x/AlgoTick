import React from 'react';
import { QueueControls } from './QueueControls';
import { QueueDisplay } from './QueueDisplay';
import { QueueOperations } from './QueueOperations';
import { useQueue } from '../../hooks/useQueue';

export function QueueVisualizer() {
  const {
    queue,
    operations,
    isAnimating,
    highlightedIndex,
    enqueue,
    dequeue,
    clear,
    isFull,
    isEmpty,
  } = useQueue();

  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 space-y-6">
          <QueueControls
            onEnqueue={enqueue}
            onDequeue={dequeue}
            onClear={clear}
            isAnimating={isAnimating}
            isFull={isFull}
            isEmpty={isEmpty}
          />
          <QueueOperations operations={operations} />
        </div>
        <div className="xl:col-span-2">
          <QueueDisplay
            queue={queue}
            highlightedIndex={highlightedIndex}
          />
        </div>
      </div>
    </div>
  );
}
