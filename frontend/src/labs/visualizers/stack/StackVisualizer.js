import React from 'react';
import { StackControls } from './StackControls';
import { StackDisplay } from './StackDisplay';
import { StackOperations } from './StackOperations';
import { useStack } from '../../hooks/useStack';

export function StackVisualizer() {
  const {
    stack,
    operations,
    isAnimating,
    highlightedIndex,
    push,
    pop,
    clear,
    isFull,
    isEmpty,
  } = useStack();


  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 space-y-6">
          <StackControls
            onPush={push}
            onPop={pop}
            onClear={clear}
            isAnimating={isAnimating}
            isFull={isFull}
            isEmpty={isEmpty}
          />
          <StackOperations operations={operations} />
        </div>
        <div className="xl:col-span-2">
          <StackDisplay
            stack={stack}
            highlightedIndex={highlightedIndex}
          />
        </div>
      </div>
    </div>
  );
}
