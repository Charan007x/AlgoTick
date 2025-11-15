import React, { useState } from 'react';
import { questionsAPI } from '../services/api';

const AddQuestionPopup = ({ isOpen, onClose, onQuestionAdded }) => {
  const [input, setInput] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Determine if input is a number, URL, or slug
      const isNumber = /^\d+$/.test(input.trim());
      const payload = isNumber 
        ? { questionNumber: input.trim(), notes }
        : { url: input.trim(), notes };
      
      const response = await questionsAPI.addQuestion(payload);
      setSuccess('Question added successfully!');
      setInput('');
      setNotes('');
      
      setTimeout(() => {
        setSuccess('');
        onClose();
        if (onQuestionAdded) {
          onQuestionAdded(response.data.question);
        }
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add question');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setInput('');
    setNotes('');
    setError('');
    setSuccess('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn"
        onClick={handleClose}
      />
      
      {/* Popup */}
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-3xl shadow-2xl transform animate-slideUp overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#61dca3]/20 to-[#61b3dc]/20 px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-[#61dca3]">✨</span>
            Add New Question
          </h2>
          <button
            onClick={handleClose}
            className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl backdrop-blur-sm animate-slideIn">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-4 bg-[#61dca3]/10 border border-[#61dca3]/20 text-[#61dca3] rounded-xl backdrop-blur-sm animate-slideIn flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label htmlFor="popup-input" className="block text-sm font-medium text-white/80 mb-2">
                Question Number, LeetCode URL, or Problem Slug *
              </label>
              <input
                type="text"
                id="popup-input"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#61dca3] focus:border-transparent transition-all"
                placeholder="1 or https://leetcode.com/problems/two-sum/ or two-sum"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                required
                autoFocus
              />
              <p className="text-xs text-white/50 mt-2">
                💡 Tip: Question numbers (e.g., "1") work too! It fetches the slug from LeetCode.
              </p>
            </div>

            <div className="mb-6">
              <label htmlFor="popup-notes" className="block text-sm font-medium text-white/80 mb-2">
                Notes (Optional)
              </label>
              <textarea
                id="popup-notes"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#61dca3] focus:border-transparent transition-all resize-none"
                rows="4"
                placeholder="Add your notes, approach, or key insights..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 bg-white/5 border border-white/10 text-white font-medium py-3 px-6 rounded-xl hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-[#61dca3] to-[#61b3dc] text-black font-bold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-[#61dca3]/50 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Adding...' : 'Add Question'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddQuestionPopup;
