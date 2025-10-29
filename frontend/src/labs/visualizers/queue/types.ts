export interface QueueNode {
  id: number;
  value: number;
}

export interface QueueOperation {
  type: 'enqueue' | 'dequeue';
  value?: number;
}
