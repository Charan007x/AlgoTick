import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { HeapVisualizer } from './visualizers/heap/HeapVisualizer';
import { ArrayVisualizer } from './visualizers/ArrayVisualizer';
import { StackVisualizer } from './visualizers/stack/StackVisualizer';
import { QueueVisualizer } from './visualizers/queue/QueueVisualizer';
import { BinaryTreeVisualizer } from './visualizers/binary-tree/BinaryTreeVisualizer';
import { CodeExecutor } from './visualizers/code-executor/CodeExecutor';
import { X } from 'lucide-react';
import './Labs.css';

const Labs = () => {
  const [selectedDS, setSelectedDS] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = (dsId) => {
    setSelectedDS(dsId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Delay clearing selection for smooth animation
    setTimeout(() => setSelectedDS(null), 300);
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        handleCloseModal();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isModalOpen]);

  const dataStructures = [
    { 
      id: 'code', 
      name: 'Code Executor', 
      icon: '⚡',
      description: 'Paste Java/Python code and watch it execute with live visualization' 
    },
    { 
      id: 'stack', 
      name: 'Stack (LIFO)', 
      icon: '📚',
      description: 'Visualize stack operations - push, pop with animations' 
    },
    { 
      id: 'queue', 
      name: 'Queue (FIFO)', 
      icon: '🚶',
      description: 'Visualize queue operations - enqueue, dequeue' 
    },
    { 
      id: 'tree', 
      name: 'Binary Tree', 
      icon: '🌳',
      description: 'Visualize BST insert and traversals (inorder/preorder/postorder/levelorder)' 
    },
    { 
      id: 'heap', 
      name: 'Heap (Min/Max)', 
      icon: '🏔️',
      description: 'Visualize heap operations - insert, heapify with array view' 
    },
    { 
      id: 'array', 
      name: 'Array Sorting', 
      icon: '📊',
      description: 'Visualize sorting algorithms - bubble, merge, quick sort' 
    },
  ];

  const renderVisualizer = () => {
    if (!selectedDS) return null;
    
    switch (selectedDS) {
      case 'code':
        return <CodeExecutor />;
      case 'stack':
        return <StackVisualizer />;
      case 'queue':
        return <QueueVisualizer />;
      case 'tree':
        return <BinaryTreeVisualizer />;
      case 'heap':
        return <HeapVisualizer />;
      case 'array':
        return <ArrayVisualizer />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-32">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="text-5xl animate-bounce">🧪</div>
            <div>
              <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-[#61dca3] to-[#61b3dc] bg-clip-text text-transparent">
                AlgoTick Labs
              </h1>
              <p className="text-white/70 mt-2 text-lg">Interactive Data Structure Visualizer</p>
            </div>
          </div>
        </div>

        {/* Data Structure Selector - Refined Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {dataStructures.map((ds, index) => (
            <button
              key={ds.id}
              onClick={() => handleCardClick(ds.id)}
              style={{ animationDelay: `${index * 50}ms` }}
              className="group relative overflow-hidden p-6 rounded-2xl border-2 transition-all duration-300 text-left 
                       bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border-white/10 
                       hover:border-[#61dca3]/60 hover:bg-white/10 hover:scale-[1.02] hover:shadow-2xl 
                       hover:shadow-[#61dca3]/20 animate-fadeIn"
            >
              {/* Background glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#61dca3]/0 to-[#61b3dc]/0 
                            group-hover:from-[#61dca3]/5 group-hover:to-[#61b3dc]/5 transition-all duration-300 rounded-2xl" />
              
              {/* Content */}
              <div className="relative z-10">
                {/* Icon & Title */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{ds.icon}</span>
                  <div className="font-bold text-white text-lg group-hover:text-[#61dca3] transition-colors">{ds.name}</div>
                </div>
                
                {/* Description */}
                <div className="text-sm text-white/60 leading-relaxed group-hover:text-white/80 transition-colors">
                  {ds.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Modal/Popup Overlay */}
      {isModalOpen && (
        <div 
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
            isModalOpen ? 'bg-black/80 backdrop-blur-sm' : 'bg-black/0'
          }`}
          onClick={handleCloseModal}
        >
          {/* Modal Content */}
          <div 
            className={`relative w-full max-w-[95vw] max-h-[95vh] bg-gradient-to-br from-black via-gray-900 to-black border-2 border-[#61dca3]/30 rounded-3xl shadow-2xl shadow-[#61dca3]/10 overflow-hidden transform transition-all duration-500 ease-out ${
              isModalOpen ? 'scale-100 opacity-100 rotate-0' : 'scale-90 opacity-0 -rotate-2'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Bar with Close Button */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#61dca3]/10 to-[#61b3dc]/10 border-b border-white/10 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                {/* Traffic Light Dots */}
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors cursor-pointer" onClick={handleCloseModal}></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors cursor-pointer"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 transition-colors cursor-pointer"></div>
                </div>
                
                {/* Title with Icon */}
                <div className="flex items-center gap-3 ml-2">
                  <span className="text-2xl">
                    {dataStructures.find(ds => ds.id === selectedDS)?.icon}
                  </span>
                  <div>
                    <span className="text-white font-semibold text-lg">
                      {dataStructures.find(ds => ds.id === selectedDS)?.name}
                    </span>
                    <p className="text-white/50 text-xs">
                      AlgoTick Labs
                    </p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleCloseModal}
                className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-xl transition-all duration-300 group"
                title="Close (ESC)"
              >
                <X className="w-5 h-5 text-red-400 group-hover:text-red-300 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* Visualizer Container - With scroll */}
            <div className="h-[calc(95vh-4rem)] pt-20 pb-4 px-4 overflow-y-auto custom-scrollbar">
              <div className="animate-fadeIn">
                {renderVisualizer()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Labs;
