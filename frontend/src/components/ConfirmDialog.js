import React, { useEffect } from 'react';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useConfirm } from '../context/ConfirmContext';

const ConfirmDialog = () => {
  const { confirmState, closeConfirm } = useConfirm();

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && confirmState.isOpen) {
        closeConfirm();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [confirmState.isOpen, closeConfirm]);

  if (!confirmState.isOpen) return null;

  const getIcon = () => {
    switch (confirmState.variant) {
      case 'danger':
        return <AlertTriangle className="w-6 h-6 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-yellow-400" />;
      case 'info':
        return <Info className="w-6 h-6 text-blue-400" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-red-400" />;
    }
  };

  const getButtonStyle = () => {
    switch (confirmState.variant) {
      case 'danger':
        return 'bg-red-500 hover:bg-red-600 focus:ring-red-500';
      case 'warning':
        return 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500';
      case 'info':
        return 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500';
      default:
        return 'bg-red-500 hover:bg-red-600 focus:ring-red-500';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="bg-gray-900 rounded-lg border border-white/10 shadow-2xl max-w-md w-full overflow-hidden transform transition-all"
        style={{ animation: 'scaleIn 0.2s ease-out' }}
      >
        <style>{`
          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
        
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10">
          {getIcon()}
          <h3 className="text-lg font-semibold text-white flex-1">
            {confirmState.title}
          </h3>
          <button
            onClick={closeConfirm}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message */}
        <div className="px-6 py-4">
          <p className="text-white/80 text-sm leading-relaxed">
            {confirmState.message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 py-4 bg-white/5 border-t border-white/10">
          <button
            onClick={confirmState.onCancel}
            className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            {confirmState.cancelText}
          </button>
          <button
            onClick={confirmState.onConfirm}
            className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors focus:outline-none focus:ring-2 ${getButtonStyle()}`}
          >
            {confirmState.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
