import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, TrendingUp, Award, Shield } from 'lucide-react';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';

const Settings = () => {
  const queryClient = useQueryClient();
  const [leetcodeUsername, setLeetcodeUsername] = useState('');
  const [currentUsername, setCurrentUsername] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [leetcodeStats, setLeetcodeStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchCurrentUsername();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCurrentUsername = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCurrentUsername(response.data.user.leetcodeUsername);
      setLeetcodeUsername(response.data.user.leetcodeUsername || '');
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const extractUsername = (input) => {
    const urlPattern = /leetcode\.com\/u\/([^/]+)/i;
    const match = input.match(urlPattern);
    if (match) {
      return match[1];
    }
    return input.trim();
  };

  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    
    if (!leetcodeUsername.trim()) {
      setMessage({ type: 'error', text: 'LeetCode username cannot be empty' });
      return;
    }

    const extractedUsername = extractUsername(leetcodeUsername);
    
    if (!extractedUsername) {
      setMessage({ type: 'error', text: 'Please enter a valid LeetCode username or URL' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/auth/leetcode-username`,
        { leetcodeUsername: extractedUsername },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCurrentUsername(response.data.leetcodeUsername);
      setLeetcodeUsername(response.data.leetcodeUsername);
      setMessage({ 
        type: 'success', 
        text: 'LeetCode username updated successfully!' 
      });

      queryClient.invalidateQueries({ queryKey: queryKeys.leetcodeActivity });
      fetchLeetCodeStats();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update username' 
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLeetCodeStats = async () => {
    if (!currentUsername && !leetcodeUsername.trim()) {
      setMessage({ type: 'error', text: 'Please set your LeetCode username first' });
      return;
    }

    setLoadingStats(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/questions/leetcode-activity`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setLeetcodeStats(response.data.activity);
      setMessage({ type: 'success', text: 'LeetCode stats fetched successfully!' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to fetch LeetCode stats' 
      });
    } finally {
      setLoadingStats(false);
    }
  };

  return (
    <>
      {/* Page Title */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 sm:mb-8 tracking-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">Settings</span>
        </h2>
        
        <div className="flex gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Message Display */}
            {message.text && (
              <div
                className={`mb-6 p-4 rounded-xl backdrop-blur-sm border ${
                  message.type === 'success'
                    ? 'bg-teal-500/10 text-teal-400 border-teal-500/30'
                    : 'bg-red-500/10 text-red-400 border-red-500/30'
                }`}
              >
                {message.text}
              </div>
            )}

            {/* LeetCode Username Section */}
            <div className="bg-gradient-to-br from-teal-900/40 via-emerald-900/30 to-teal-900/40 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-teal-500/30 p-6 mb-6 shadow-2xl shadow-teal-500/20 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-400/30 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-400/30 rounded-full blur-3xl animate-pulse"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-6 h-6 text-teal-400" />
                  <h2 className="text-2xl font-semibold text-white">LeetCode Integration</h2>
                </div>
                
                <div className="mb-6 p-4 bg-white/5 border border-teal-500/20 rounded-xl">
                  <p className="text-white/60 mb-1 text-sm">Current LeetCode Username</p>
                  <p className="font-semibold text-teal-400 text-lg">
                    {currentUsername || 'Not set'}
                  </p>
                </div>

                <form onSubmit={handleUpdateUsername} className="space-y-5">
                  <div>
                    <label htmlFor="leetcodeUsername" className="block text-sm font-medium text-white/80 mb-2">
                      LeetCode Username
                    </label>
                    <input
                      type="text"
                      id="leetcodeUsername"
                      value={leetcodeUsername}
                      onChange={(e) => setLeetcodeUsername(e.target.value)}
                      placeholder="Enter username only (e.g., Charan007x)"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all backdrop-blur-sm"
                    />
                    <p className="text-sm text-white/50 mt-2">
                      Enter just your username (e.g., <code className="bg-white/10 px-2 py-0.5 rounded text-teal-400">Charan007x</code>) or paste your profile URL
                    </p>
                    <p className="text-xs text-white/40 mt-1">
                      Find it at: https://leetcode.com/u/<strong className="text-teal-400">YOUR_USERNAME</strong>/
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-teal-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {loading ? 'Updating...' : 'Update LeetCode Username'}
                  </button>
                </form>
              </div>
            </div>

            {/* LeetCode Stats Section */}
            <div className="bg-gradient-to-br from-teal-900/40 via-emerald-900/30 to-teal-900/40 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-teal-500/30 p-6 mb-6 shadow-2xl shadow-teal-500/20 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-400/30 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-400/30 rounded-full blur-3xl animate-pulse"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <Award className="w-6 h-6 text-teal-400" />
                  <h2 className="text-2xl font-semibold text-white">Your LeetCode Stats</h2>
                </div>

                <button
                  onClick={fetchLeetCodeStats}
                  disabled={loadingStats || !currentUsername}
                  className="mb-6 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-teal-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <RefreshCw className={`w-5 h-5 ${loadingStats ? 'animate-spin' : ''}`} />
                  {loadingStats ? 'Loading Stats...' : 'Fetch My LeetCode Stats'}
                </button>

                {!currentUsername && (
                  <p className="text-white/50 italic">
                    Please set your LeetCode username first to view stats
                  </p>
                )}

                {leetcodeStats && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white/5 backdrop-blur-sm border border-teal-500/30 p-5 rounded-xl">
                      <p className="text-sm text-white/70 mb-2">Total Solved</p>
                      <p className="text-3xl font-bold text-white">
                        {leetcodeStats.totalSolved}
                      </p>
                    </div>

                    <div className="bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/30 p-5 rounded-xl">
                      <p className="text-sm text-white/70 mb-2">Easy</p>
                      <p className="text-3xl font-bold text-emerald-400">
                        {leetcodeStats.easySolved}
                      </p>
                    </div>

                    <div className="bg-yellow-400/10 backdrop-blur-sm border border-yellow-400/30 p-5 rounded-xl">
                      <p className="text-sm text-white/70 mb-2">Medium</p>
                      <p className="text-3xl font-bold text-yellow-400">
                        {leetcodeStats.mediumSolved}
                      </p>
                    </div>

                    <div className="bg-red-400/10 backdrop-blur-sm border border-red-400/30 p-5 rounded-xl">
                      <p className="text-sm text-white/70 mb-2">Hard</p>
                      <p className="text-3xl font-bold text-red-400">
                        {leetcodeStats.hardSolved}
                      </p>
                    </div>

                    {leetcodeStats.ranking && (
                      <div className="bg-purple-400/10 backdrop-blur-sm border border-purple-400/30 p-5 rounded-xl col-span-full">
                        <p className="text-sm text-white/70 mb-2">Global Ranking</p>
                        <p className="text-3xl font-bold text-purple-400">
                          #{leetcodeStats.ranking.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Privacy Instructions */}
            <div className="bg-yellow-500/10 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/20 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-yellow-400/20 rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-yellow-400" />
                  <h3 className="text-lg font-semibold text-yellow-400">Important: Privacy Settings</h3>
                </div>
                <p className="text-white/80 mb-3">
                  Make sure your LeetCode profile is set to <strong className="text-teal-400">Public</strong> for the verification to work!
                </p>
                <ol className="list-decimal list-inside text-white/70 space-y-2">
                  <li>Go to LeetCode Settings</li>
                  <li>Navigate to Privacy section</li>
                  <li>Set profile visibility to "Public"</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
    </>
  );
};

export default Settings;
