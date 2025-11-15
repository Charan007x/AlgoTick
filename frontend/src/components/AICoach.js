import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AICoach = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      console.log('🔑 Token exists:', !!token);
      
      if (!token) {
        setError('Not authenticated. Please login first.');
        setLoading(false);
        return;
      }
      
      console.log('📡 Fetching AI Coach dashboard...');
      const response = await axios.get(`${API_URL}/ai-coach/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('✅ AI Coach data received:', response.data);
      setData(response.data.data);
    } catch (err) {
      console.error('❌ AI Coach Error:', err);
      console.error('Response:', err.response?.data);
      console.error('Status:', err.response?.status);
      
      if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else {
        setError(err.response?.data?.message || 'Failed to load AI coach data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const response = await axios.post(`${API_URL}/ai-coach/refresh`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setData({
        ...response.data.data,
        canRefresh: response.data.data.canRefresh || false,
        timeUntilRefresh: response.data.data.timeUntilRefresh || { hours: 0, minutes: 0, canRefresh: false }
      });
    } catch (err) {
      console.error('Refresh Error:', err);
      
      if (err.response?.status === 429) {
        // Cooldown active - show time remaining
        const timeData = err.response.data.timeUntilRefresh;
        if (timeData) {
          setError(`Next refresh available in ${timeData.hours}h ${timeData.minutes}m`);
          // Update data to show cooldown
          if (data) {
            setData({
              ...data,
              canRefresh: false,
              timeUntilRefresh: timeData
            });
          }
        } else {
          setError(err.response.data.message);
        }
      } else {
        setError(err.response?.data?.message || 'Failed to refresh recommendations');
      }
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-900/20 to-violet-900/20 backdrop-blur-md border border-purple-500/30 rounded-2xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-purple-500/20 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-purple-500/20 rounded w-full mb-2"></div>
          <div className="h-4 bg-purple-500/20 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-gradient-to-br from-purple-900/20 to-violet-900/20 backdrop-blur-md border border-purple-500/30 rounded-2xl p-6">
        <div className="text-red-400">
          <p className="font-semibold">Error loading AI coach</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-violet-900/20 backdrop-blur-md border border-purple-500/30 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl">🤖</span>
            AI Coach
          </h2>
          <p className="text-sm text-white/70 mt-1">
            Personalized recommendations based on your weak topics
          </p>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
            !refreshing
              ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:from-purple-700 hover:to-violet-700 hover:shadow-lg hover:shadow-purple-500/50'
              : 'bg-white/5 text-white/30 cursor-not-allowed'
          }`}
        >
          <svg
            className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {refreshing ? 'Refreshing...' : (!data ? 'Generate' : 'Refresh')}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Topics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Strong Topics */}
        <div>
          <h3 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
            <span className="text-green-400">💪</span>
            Strong Topics
          </h3>
          <div className="flex flex-wrap gap-2">
            {data?.strongTopics?.map((topic, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-green-500/20 text-green-300 rounded-full text-sm font-medium border border-green-500/30 hover:bg-green-500/30 transition-all"
              >
                {topic}
              </span>
            )) || (
              <p className="text-sm text-white/50">No strong topics yet</p>
            )}
          </div>
        </div>

        {/* Weak Topics */}
        <div>
          <h3 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
            <span className="text-red-400">📍</span>
            Weak Topics
          </h3>
          <div className="flex flex-wrap gap-2">
            {data?.weakTopics?.map((topic, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-red-500/20 text-red-300 rounded-full text-sm font-medium border border-red-500/30 hover:bg-red-500/30 transition-all"
              >
                {topic}
              </span>
            )) || (
              <p className="text-sm text-white/50">No weak topics identified</p>
            )}
          </div>
        </div>
      </div>

      {/* Recommendations Section */}
      <div>
        <h3 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
          <span>🎯</span>
          Recommended Problems
        </h3>
        
        {data?.recommendations && data.recommendations.length > 0 ? (
          <div className="space-y-3">
            {data.recommendations.map((rec, index) => (
              <a
                key={index}
                href={rec.leetcodeUrl || `https://leetcode.com/problems/${rec.titleSlug}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:border-purple-500/50 hover:bg-white/10 hover:shadow-lg transition-all duration-200 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                        {rec.title}
                      </h4>
                      <svg
                        className="w-4 h-4 text-white/40 group-hover:text-purple-400 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          rec.difficulty === 'Easy'
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : rec.difficulty === 'Medium'
                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}
                      >
                        {rec.difficulty}
                      </span>
                      <span className="text-purple-300 font-medium">{rec.topic}</span>
                    </div>
                    {rec.reason && (
                      <p className="text-sm text-white/60 mt-2">{rec.reason}</p>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-white/50">
            <p className="text-sm">No recommendations available</p>
            <p className="text-xs mt-1">Click generate to create recommendations</p>
          </div>
        )}
      </div>

      {/* Last Updated */}
      {data?.lastRefreshed && (
        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-xs text-white/50 text-center">
            Last updated: {new Date(data.lastRefreshed).toLocaleString()}
            {data?.cached && ' (cached)'}
          </p>
        </div>
      )}
    </div>
  );
};

export default AICoach;
