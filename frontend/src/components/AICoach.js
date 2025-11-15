import React, { useState, useEffect } from 'react';
import { aiAPI } from '../services/api';

const AICoach = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await aiAPI.getInsights();
      setInsights(response.data);
    } catch (error) {
      console.error('Failed to fetch AI insights:', error);
      if (error.response?.status !== 404) {
        setError(error.response?.data?.message || 'Failed to load AI insights');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const response = await aiAPI.refreshInsights();
      setInsights(response.data);
    } catch (error) {
      console.error('Failed to refresh insights:', error);
      setError(error.response?.data?.message || 'Failed to refresh insights');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 bg-white/10 rounded w-48"></div>
          <div className="h-10 bg-white/10 rounded w-24"></div>
        </div>
        <div className="space-y-4">
          <div className="h-4 bg-white/10 rounded w-full"></div>
          <div className="h-4 bg-white/10 rounded w-3/4"></div>
          <div className="h-4 bg-white/10 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm text-center">
        <span className="text-5xl mb-4 block">⚠️</span>
        <h3 className="text-xl font-bold text-white mb-2">Error Loading Insights</h3>
        <p className="text-white/60 mb-6">{error}</p>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="bg-gradient-to-r from-[#61dca3] to-[#61b3dc] text-black font-bold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-[#61dca3]/50 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!insights || !insights.profile) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm text-center">
        <span className="text-5xl mb-4 block">🤖</span>
        <h3 className="text-xl font-bold text-white mb-2">No AI Insights Yet</h3>
        <p className="text-white/60 mb-6">Add questions to get personalized insights</p>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="bg-gradient-to-r from-[#61dca3] to-[#61b3dc] text-black font-bold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-[#61dca3]/50 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {refreshing ? 'Generating...' : 'Generate Insights'}
        </button>
      </div>
    );
  }

  const { profile, summary, strengths, weaknesses, weeklyGoal, revisionFeedback, behavioralTips } = insights;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🤖</span>
          <div>
            <h3 className="text-2xl font-bold text-white">AI Coach</h3>
            <p className="text-sm text-white/60">Personalized insights</p>
          </div>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-xl border border-white/20 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span className={refreshing ? 'animate-spin' : ''}>🔄</span>
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="space-y-6">
        {/* Summary */}
        {summary && (
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h4 className="text-lg font-bold text-[#61dca3] mb-2">📊 Summary</h4>
            <p className="text-white/80">{summary}</p>
          </div>
        )}

        {/* Stats Grid */}
        {profile && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-[#61dca3]">{profile.totalSolved || 0}</div>
              <div className="text-sm text-white/60 mt-1">Problems Solved</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-yellow-400">{profile.streak || 0}</div>
              <div className="text-sm text-white/60 mt-1">Day Streak</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-blue-400">{profile.strongTopics?.length || 0}</div>
              <div className="text-sm text-white/60 mt-1">Strong Topics</div>
            </div>
          </div>
        )}

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Strengths */}
          {strengths && strengths.length > 0 && (
            <div className="bg-[#61dca3]/10 rounded-xl p-4 border border-[#61dca3]/30">
              <h4 className="text-lg font-bold text-[#61dca3] mb-3">💪 Strengths</h4>
              <ul className="space-y-2">
                {strengths.map((item, index) => (
                  <li key={index} className="text-white/80 text-sm flex items-start gap-2">
                    <span className="text-[#61dca3] mt-0.5">✓</span>
                    <span>
                      <strong>{item.topic}:</strong> {item.comment}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Weaknesses */}
          {weaknesses && weaknesses.length > 0 && (
            <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/30">
              <h4 className="text-lg font-bold text-red-400 mb-3">🎯 Areas to Improve</h4>
              <ul className="space-y-2">
                {weaknesses.map((item, index) => (
                  <li key={index} className="text-white/80 text-sm flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">!</span>
                    <span>
                      <strong>{item.topic}:</strong> {item.comment}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Weekly Goal */}
        {weeklyGoal && (
          <div className="bg-gradient-to-r from-[#61dca3]/10 to-[#61b3dc]/10 rounded-xl p-4 border border-white/20">
            <h4 className="text-lg font-bold text-white mb-2">🎯 Weekly Goal</h4>
            <p className="text-white/80">
              <strong>{weeklyGoal.focusTopic}</strong>: Solve {weeklyGoal.targetProblems} problems
              {weeklyGoal.expectedAccuracyImprovement && ` (Target: ${weeklyGoal.expectedAccuracyImprovement})`}
            </p>
          </div>
        )}

        {/* Revision Feedback */}
        {revisionFeedback && (
          <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/30">
            <h4 className="text-lg font-bold text-blue-400 mb-2">📖 Revision Feedback</h4>
            <p className="text-white/80">{revisionFeedback}</p>
          </div>
        )}

        {/* Behavioral Tips */}
        {behavioralTips && behavioralTips.length > 0 && (
          <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/30">
            <h4 className="text-lg font-bold text-yellow-400 mb-3">💡 Tips</h4>
            <ul className="space-y-2">
              {behavioralTips.map((tip, index) => (
                <li key={index} className="text-white/80 text-sm flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">→</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AICoach;
