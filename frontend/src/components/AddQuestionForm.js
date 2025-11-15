import React, { useState } from 'react';
import { questionsAPI } from '../services/api';

const AddQuestionForm = ({ onQuestionAdded }) => {
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
      
      if (onQuestionAdded) {
        onQuestionAdded(response.data.question);
      }
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 animate-fadeIn">
      <h2 className="text-2xl font-bold mb-6 text-white">Add New Question</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl backdrop-blur-sm animate-slideIn">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-[#61dca3]/10 border border-[#61dca3]/20 text-[#61dca3] rounded-xl backdrop-blur-sm animate-slideIn">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <label htmlFor="input" className="block text-sm font-medium text-white/80 mb-2">
            Question Number, LeetCode URL, or Problem Slug *
          </label>
          <input
            type="text"
            id="input"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#61dca3] focus:border-transparent transition-all"
            placeholder="1 or https://leetcode.com/problems/two-sum/ or two-sum"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            required
          />
          <p className="text-xs text-white/50 mt-2">
            💡 Tip: Question numbers (e.g., "1") work too! It fetches the slug from LeetCode.
          </p>
        </div>

        <div className="mb-5">
          <label htmlFor="notes" className="block text-sm font-medium text-white/80 mb-2">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#61dca3] focus:border-transparent transition-all resize-none"
            rows="3"
            placeholder="Add your notes, approach, or key insights..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#61dca3] to-[#61b3dc] text-black font-bold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-[#61dca3]/50 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? 'Adding...' : 'Add Question'}
        </button>
      </form>
    </div>
  );
};

export default AddQuestionForm;
