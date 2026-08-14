import React, { useState, useEffect } from 'react';
import { Save, Eye, EyeOff, Mail, Lock, UserCircle } from 'lucide-react';
import axios from 'axios';

const Profile = () => {
  const [userData, setUserData] = useState({ username: '', email: '', displayName: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
  }, []);

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
    <>
      {/* Page Title */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 sm:mb-8 tracking-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">Profile Settings</span>
        </h2>
        
        <div className="flex gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="flex-1">
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
    </>
  );
};

export default Profile;
