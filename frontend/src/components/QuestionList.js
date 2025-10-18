import React, { useState } from 'react';
import { questionsAPI } from '../services/api';

const QuestionList = ({ questions, onUpdate, onDelete }) => {
  const [verifying, setVerifying] = useState({});
  const [error, setError] = useState({});

  const handleCheckboxChange = async (question) => {
    if (question.isRevised) return; // Already revised, can't uncheck
    
    setVerifying({ ...verifying, [question._id]: true });
    setError({ ...error, [question._id]: null });
    
    try {
      const response = await questionsAPI.markRevised(question._id);
      
      if (response.data.verified) {
        // Success - refresh the list
        if (onUpdate) onUpdate();
      } else {
        // Verification failed
        setError({ 
          ...error, 
          [question._id]: response.data.reason || 'Verification failed' 
        });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.reason || 'Failed to verify';
      setError({ ...error, [question._id]: errorMsg });
    } finally {
      setVerifying({ ...verifying, [question._id]: false });
    }
  };

  const handleDelete = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await questionsAPI.deleteQuestion(questionId);
        if (onDelete) onDelete(questionId);
      } catch (error) {
        console.error('Failed to delete question:', error);
      }
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      Easy: 'text-green-600 bg-green-100',
      Medium: 'text-yellow-600 bg-yellow-100',
      Hard: 'text-red-600 bg-red-100',
    };
    return colors[difficulty] || 'text-gray-600 bg-gray-100';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getNextReminderText = (question) => {
    if (question.isRevised) return 'Completed ✅';
    if (question.nextReminders && question.nextReminders.length > 0) {
      const nextDate = new Date(question.nextReminders[0]);
      const today = new Date();
      const diffTime = nextDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        return `⚠️ Overdue by ${Math.abs(diffDays)} day(s)`;
      } else if (diffDays === 0) {
        return '📅 Due today!';
      } else {
        return `📅 In ${diffDays} day(s)`;
      }
    }
    return 'No reminders';
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-12 text-white/60">
        <p className="text-lg">No questions found.</p>
        <p className="text-sm mt-2">Add your first LeetCode question to get started!</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden animate-fadeIn">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider w-12">
                Done
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                Question
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider w-24">
                Difficulty
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider w-32">
                Added
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider w-40">
                Next Reminder
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider w-24">
                Revisions
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-white/70 uppercase tracking-wider w-20">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {questions.map((question) => (
              <React.Fragment key={question._id}>
                <tr className={`hover:bg-white/5 transition-all duration-200 ${question.isRevised ? 'bg-[#61dca3]/10' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={question.isRevised}
                        onChange={() => handleCheckboxChange(question)}
                        disabled={question.isRevised || verifying[question._id]}
                        className="h-5 w-5 text-[#61dca3] rounded border-white/20 bg-white/5 focus:ring-[#61dca3] cursor-pointer disabled:cursor-not-allowed"
                        title={question.isRevised ? 'Already revised' : 'Click to verify and mark as revised'}
                      />
                      {verifying[question._id] && (
                        <span className="ml-2 text-xs text-white/50">Verifying...</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <a
                        href={question.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#61dca3] hover:text-[#61b3dc] hover:underline font-medium transition-colors"
                      >
                        {question.title}
                      </a>
                      {question.tags && question.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {question.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="text-xs bg-white/10 text-white/60 px-2 py-0.5 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(question.difficulty)}`}>
                      {question.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/70">
                    {formatDate(question.dateAdded)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`${question.isRevised ? 'text-[#61dca3] font-medium' : 'text-white/70'}`}>
                      {getNextReminderText(question)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-center text-white/70">
                    {question.revisionCount}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(question._id)}
                      className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                      title="Delete question"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
                {error[question._id] && (
                  <tr>
                    <td colSpan="7" className="px-6 py-3 bg-red-500/10 border-t border-white/5">
                      <div className="text-sm text-red-400 flex items-center gap-2">
                        <span className="font-medium">❌ Verification Failed:</span>
                        <span>{error[question._id]}</span>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuestionList;
