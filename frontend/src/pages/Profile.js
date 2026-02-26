import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Home, List, FlaskConical, StickyNote, Settings, Bell, LogOut, Save, Eye, EyeOff, Mail, Lock, UserCircle } from 'lucide-react';
import { notificationsAPI } from '../services/api';
import axios from 'axios';

const Profile = () => {
  const navigate = useNavigate();
  const [hoveredNav, setHoveredNav] = useState(null);
  // const [activeNav, setActiveNav] = useState('profile');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userData, setUserData] = useState({ username: '', email: '', displayName: '' });
  const [topNotifications, setTopNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  const [profileData, setProfileData] = useState({
    displayName: '',
    email: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const navItems = [
    { id: 'home', icon: Home, label: 'Home', path: '/home' },
    { id: 'lists', icon: List, label: 'Lists', path: '/lists' },
    { id: 'labs', icon: FlaskConical, label: 'Labs', path: '/labs' },
    { id: 'notes', icon: StickyNote, label: 'Notes', path: '/notes' },
    { id: 'settings', icon: Settings, label: 'Settings', path: '/settings' },
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
      email: user.email || 'user@example.com',
      displayName: user.displayName || ''
    });

    setProfileData({
      displayName: user.displayName || '',
      email: user.email || ''
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!profileData.displayName.trim()) {
      showMessage('error', 'Display name cannot be empty');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/auth/profile`,
        { displayName: profileData.displayName, email: profileData.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update localStorage
      const updatedUser = { ...JSON.parse(localStorage.getItem('user') || '{}'), ...response.data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setUserData({
        username: updatedUser.username,
        email: updatedUser.email,
        displayName: updatedUser.displayName
      });

      showMessage('success', 'Profile updated successfully!');
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      showMessage('error', 'All password fields are required');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('error', 'New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showMessage('error', 'New password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/auth/password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      showMessage('success', 'Password changed successfully!');
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
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

            {/* Desktop Icons */}
            <div className="hidden md:flex items-center gap-3">
              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowProfileMenu(false);
                  }}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors relative"
                >
                  <Bell className="w-5 h-5 text-gray-300" />
                  {topNotifications.some(n => !n.readBy?.some(r => r.userId === JSON.parse(localStorage.getItem('user') || '{}')._id)) && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-teal-400 rounded-full"></span>
                  )}
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
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">Profile Settings</span>
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
                    onClick={() => navigate(item.path)}
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
          <div className="flex-1 lg:ml-24 xl:ml-28">
            {/* Message Display */}
            {message.text && (
              <div className={`mb-6 p-4 rounded-xl border ${
                message.type === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}>
                {message.text}
              </div>
            )}

            {/* Profile Information Section */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 mb-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 via-emerald-500 to-teal-500 p-1 shadow-xl shadow-teal-500/30">
                  <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                    <UserCircle className="w-12 h-12 text-teal-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{userData.displayName || userData.username}</h3>
                  <p className="text-gray-400">@{userData.username}</p>
                </div>
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <UserCircle className="w-4 h-4 inline mr-2" />
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={profileData.displayName}
                    onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                    placeholder="Enter display name"
                    className="w-full bg-gray-800/40 border border-white/10 rounded-xl py-3 px-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">This is how your name will appear across the platform</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    placeholder="Enter email"
                    className="w-full bg-gray-800/40 border border-white/10 rounded-xl py-3 px-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Username (Read-only)
                  </label>
                  <input
                    type="text"
                    value={userData.username}
                    disabled
                    className="w-full bg-gray-800/20 border border-white/5 rounded-xl py-3 px-4 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-teal-400 to-emerald-500 text-black font-semibold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-teal-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {loading ? 'Saving...' : 'Save Profile'}
                </button>
              </form>
            </div>

            {/* Password Change Section */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Change Password</h3>
                  <p className="text-sm text-gray-400">Update your account password</p>
                </div>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                      className="w-full bg-gray-800/40 border border-white/10 rounded-xl py-3 px-4 pr-12 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="Enter new password"
                      className="w-full bg-gray-800/40 border border-white/10 rounded-xl py-3 px-4 pr-12 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                      className="w-full bg-gray-800/40 border border-white/10 rounded-xl py-3 px-4 pr-12 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-400 to-red-500 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-orange-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Lock className="w-5 h-5" />
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
