import React, { useState, useEffect } from 'react';
import { X, Zap, Layers, ArrowRightLeft, GitBranch, Mountain, BarChart3 } from 'lucide-react';
import { HeapVisualizer } from './visualizers/heap/HeapVisualizer';
import { ArrayVisualizer } from './visualizers/ArrayVisualizer';
import { StackVisualizer } from './visualizers/stack/StackVisualizer';
import { QueueVisualizer } from './visualizers/queue/QueueVisualizer';
import { BinaryTreeVisualizer } from './visualizers/binary-tree/BinaryTreeVisualizer';
import { CodeExecutor } from './visualizers/code-executor/CodeExecutor';
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
    setTimeout(() => setSelectedDS(null), 300);
  };

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
      icon: Zap,
      description: 'Paste Java/Python code and watch it execute with live visualization' 
    },
    { 
      id: 'stack', 
      name: 'Stack (LIFO)', 
      icon: Layers,
      description: 'Visualize stack operations - push, pop with animations' 
    },
    { 
      id: 'queue', 
      name: 'Queue (FIFO)', 
      icon: ArrowRightLeft,
      description: 'Visualize queue operations - enqueue, dequeue' 
    },
    { 
      id: 'tree', 
      name: 'Binary Tree', 
      icon: GitBranch,
      description: 'Visualize BST insert and traversals (inorder/preorder/postorder/levelorder)' 
    },
    { 
      id: 'heap', 
      name: 'Heap (Min/Max)', 
      icon: Mountain,
      description: 'Visualize heap operations - insert, heapify with array view' 
    },
    { 
      id: 'array', 
      name: 'Array Sorting', 
      icon: BarChart3,
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
    <>
      {/* Page Title */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 sm:mb-8 tracking-tight">
          AlgoTick <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">Labs</span>
        </h2>
        
        <div className="flex gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Data Structure Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {dataStructures.map((ds, index) => (
                <button
                  key={ds.id}
                  onClick={() => handleCardClick(ds.id)}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className="group relative overflow-hidden p-8 rounded-2xl transition-all duration-300 text-left min-h-[200px]
                           bg-gradient-to-br from-teal-900/40 via-emerald-900/30 to-teal-900/40 backdrop-blur-2xl 
                           border border-teal-500/30 hover:border-teal-500/60 hover:scale-[1.02] 
                           hover:shadow-2xl hover:shadow-teal-500/20 animate-fadeIn"
                >
                  {/* Animated glow effects */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-400/20 rounded-full blur-3xl group-hover:bg-teal-400/30 transition-all duration-300"></div>
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-400/20 rounded-full blur-3xl group-hover:bg-emerald-400/30 transition-all duration-300"></div>
                  
                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col">
                    {/* Icon & Title */}
                    <div className="flex items-center gap-4 mb-4">
                      <ds.icon className="w-10 h-10 text-teal-400 group-hover:text-emerald-400 group-hover:scale-110 transition-all duration-300" />
                      <div className="font-bold text-white text-xl group-hover:text-teal-400 transition-colors">{ds.name}</div>
                    </div>
                    
                    {/* Description */}
                    <div className="text-base text-white/60 leading-relaxed group-hover:text-white/80 transition-colors flex-1">
                      {ds.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
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
            className={`relative w-full max-w-[95vw] max-h-[95vh] bg-gradient-to-br from-black via-gray-900 to-black border-2 border-teal-500/30 rounded-3xl shadow-2xl shadow-teal-500/20 overflow-hidden transform transition-all duration-500 ease-out ${
              isModalOpen ? 'scale-100 opacity-100 rotate-0' : 'scale-90 opacity-0 -rotate-2'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Bar with Close Button */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-4 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border-b border-white/10 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                {/* Traffic Light Dots */}
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors cursor-pointer" onClick={handleCloseModal}></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors cursor-pointer"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 transition-colors cursor-pointer"></div>
                </div>
                
                {/* Title with Icon */}
                <div className="flex items-center gap-3 ml-2">
                  {(() => {
                    const IconComponent = dataStructures.find(ds => ds.id === selectedDS)?.icon;
                    return IconComponent ? <IconComponent className="w-7 h-7 text-teal-400" /> : null;
                  })()}
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
    </>
  );
};

export default Labs;
