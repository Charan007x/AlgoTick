import React from 'react';
import { questionsAPI } from '../services/api';

const QuestionCard = ({ question, onUpdate, onDelete }) => {
  const handleRevise = async () => {
    try {
      await questionsAPI.markRevised(question._id);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to mark as revised:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await questionsAPI.deleteQuestion(question._id);
        if (onDelete) onDelete(question._id);
      } catch (error) {
        console.error('Failed to delete question:', error);
      }
    }
  };

  const getDifficultyBadge = (difficulty) => {
    const badges = {
      Easy: 'badge-easy',
      Medium: 'badge-medium',
      Hard: 'badge-hard',
    };
    return badges[difficulty] || 'badge-easy';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getNextReminderDate = () => {
    if (question.isRevised) return 'Completed ✓';
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

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <a
            href={question.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-semibold text-primary-600 hover:text-primary-800 hover:underline"
          >
            {question.title}
          </a>
          <div className="flex items-center gap-2 mt-2">
            <span className={getDifficultyBadge(question.difficulty)}>
              {question.difficulty}
            </span>
            {question.isRevised && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                Revised ✓
              </span>
            )}
          </div>
        </div>
      </div>

      {question.tags && question.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {question.tags.slice(0, 5).map((tag, index) => (
            <span
              key={index}
              className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex justify-between">
          <span>Added:</span>
          <span className="font-medium">{formatDate(question.dateAdded)}</span>
        </div>
        <div className="flex justify-between">
          <span>Next Reminder:</span>
          <span className="font-medium">{getNextReminderDate()}</span>
        </div>
        <div className="flex justify-between">
          <span>Revision Count:</span>
          <span className="font-medium">{question.revisionCount}</span>
        </div>
      </div>

      {question.notes && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Notes:</span> {question.notes}
          </p>
        </div>
      )}

      <div className="flex gap-2">
        {!question.isRevised && (
          <button
            onClick={handleRevise}
            className="flex-1 btn-primary text-sm py-2"
          >
            Mark as Revised
          </button>
        )}
        <button
          onClick={handleDelete}
          className="btn-danger text-sm py-2 px-4"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default QuestionCard;
