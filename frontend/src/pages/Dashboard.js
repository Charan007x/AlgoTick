import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import StatsCard from '../components/StatsCard';
import AddQuestionForm from '../components/AddQuestionForm';
import QuestionCard from '../components/QuestionCard';
import { questionsAPI } from '../services/api';

const Dashboard = () => {
  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [questionsRes, statsRes] = await Promise.all([
        questionsAPI.getQuestions({ 
          filter: filter !== 'all' ? filter : undefined,
          sortBy: sortBy !== 'newest' ? sortBy : undefined
        }),
        questionsAPI.getDashboardStats(),
      ]);
      
      setQuestions(questionsRes.data.questions);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, sortBy]);

  const handleQuestionAdded = () => {
    fetchData();
  };

  const handleQuestionDeleted = (id) => {
    setQuestions(questions.filter(q => q._id !== id));
    fetchData(); // Refresh stats
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Section */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Solved"
              value={stats.totalSolved}
              icon="📚"
              color="primary"
            />
            <StatsCard
              title="Fully Revised"
              value={stats.totalRevised}
              icon="✅"
              color="green"
            />
            <StatsCard
              title="Due Today"
              value={stats.dueToday}
              icon="⏰"
              color="yellow"
            />
            <StatsCard
              title="Due This Week"
              value={stats.dueThisWeek}
              icon="📅"
              color="red"
            />
          </div>
        )}

        {/* Difficulty Breakdown */}
        {stats && (
          <div className="card mb-8">
            <h3 className="text-lg font-semibold mb-4">Difficulty Breakdown</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{stats.difficulty.Easy}</div>
                <div className="text-sm text-gray-600">Easy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">{stats.difficulty.Medium}</div>
                <div className="text-sm text-gray-600">Medium</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{stats.difficulty.Hard}</div>
                <div className="text-sm text-gray-600">Hard</div>
              </div>
            </div>
          </div>
        )}

        {/* Add Question Form */}
        <div className="mb-8">
          <AddQuestionForm onQuestionAdded={handleQuestionAdded} />
        </div>

        {/* Questions List */}
        <div className="card">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-gray-800">My Questions</h2>
            
            <div className="flex flex-wrap gap-4">
              {/* Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="input-field py-2"
                >
                  <option value="all">All Questions</option>
                  <option value="pending">Pending</option>
                  <option value="revised">Fully Revised</option>
                  <option value="due-soon">Due Soon</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field py-2"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="difficulty">Difficulty</option>
                  <option value="next-reminder">Next Reminder</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600">Loading questions...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No questions yet</h3>
              <p className="text-gray-600">Add your first LeetCode question to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {questions.map((question) => (
                <QuestionCard
                  key={question._id}
                  question={question}
                  onUpdate={fetchData}
                  onDelete={handleQuestionDeleted}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
