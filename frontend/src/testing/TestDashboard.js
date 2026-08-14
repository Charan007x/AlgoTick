import React, { useState, useMemo } from 'react';
import { BarChart3, Zap, Bot, TrendingUp, Link2, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Label, Sector, Cell } from 'recharts';
import { questionsAPI, aiCoachAPI } from '../services/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';
import { useToast } from '../context/ToastContext';

const TestDashboard = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState('all');
  const [activeDifficulty, setActiveDifficulty] = useState('Easy');
  const [refreshingCoach, setRefreshingCoach] = useState(false);

  const statsQuery = useQuery({
    queryKey: queryKeys.dashboardStats(),
    queryFn: async () => (await questionsAPI.getDashboardStats()).data,
  });

  const leetcodeQuery = useQuery({
    queryKey: queryKeys.leetcodeActivity,
    queryFn: async () => (await questionsAPI.getLeetCodeActivity()).data,
    retry: false,
  });

  const questionsQuery = useQuery({
    queryKey: queryKeys.questions({ sortBy: 'recent', limit: 3 }),
    queryFn: async () => {
      const response = await questionsAPI.getQuestions({ sortBy: 'recent', limit: 3 });
      return response.data.questions || [];
    },
  });

  const aiCoachQuery = useQuery({
    queryKey: queryKeys.aiCoach,
    queryFn: async () => (await aiCoachAPI.getDashboard()).data,
    retry: false,
  });

  const dashboardData = statsQuery.data;
  const leetcodeActivity = leetcodeQuery.data;
  const recentProblems = questionsQuery.data || [];
  const aiCoachData = aiCoachQuery.data;
  const loading =
    (statsQuery.isLoading && !statsQuery.data) ||
    (questionsQuery.isLoading && !questionsQuery.data);

  
  // Get current day of week (0 = Sunday, 1 = Monday, etc.)
  const getCurrentDayIndex = () => {
    const day = new Date().getDay();
    return day === 0 ? 6 : day - 1; // Convert Sunday (0) to 6, and shift others down by 1
  };

  const currentDayIndex = getCurrentDayIndex();
  
  // Process heatmap data to get weekly activity from LeetCode
  const weeklyData = useMemo(() => {
    const emptyWeek = [
      { day: 'Mon', problems: 0, isToday: currentDayIndex === 0 },
      { day: 'Tue', problems: 0, isToday: currentDayIndex === 1 },
      { day: 'Wed', problems: 0, isToday: currentDayIndex === 2 },
      { day: 'Thu', problems: 0, isToday: currentDayIndex === 3 },
      { day: 'Fri', problems: 0, isToday: currentDayIndex === 4 },
      { day: 'Sat', problems: 0, isToday: currentDayIndex === 5 },
      { day: 'Sun', problems: 0, isToday: currentDayIndex === 6 }
    ];

    if (!leetcodeActivity?.activity?.submissionCalendar) {
      return emptyWeek;
    }

    const calendar = leetcodeActivity.activity.submissionCalendar;
    
    // Helper function to get local date string (YYYY-MM-DD) without timezone issues
    const getLocalDateString = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    // Create a map for easy date lookup using LOCAL dates
    const dateMap = {};
    Object.entries(calendar).forEach(([timestamp, count]) => {
      const date = new Date(parseInt(timestamp) * 1000);
      const dateStr = getLocalDateString(date);
      dateMap[dateStr] = count;
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = getLocalDateString(today);
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = [];

    // Generate 7 days starting from Monday of current week
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() + mondayOffset);
    startOfWeek.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      
      const dayName = dayNames[currentDate.getDay()];
      const dateStr = getLocalDateString(currentDate);
      const isToday = dateStr === todayStr;
      
      // If this date is in the future (after today), use last week's data
      let count = 0;
      if (currentDate > today) {
        const lastWeekDate = new Date(currentDate);
        lastWeekDate.setDate(currentDate.getDate() - 7);
        const lastWeekDateStr = getLocalDateString(lastWeekDate);
        count = dateMap[lastWeekDateStr] || 0;
      } else {
        count = dateMap[dateStr] || 0;
      }

      result.push({
        day: dayName,
        problems: count,
        isToday: isToday
      });
    }

    return result;
  }, [leetcodeActivity, currentDayIndex]);

  const difficultyData = useMemo(() => {
    console.log('Computing difficultyData, leetcodeActivity:', leetcodeActivity);
    
    // Use LeetCode data if available, otherwise fall back to local database
    if (leetcodeActivity?.activity) {
      const activity = leetcodeActivity.activity;
      console.log('Using LeetCode difficulty data:', activity);
      return [
        { difficulty: 'Easy', count: activity.easySolved || 0, fill: 'rgb(52, 211, 153)' },
        { difficulty: 'Medium', count: activity.mediumSolved || 0, fill: 'rgb(251, 191, 36)' },
        { difficulty: 'Hard', count: activity.hardSolved || 0, fill: 'rgb(239, 68, 68)' }
      ];
    }
    
    if (!dashboardData?.difficulty) {
      console.log('No difficulty data available');
      return [
        { difficulty: 'Easy', count: 0, fill: 'rgb(52, 211, 153)' },
        { difficulty: 'Medium', count: 0, fill: 'rgb(251, 191, 36)' },
        { difficulty: 'Hard', count: 0, fill: 'rgb(239, 68, 68)' }
      ];
    }

    console.log('Using local difficulty data:', dashboardData.difficulty);
    return [
      { difficulty: 'Easy', count: dashboardData.difficulty.Easy || 0, fill: 'rgb(52, 211, 153)' },
      { difficulty: 'Medium', count: dashboardData.difficulty.Medium || 0, fill: 'rgb(251, 191, 36)' },
      { difficulty: 'Hard', count: dashboardData.difficulty.Hard || 0, fill: 'rgb(239, 68, 68)' }
    ];
  }, [dashboardData, leetcodeActivity]);

  const activeIndex = useMemo(
    () => difficultyData.findIndex((item) => item.difficulty === activeDifficulty),
    [activeDifficulty, difficultyData]
  );

  // Format recent problems
  const formattedRecentProblems = useMemo(() => {
    return recentProblems.slice(0, 3).map((problem, index) => ({
      title: problem.title || 'Problem',
      difficulty: problem.difficulty || 'Easy',
      time: '---',
      status: problem.isRevised ? 'Revised' : 'Pending',
      icon: index % 2 === 0 ? 'chart' : 'link'
    }));
  }, [recentProblems]);

  return (
    <>
        {/* Hello User */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 sm:mb-8 tracking-tight">
          Hello <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">
            {leetcodeActivity?.activity?.realName || 
             leetcodeActivity?.activity?.username || 
             JSON.parse(localStorage.getItem('user') || '{}').username ||
             'User'}
          </span>
        </h2>
        
          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            {/* Left Column */}
            <div className="flex-1 space-y-4 sm:space-y-6">
              {/* Coding Consistency Section */}
              <div className="bg-gradient-to-br from-teal-900/40 via-emerald-900/30 to-teal-900/40 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-teal-500/30 p-4 sm:p-6 lg:p-8 shadow-2xl shadow-teal-500/20 relative overflow-hidden">
                {/* Animated Glow effects */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-400/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-400/30 rounded-full blur-3xl animate-pulse"></div>
                
                <div className="relative z-10">
                
                {/* Tabs */}
                <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
                  <button
                    onClick={() => setSelectedTab('all')}
                    className={`px-5 sm:px-7 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all shadow-lg ${
                      selectedTab === 'all'
                        ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-teal-500/50'
                        : 'bg-gray-700/30 text-gray-300 hover:bg-gray-700/50 backdrop-blur-sm border border-white/10'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setSelectedTab('practice')}
                    className={`px-5 sm:px-7 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all shadow-lg ${
                      selectedTab === 'practice'
                        ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-teal-500/50'
                        : 'bg-gray-700/30 text-gray-300 hover:bg-gray-700/50 backdrop-blur-sm border border-white/10'
                    }`}
                  >
                    Practice
                  </button>
                  <button
                    onClick={() => setSelectedTab('stats')}
                    className={`px-5 sm:px-7 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all shadow-lg ${
                      selectedTab === 'stats'
                        ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-teal-500/50'
                        : 'bg-gray-700/30 text-gray-300 hover:bg-gray-700/50 backdrop-blur-sm border border-white/10'
                    }`}
                  >
                    Stats
                  </button>
                </div>

                {/* Chart - Recharts */}
                <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-teal-500/20 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                  {/* Subtle grid background */}
                  <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: `linear-gradient(rgba(45, 212, 191, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(45, 212, 191, 0.5) 1px, transparent 1px)`,
                    backgroundSize: '20px 20px'
                  }}></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6 sm:mb-8">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-teal-400" />
                        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-white">Coding Consistency</h3>
                      </div>
                      <button className="text-teal-400 text-xs sm:text-sm flex items-center gap-1 sm:gap-2 hover:text-teal-300 transition-colors group">
                        View all
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>

                    {/* Recharts Bar Chart */}
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={weeklyData}>
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgb(52, 211, 153)" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="rgb(45, 212, 191)" stopOpacity={0.9} />
                          </linearGradient>
                          <linearGradient id="activeBarGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgb(52, 211, 153)" stopOpacity={1} />
                            <stop offset="100%" stopColor="rgb(45, 212, 191)" stopOpacity={1} />
                          </linearGradient>
                          {/* Diagonal stripe pattern */}
                          <pattern id="diagonalStripes" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                            <rect x="0" y="0" width="3" height="6" fill="rgba(45, 212, 191, 0.4)" />
                            <rect x="3" y="0" width="3" height="6" fill="rgba(52, 211, 153, 0.6)" />
                          </pattern>
                        </defs>
                        <CartesianGrid 
                          strokeDasharray="3 3" 
                          stroke="rgba(45, 212, 191, 0.1)" 
                          vertical={false}
                        />
                        <XAxis 
                          dataKey="day" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }}
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#6b7280', fontSize: 11 }}
                          dx={-10}
                        />
                        <Tooltip 
                          cursor={{ fill: 'rgba(45, 212, 191, 0.05)' }}
                          position={{ y: 0 }}
                          offset={-10}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-gradient-to-br from-teal-500 to-emerald-500 text-white px-4 py-2 rounded-lg shadow-2xl border border-teal-400/30">
                                  <p className="text-xs opacity-80 font-medium">{payload[0].payload.day}</p>
                                  <p className="text-lg font-bold">{payload[0].value} problems</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar 
                          dataKey="problems" 
                          radius={[8, 8, 0, 0]}
                          shape={(props) => {
                            const { x, y, width, height, payload } = props;
                            const isToday = payload.isToday;
                            return (
                              <rect 
                                x={x} 
                                y={y} 
                                width={width} 
                                height={height} 
                                fill={isToday ? 'url(#barGradient)' : 'url(#diagonalStripes)'} 
                                rx={8}
                                filter={isToday ? 'drop-shadow(0 0 20px rgba(45, 212, 191, 0.6))' : 'none'}
                              />
                            );
                          }}
                        />
                      </BarChart>
                    </ResponsiveContainer>

                    {/* Footer Stats */}
                    <div className="mt-6 pt-4 border-t border-teal-500/10 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-teal-400">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-semibold">Trending up by 5.2% this week</span>
                      </div>
                      <span className="text-xs text-gray-500">Last 7 days</span>
                    </div>
                  </div>
                </div>
                </div>
              </div>

              {/* AI Coach Section */}
              <div className="bg-gradient-to-br from-teal-900/40 via-emerald-900/30 to-teal-900/40 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-teal-500/30 p-4 sm:p-6 lg:p-8 shadow-2xl shadow-teal-500/20 relative overflow-hidden">
                {/* Animated Glow effects */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-400/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-400/30 rounded-full blur-3xl animate-pulse"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/50">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white">AI Coach</h3>
                    </div>
                    <button 
                      onClick={async () => {
                        try {
                          setRefreshingCoach(true);
                          await aiCoachAPI.refresh();
                          await queryClient.invalidateQueries({ queryKey: queryKeys.aiCoach });
                        } catch (error) {
                          console.error('Error refreshing AI Coach:', error);
                          toast.error(error.response?.data?.message || 'Failed to refresh AI insights. Please try again later.');
                        } finally {
                          setRefreshingCoach(false);
                        }
                      }}
                      disabled={refreshingCoach}
                      className="text-teal-400 text-xs sm:text-sm flex items-center gap-1 sm:gap-2 hover:text-teal-300 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className={`w-3 h-3 sm:w-4 sm:h-4 ${refreshingCoach ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </button>
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-8 h-8 border-3 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : aiCoachData?.data?.recommendations?.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {/* Strong Topics */}
                      {aiCoachData.data.strongTopics && aiCoachData.data.strongTopics.length > 0 && (
                        <div className="bg-gray-900/40 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-emerald-500/30 backdrop-blur-sm">
                          <p className="text-emerald-400 text-xs sm:text-sm font-semibold mb-2 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Strong Topics:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {aiCoachData.data.strongTopics.map((topic, index) => (
                              <span key={index} className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-md border border-emerald-500/30">
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Weak Topics */}
                      {aiCoachData.data.weakTopics && aiCoachData.data.weakTopics.length > 0 && (
                        <div className="bg-gray-900/40 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-orange-500/30 backdrop-blur-sm">
                          <p className="text-orange-400 text-xs sm:text-sm font-semibold mb-2 flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Areas to Improve:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {aiCoachData.data.weakTopics.map((topic, index) => (
                              <span key={index} className="px-2 py-1 bg-orange-500/20 text-orange-300 text-xs rounded-md border border-orange-500/30">
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommendations */}
                      {aiCoachData.data.recommendations.slice(0, 2).map((rec, index) => {
                        // Handle both string and object recommendations
                        const isObject = typeof rec === 'object' && rec !== null;
                        const title = isObject ? (rec.title || `Recommendation ${index + 1}`) : `Recommendation ${index + 1}`;
                        const description = isObject ? (rec.description || rec.reason || 'No description available') : rec;
                        const practiceUrl = isObject ? (rec.leetcodeUrl || (rec.titleSlug ? `https://leetcode.com/problems/${rec.titleSlug}/` : null)) : null;
                        
                        return (
                          <div key={index} className="bg-gray-900/40 rounded-lg sm:rounded-xl p-3 sm:p-5 border border-white/10 backdrop-blur-sm hover:border-teal-500/30 transition-colors">
                            <p className="text-teal-400 text-xs sm:text-sm font-semibold mb-2">
                              {title}
                            </p>
                            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-3">
                              {description}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              {isObject && rec.difficulty && (
                                <span className={`inline-block px-2 py-1 text-xs rounded-md ${
                                  rec.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                                  rec.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-red-500/20 text-red-400'
                                }`}>
                                  {rec.difficulty}
                                </span>
                              )}
                              {isObject && rec.priority && (
                                <span className="inline-block px-2 py-1 bg-teal-500/20 text-teal-400 text-xs rounded-md">
                                  {rec.priority}
                                </span>
                              )}
                              {practiceUrl && (
                                <a 
                                  href={practiceUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-xs rounded-md hover:from-teal-600 hover:to-emerald-600 transition-all shadow-lg shadow-teal-500/30"
                                >
                                  <Zap className="w-3 h-3" />
                                  Practice
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* Last Refreshed */}
                      {aiCoachData.data.lastRefreshed && (
                        <div className="text-center pt-2">
                          <p className="text-xs text-gray-500">
                            Last updated: {new Date(aiCoachData.data.lastRefreshed).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-900/40 rounded-lg sm:rounded-xl p-6 border border-white/10 backdrop-blur-sm text-center">
                      <Bot className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">
                        No AI insights available yet. Make sure your LeetCode username is connected.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="w-full lg:w-96 space-y-4 sm:space-y-6">
              {/* Problem Difficulty Distribution */}
              <div className="bg-gradient-to-br from-teal-900/40 via-emerald-900/30 to-teal-900/40 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-teal-500/30 p-4 sm:p-6 lg:p-8 shadow-2xl shadow-teal-500/20 relative overflow-hidden">
                {/* Animated Glow effects */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-400/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-400/30 rounded-full blur-3xl animate-pulse"></div>
                
                <div className="relative z-10">
                  <div className="mb-6 sm:mb-8">
                    <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-white">Problem Breakdown</h3>
                    {leetcodeActivity?.activity ? (
                      <p className="text-xs text-gray-400 mt-1">
                        Total: {leetcodeActivity.activity.totalSolved || 0} problems (from LeetCode)
                      </p>
                    ) : dashboardData ? (
                      <p className="text-xs text-gray-400 mt-1">
                        Total: {(dashboardData.difficulty?.Easy || 0) + (dashboardData.difficulty?.Medium || 0) + (dashboardData.difficulty?.Hard || 0)} problems
                      </p>
                    ) : null}
                  </div>

                  {/* Interactive Pie Chart */}
                  {difficultyData.reduce((sum, item) => sum + item.count, 0) > 0 ? (
                    <div className="flex justify-center mb-6 sm:mb-8">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={difficultyData}
                          dataKey="count"
                          nameKey="difficulty"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          strokeWidth={3}
                          stroke="rgba(0, 0, 0, 0.2)"
                          activeIndex={activeIndex}
                          activeShape={(props) => {
                            const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
                            return (
                              <g>
                                <Sector
                                  cx={cx}
                                  cy={cy}
                                  innerRadius={innerRadius}
                                  outerRadius={outerRadius + 10}
                                  startAngle={startAngle}
                                  endAngle={endAngle}
                                  fill={fill}
                                  filter="drop-shadow(0 0 15px rgba(45, 212, 191, 0.5))"
                                />
                                <Sector
                                  cx={cx}
                                  cy={cy}
                                  innerRadius={outerRadius + 12}
                                  outerRadius={outerRadius + 18}
                                  startAngle={startAngle}
                                  endAngle={endAngle}
                                  fill={fill}
                                  opacity={0.3}
                                />
                              </g>
                            );
                          }}
                        >
                          {difficultyData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                          <Label
                            content={({ viewBox }) => {
                              if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                                const total = difficultyData.reduce((sum, item) => sum + item.count, 0);
                                // Calculate accuracy based on LeetCode total if available
                                // const accuracy = total > 0 ? ((total / (total + 100)) * 100).toFixed(1) : '0.0';
                                return (
                                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                    <tspan x={viewBox.cx} y={(viewBox.cy || 0) - 10} className="fill-white text-4xl font-bold">
                                      {total}
                                    </tspan>
                                    <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-gray-400 text-sm">
                                      Total Solved
                                    </tspan>
                                  </text>
                                );
                              }
                            }}
                          />
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const total = difficultyData.reduce((sum, item) => sum + item.count, 0);
                              const percentage = ((payload[0].value / total) * 100).toFixed(1);
                              const itemColor = payload[0].payload.fill;
                              return (
                                <div 
                                  className="text-white px-4 py-2 rounded-lg shadow-2xl border border-white/20"
                                  style={{ backgroundColor: itemColor }}
                                >
                                  <p className="text-xs opacity-80 font-medium">{payload[0].name}</p>
                                  <p className="text-lg font-bold">{payload[0].value} problems</p>
                                  <p className="text-xs opacity-90">{percentage}% of total</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  ) : (
                    <div className="flex justify-center items-center h-64 mb-6 sm:mb-8">
                      <div className="text-center">
                        <p className="text-gray-400 text-sm">No problems added yet</p>
                        <p className="text-gray-500 text-xs mt-2">Add some LeetCode problems to see your progress</p>
                      </div>
                    </div>
                  )}

                  {/* Legend */}
                  <div className="space-y-3 pt-4 border-t border-white/10">
                    {difficultyData.map((item) => (
                      <div 
                        key={item.difficulty}
                        onClick={() => setActiveDifficulty(item.difficulty)}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                          activeDifficulty === item.difficulty
                            ? 'bg-gray-800/60 border border-teal-500/40'
                            : 'bg-gray-900/30 border border-white/5 hover:bg-gray-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.fill }}
                          ></div>
                          <span className="text-sm font-semibold text-white">{item.difficulty}</span>
                        </div>
                        <span className="text-lg font-bold text-white">{item.count}</span>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-gray-400 text-sm font-medium">Total Problems</span>
                    <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">
                      {difficultyData.reduce((sum, item) => sum + item.count, 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Solved Problems */}
              <div className="bg-gradient-to-br from-teal-900/40 via-emerald-900/30 to-teal-900/40 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-teal-500/30 p-4 sm:p-6 lg:p-8 shadow-2xl shadow-teal-500/20 relative overflow-hidden">
                {/* Animated Glow effects */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-400/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-400/30 rounded-full blur-3xl animate-pulse"></div>
                
                <div className="relative z-10">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-white">Recent Solved Problems</h3>
                  <button className="text-teal-400 text-xs sm:text-sm flex items-center gap-1 sm:gap-2 hover:text-teal-300 transition-colors group">
                    View all
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {formattedRecentProblems.length > 0 ? (
                    formattedRecentProblems.map((problem, index) => (
                      <div 
                        key={index}
                        className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 border border-white/10 hover:border-teal-500/40 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-teal-500/20 group"
                      >
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-teal-500/30 to-emerald-500/30 flex items-center justify-center flex-shrink-0 border border-teal-500/40 shadow-lg shadow-teal-500/30 group-hover:shadow-teal-500/50 transition-all">
                            {problem.icon === 'chart' ? (
                              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-teal-400" />
                            ) : (
                              <Link2 className="w-5 h-5 sm:w-6 sm:h-6 text-teal-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1 sm:mb-2">
                              <h4 className="text-white font-semibold text-sm sm:text-base leading-tight">{problem.title}</h4>
                            </div>
                            <div className="flex items-center justify-between text-[10px] sm:text-xs mb-1 sm:mb-2">
                              <span className={`font-semibold ${
                                problem.difficulty === 'Easy' 
                                  ? 'text-emerald-400' 
                                  : problem.difficulty === 'Medium'
                                  ? 'text-yellow-400'
                                  : 'text-red-400'
                              }`}>
                                ({problem.difficulty})
                              </span>
                              <span className={`font-semibold ${
                                problem.status === 'Revised' ? 'text-teal-400' : 'text-gray-400'
                              }`}>{problem.status}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-400 py-8">
                      No recent problems found
                    </div>
                  )}
                </div>
                </div>
              </div>
            </div>
          </div>
    </>
  );
};

export default TestDashboard;
