import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import StatsCard from '../components/StatsCard';
import QuestionList from '../components/QuestionList';
import ActivityHeatMap from '../components/ActivityHeatMap';
import AddQuestionPopup from '../components/AddQuestionPopup';
import FloatingAddButton from '../components/FloatingAddButton';
import AICoach from '../components/AICoach';
import { questionsAPI } from '../services/api';
import ICONS from '../constants/icons';

const TestDashboard = () => {
  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [filter, setFilter] = useState('due-today');
  const [sortBy, setSortBy] = useState('newest');
  const [revisedTimeFilter, setRevisedTimeFilter] = useState('today');
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Fetch stats only once or when revisedTimeFilter changes
  const fetchStats = async () => {
    try {
      const statsRes = await questionsAPI.getDashboardStats({ revisedTimeFilter });
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  // Fetch questions separately
  const fetchQuestions = async () => {
    try {
      setQuestionsLoading(true);
      const questionsRes = await questionsAPI.getQuestions({ 
        filter: filter !== 'all' ? filter : undefined,
        sortBy: sortBy !== 'newest' ? sortBy : undefined
      });
      setQuestions(questionsRes.data.questions);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchStats(), fetchQuestions()]);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch questions when filter/sort changes
  useEffect(() => {
    if (!loading) {
      fetchQuestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, sortBy]);

  // Refetch stats when revisedTimeFilter changes
  useEffect(() => {
    if (!loading) {
      fetchStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revisedTimeFilter]);

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
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 h-32 animate-pulse">
                <div className="h-4 bg-white/10 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-white/10 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatsCard
              title="Due Today"
              value={stats.dueToday}
              icon={ICONS.CLOCK}
              color="yellow"
            />
            <StatsCard
              title="Due This Week"
              value={stats.dueThisWeek}
              icon={ICONS.CALENDAR}
              color="red"
            />
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
        ) : null}

        {/* Activity Heatmap */}
        {loading ? (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-8 h-64 animate-pulse">
            <div className="h-6 bg-white/10 rounded w-1/4 mb-4"></div>
            <div className="h-40 bg-white/10 rounded"></div>
          </div>
        ) : stats && stats.heatmapData ? (
          <div className="mb-8">
            <ActivityHeatMap 
              key={`heatmap-${stats.heatmapData.length}-${stats.totalRevised}`}
              heatmapData={stats.heatmapData} 
            />
          </div>
        ) : null}

        {/* AI Coach Section */}
        <div className="mb-8">
          <AICoach />
        </div>

        {/* Today's Questions Section */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
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

          {loading || questionsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 h-32 animate-pulse">
                  <div className="h-4 bg-white/10 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-white/10 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-white/10 rounded w-1/3"></div>
                </div>
              ))}
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

      {/* Floating Add Button */}
      <FloatingAddButton onClick={() => setIsPopupOpen(true)} />

      {/* Add Question Popup */}
      <AddQuestionPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onQuestionAdded={handleQuestionAdded}
      />
    </div>
  );
};

export default TestDashboard;
