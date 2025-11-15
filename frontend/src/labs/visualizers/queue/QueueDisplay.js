import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function QueueDisplay({ queue, highlightedIndex }) {
  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
      <h3 className="text-xl font-bold text-white mb-4">Queue Visualization</h3>
      
      <div className="relative">
        {/* Front/Rear Labels */}
        {queue.length > 0 && (
          <div className="flex justify-between mb-2">
            <div className="text-sm font-semibold text-[#61dca3]">← Front</div>
            <div className="text-sm font-semibold text-[#61dca3]">Rear →</div>
          </div>
        )}

        {/* Queue Container */}
        <div className="min-h-[200px] bg-gray-800/50 rounded-xl p-6 border-2 border-[#61dca3]/50">
          {queue.length === 0 ? (
            <div className="flex items-center justify-center h-full text-white/40">
              Queue is empty
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4">
              <AnimatePresence mode="popLayout">
                {queue.map((node, index) => (
                  <motion.div
                    key={node.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: 1, 
                      opacity: 1,
                      backgroundColor: highlightedIndex === index ? '#61dca3' : 'rgba(255, 255, 255, 0.1)'
                    }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0 w-20 h-20 rounded-lg flex items-center justify-center text-2xl font-bold text-white border-2 border-white/20"
                  >
                    {node.value}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Queue Info */}
        <div className="mt-4 flex justify-between text-sm text-white/60">
          <span>Size: {queue.length}</span>
          <span>Front: {queue.length > 0 ? queue[0].value : 'N/A'}</span>
          <span>Rear: {queue.length > 0 ? queue[queue.length - 1].value : 'N/A'}</span>
        </div>
      </div>
    </div>
  );
}
