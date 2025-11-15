import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';

const Settings = () => {
  const [leetcodeUsername, setLeetcodeUsername] = useState('');
  const [currentUsername, setCurrentUsername] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [leetcodeStats, setLeetcodeStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Fetch current username on component mount
  useEffect(() => {
    fetchCurrentUsername();
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
    // If it's a URL, extract the username from it
    const urlPattern = /leetcode\.com\/u\/([^/]+)/i;
    const match = input.match(urlPattern);
    if (match) {
      return match[1];
    }
    // Otherwise, return the input as-is (assuming it's just a username)
    return input.trim();
  };

  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    
    if (!leetcodeUsername.trim()) {
      setMessage({ type: 'error', text: 'LeetCode username cannot be empty' });
      return;
    }

    // Extract username from URL if user pasted a URL
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
      setLeetcodeUsername(response.data.leetcodeUsername); // Update input to show just username
      setMessage({ 
        type: 'success', 
        text: 'LeetCode username updated successfully!' 
      });
      
      // Fetch stats after successful update
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
      <Navbar />
      <div className="min-h-screen bg-black py-8 pt-24 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8 animate-fadeIn">Settings</h1>

        {/* LeetCode Username Section */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-6 animate-fadeIn delay-100">
          <h2 className="text-2xl font-semibold text-white mb-4">
            LeetCode Integration
          </h2>
          
          <div className="mb-6">
            <p className="text-white/60 mb-2">
              Current LeetCode Username: {' '}
              <span className="font-semibold text-[#61dca3]">
                {currentUsername || 'Not set'}
              </span>
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
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#61dca3] focus:border-transparent transition-all"
              />
              <p className="text-sm text-white/50 mt-2">
                💡 Enter just your username (e.g., <code className="bg-white/10 px-2 py-0.5 rounded text-[#61dca3]">Charan007x</code>) or paste your profile URL
              </p>
              <p className="text-xs text-white/40 mt-1">
                Find it at: https://leetcode.com/u/<strong className="text-[#61dca3]">YOUR_USERNAME</strong>/
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#61dca3] to-[#61b3dc] text-black font-bold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-[#61dca3]/50 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Updating...' : 'Update LeetCode Username'}
            </button>
          </form>

          {/* Message Display */}
          {message.text && (
            <div
              className={`mt-4 p-4 rounded-xl backdrop-blur-sm ${
                message.type === 'success'
                  ? 'bg-[#61dca3]/10 text-[#61dca3] border border-[#61dca3]/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}
            >
              {message.text}
            </div>
          )}
        </div>

        {/* LeetCode Stats Section */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Your LeetCode Stats
          </h2>

          <button
            onClick={fetchLeetCodeStats}
            disabled={loadingStats || !currentUsername}
            className="mb-4 bg-gradient-to-r from-[#61dca3] to-[#61b3dc] text-black font-bold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-[#61dca3]/50 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loadingStats ? 'Loading Stats...' : 'Fetch My LeetCode Stats'}
          </button>

          {!currentUsername && (
            <p className="text-white/50 italic">
              Please set your LeetCode username first to view stats
            </p>
          )}

          {leetcodeStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <div className="bg-gradient-to-br from-[#61dca3]/20 to-[#61b3dc]/20 backdrop-blur-sm border border-[#61dca3]/30 p-5 rounded-xl">
                <p className="text-sm text-white/70 mb-1">Total Solved</p>
                <p className="text-3xl font-bold text-white">
                  {leetcodeStats.totalSolved}
                </p>
              </div>

              <div className="bg-gradient-to-br from-[#61dca3]/20 to-emerald-500/20 backdrop-blur-sm border border-[#61dca3]/30 p-5 rounded-xl">
                <p className="text-sm text-white/70 mb-1">Easy</p>
                <p className="text-3xl font-bold text-[#61dca3]">
                  {leetcodeStats.easySolved}
                </p>
              </div>

              <div className="bg-gradient-to-br from-yellow-400/20 to-orange-400/20 backdrop-blur-sm border border-yellow-400/30 p-5 rounded-xl">
                <p className="text-sm text-white/70 mb-1">Medium</p>
                <p className="text-3xl font-bold text-yellow-400">
                  {leetcodeStats.mediumSolved}
                </p>
              </div>

              <div className="bg-gradient-to-br from-red-400/20 to-pink-400/20 backdrop-blur-sm border border-red-400/30 p-5 rounded-xl">
                <p className="text-sm text-white/70 mb-1">Hard</p>
                <p className="text-3xl font-bold text-red-400">
                  {leetcodeStats.hardSolved}
                </p>
              </div>

              {leetcodeStats.ranking && (
                <div className="bg-gradient-to-br from-purple-400/20 to-pink-400/20 backdrop-blur-sm border border-purple-400/30 p-5 rounded-xl col-span-full">
                  <p className="text-sm text-white/70 mb-1">Global Ranking</p>
                  <p className="text-3xl font-bold text-purple-400">
                    #{leetcodeStats.ranking.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Instructions Section */}
        <div className="bg-yellow-500/10 backdrop-blur-sm rounded-2xl p-6 mt-6 border border-yellow-500/20">
          <h3 className="text-lg font-semibold text-yellow-400 mb-2">
            ⚠️ Important: Privacy Settings
          </h3>
          <p className="text-white/80">
            Make sure your LeetCode profile is set to <strong className="text-[#61dca3]">Public</strong> for the verification to work!
          </p>
          <ol className="list-decimal list-inside mt-2 text-white/70 space-y-1">
            <li>Go to LeetCode Settings</li>
            <li>Navigate to Privacy section</li>
            <li>Set profile visibility to "Public"</li>
          </ol>
        </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
