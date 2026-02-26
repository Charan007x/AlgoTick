import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Home, List, FlaskConical, StickyNote, Settings as SettingsIcon, Save, RefreshCw, TrendingUp, Award, Shield, Bell, LogOut } from 'lucide-react';
import axios from 'axios';
import { notificationsAPI } from '../services/api';

const Settings = () => {
  const navigate = useNavigate();
  const [leetcodeUsername, setLeetcodeUsername] = useState('');
  const [currentUsername, setCurrentUsername] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [leetcodeStats, setLeetcodeStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [hoveredNav, setHoveredNav] = useState(null);
  const [activeNav, setActiveNav] = useState('settings');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userData, setUserData] = useState({ username: '', email: '' });
  const [topNotifications, setTopNotifications] = useState([]);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Navigation items
  const navItems = [
    { id: 'home', icon: Home, label: 'Home', path: '/home' },
    { id: 'lists', icon: List, label: 'Lists', path: '/lists' },
    { id: 'labs', icon: FlaskConical, label: 'Labs', path: '/labs' },
    { id: 'notes', icon: StickyNote, label: 'Notes', path: '/notes' },
    { id: 'settings', icon: SettingsIcon, label: 'Settings', path: '/settings' },
    { id: 'profile', icon: User, label: 'Profile', path: '/profile' }
  ];

  const getScale = (currentIndex, hoveredIndex) => {
    if (hoveredIndex === null) return 1;
    const distance = Math.abs(currentIndex - hoveredIndex);
    if (distance === 0) return 1.6;
    if (distance === 1) return 1.3;
    if (distance === 2) return 1.15;
    return 1;
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserData({
      username: user.username || 'User',
      email: user.email || 'user@example.com'
    });

    const fetchTopNotifications = async () => {
      try {
        const response = await notificationsAPI.getNotifications();
        setTopNotifications((response.data || []).slice(0, 2));
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchTopNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    if (showNotifications || showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications, showProfileMenu]);

  // Fetch current username on component mount
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden font-['Inter',sans-serif]">
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(45, 212, 191, 0.3) 10px, rgba(45, 212, 191, 0.3) 11px)`,
        }}></div>
      </div>
      
      {/* Gradient Orbs */}
      <div className="absolute top-20 right-40 w-96 h-96 bg-gradient-to-br from-teal-500/20 to-emerald-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-40 left-40 w-96 h-96 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl"></div>

      {/* Pill-Shaped Glassmorphism Navigation */}
      <nav className="fixed top-3 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl sm:rounded-full px-4 sm:px-8 shadow-2xl">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-base sm:text-lg font-bold text-black">✓</span>
              </div>
              <span className="text-lg sm:text-xl font-bold tracking-tight">
                <span className="text-white">Algo</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">Tick</span>
              </span>
            </div>
            
            {/* Desktop Search Bar */}
            <div className="flex-1 max-w-md lg:max-w-lg mx-4 sm:mx-8 lg:mx-12 hidden md:block">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-teal-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Search bar"
                  className="w-full bg-gray-800/40 border border-white/10 rounded-full py-2 pl-12 pr-5 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all backdrop-blur-xl text-sm"
                />
              </div>
            </div>

            {/* Desktop User Info - Notifications & Profile */}
            <div className="hidden md:flex items-center gap-3">
              {/* Notifications Bell */}
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowProfileMenu(false);
                  }}
                  className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Bell className="w-5 h-5 text-gray-300 hover:text-teal-400 transition-colors" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-teal-400 rounded-full"></span>
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-4 border-b border-white/10">
                      <h3 className="text-white font-semibold">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {topNotifications.length > 0 ? (
                        topNotifications.map((notification, index) => (
                          <div key={notification._id} className={`p-4 hover:bg-white/5 transition-colors ${index < topNotifications.length - 1 ? 'border-b border-white/5' : ''}`}>
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-2 ${!notification.readBy?.some(r => r.userId === JSON.parse(localStorage.getItem('user') || '{}')._id) ? 'bg-teal-400' : 'bg-white/20'}`}></div>
                              <div className="flex-1">
                                <p className="text-white text-sm font-medium">{notification.title}</p>
                                <p className="text-gray-400 text-xs mt-1">{notification.description}</p>
                                <p className="text-gray-500 text-xs mt-1">{new Date(notification.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-400 text-sm">
                          No notifications yet
                        </div>
                      )}
                    </div>
                    <div className="p-3 border-t border-white/10">
                      <button 
                        onClick={() => navigate('/notifications')}
                        className="w-full text-center text-teal-400 hover:text-teal-300 text-sm font-medium transition-colors"
                      >
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Avatar */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotifications(false);
                  }}
                  className="hover:scale-105 transition-transform"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 via-emerald-500 to-teal-500 p-0.5 shadow-lg shadow-teal-500/30">
                    <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                      <User className="w-5 h-5 text-teal-400" />
                    </div>
                  </div>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-4 border-b border-white/10">
                      <p className="text-white font-medium text-sm">Hi {userData.username}</p>
                      <p className="text-gray-400 text-xs mt-1">{userData.email}</p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-white/10 py-4 space-y-3">
              <div className="px-4">
                <Search className="absolute left-8 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search bar"
                  className="w-full bg-gray-800/40 border border-white/10 rounded-full py-2 pl-10 pr-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-sm"
                />
              </div>
              <div className="flex items-center gap-2 px-4 py-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 via-emerald-500 to-teal-500 p-0.5">
                  <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                    <User className="w-4 h-4 text-teal-400" />
                  </div>
                </div>
                <span className="text-gray-200 font-medium text-sm">Hi {userData.username}</span>
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="relative z-10 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 mt-20 sm:mt-24">
        {/* Page Title */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 sm:mb-8 tracking-tight lg:ml-28 xl:ml-32">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">Settings</span>
        </h2>
        
        <div className="flex gap-4 sm:gap-6">
          {/* Floating Left Sidebar */}
          <div className="hidden lg:flex">
            <div className="fixed left-4 xl:left-8 top-1/2 transform -translate-y-1/2 bg-gradient-to-b from-gray-800/60 via-gray-800/80 to-gray-900/60 backdrop-blur-2xl rounded-full p-3 border border-white/10 shadow-2xl shadow-black/50 flex flex-col gap-6 z-50">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const scale = getScale(index, hoveredNav);
                const isActive = activeNav === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveNav(item.id);
                      navigate(item.path);
                    }}
                    onMouseEnter={() => setHoveredNav(index)}
                    onMouseLeave={() => setHoveredNav(null)}
                    className={`p-3 rounded-full transition-all duration-300 relative group ${
                      isActive 
                        ? 'bg-gradient-to-br from-teal-400 to-emerald-500 shadow-lg shadow-teal-500/50' 
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                    style={{
                      transform: `scale(${scale})`,
                      transformOrigin: 'center'
                    }}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-black' : 'text-gray-300'}`} />
                    
                    {/* Tooltip */}
                    <div className="absolute left-full ml-4 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">
                      {item.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 lg:ml-20">
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
      </div>
    </div>
  );
};

export default Settings;
