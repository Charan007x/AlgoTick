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
    <div className="card">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Add New Question</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="input" className="block text-sm font-medium text-gray-700 mb-2">
            Question Number, LeetCode URL, or Problem Slug *
          </label>
          <input
            type="text"
            id="input"
            className="input-field"
            placeholder="1 or https://leetcode.com/problems/two-sum/ or two-sum"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 Tip: Question numbers (e.g., "1") work too! It fetches the slug from LeetCode.
          </p>
        </div>

        <div className="mb-4">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            className="input-field"
            rows="3"
            placeholder="Add your notes, approach, or key insights..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? 'Adding...' : 'Add Question'}
        </button>
      </form>
    </div>
  );
};

export default AddQuestionForm;
