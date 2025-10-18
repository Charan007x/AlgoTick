import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import StatsCard from '../components/StatsCard';
import AddQuestionForm from '../components/AddQuestionForm';
import QuestionList from '../components/QuestionList';
import ActivityHeatMap from '../components/ActivityHeatMap';
import { questionsAPI } from '../services/api';
import ICONS from '../constants/icons';

const Dashboard = () => {
  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('due-today');
  const [sortBy, setSortBy] = useState('newest');
  const [revisedTimeFilter, setRevisedTimeFilter] = useState('today');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [questionsRes, statsRes] = await Promise.all([
        questionsAPI.getQuestions({ 
          filter: filter !== 'all' ? filter : undefined,
          sortBy: sortBy !== 'newest' ? sortBy : undefined
        }),
        questionsAPI.getDashboardStats({ revisedTimeFilter }),
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
  }, [filter, sortBy, revisedTimeFilter]);

  const handleQuestionAdded = () => {
    fetchData();
  };

  const handleQuestionDeleted = (id) => {
    setQuestions(questions.filter(q => q._id !== id));
    fetchData(); // Refresh stats
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Stats Section */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="animate-fadeIn delay-100">
              <StatsCard
                title="Due Today"
                value={stats.dueToday}
                icon={ICONS.CLOCK}
                color="yellow"
              />
            </div>
            <div className="animate-fadeIn delay-200">
              <StatsCard
                title="Due This Week"
                value={stats.dueThisWeek}
                icon={ICONS.CALENDAR}
                color="red"
              />
            </div>
            <div className="animate-fadeIn delay-300">
              <StatsCard
                title="Fully Revised"
                value={stats.totalRevised}
                icon={ICONS.CHECKMARK}
                color="green"
                showTimeFilter={true}
                timeFilter={revisedTimeFilter}
                onTimeFilterChange={setRevisedTimeFilter}
              />
            </div>
          </div>
        )}

        {/* Activity Heatmap */}
        {stats && stats.heatmapData && (
          <div className="animate-fadeIn delay-400">
            <ActivityHeatMap 
              key={`heatmap-${stats.heatmapData.length}-${stats.totalRevised}`}
              heatmapData={stats.heatmapData} 
            />
          </div>
        )}

        {/* Add Question Form */}
        <div className="mb-8 animate-fadeIn delay-500">
          <AddQuestionForm onQuestionAdded={handleQuestionAdded} />
        </div>

        {/* Questions List */}
                {/* Question List Section */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 animate-fadeIn delay-600">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-white">My Questions</h2>
            
            <div className="flex flex-wrap gap-4">
              {/* Filter */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Filter
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#61dca3] transition-all"
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="due-today" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Due Today</option>
                  <option value="due-week" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Due This Week (7 Days)</option>
                  <option value="all" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>All Questions</option>
                  <option value="pending" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Pending</option>
                  <option value="revised" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Fully Revised</option>
                  <option value="due-soon" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Due Soon</option>
                  <option value="overdue" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Overdue</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#61dca3] transition-all"
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="newest" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Newest First</option>
                  <option value="oldest" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Oldest First</option>
                  <option value="difficulty" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Difficulty</option>
                  <option value="next-reminder" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Next Reminder</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 animate-fadeIn">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#61dca3] shadow-lg shadow-[#61dca3]/30"></div>
              <p className="mt-4 text-white/60 animate-pulse">Loading questions...</p>
            </div>
          ) : (
            <QuestionList 
              questions={questions}
              onUpdate={fetchData}
              onDelete={handleQuestionDeleted}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
