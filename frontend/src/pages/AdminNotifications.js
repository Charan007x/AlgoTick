import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Send, Users, Award, TrendingUp, Zap, AlertCircle, X, Trash2, Eye } from 'lucide-react';
import { notificationsAPI } from '../services/api';
import { useConfirm } from '../context/ConfirmContext';
import AdminLoader from '../components/AdminLoader';

const AdminNotifications = () => {
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const [users, setUsers] = useState([]);
  const [allNotifications, setAllNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'system',
    recipients: 'all',
    specificUsers: []
  });

  const notificationTypes = [
    { value: 'achievement', label: 'Achievement', icon: Award, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    { value: 'streak', label: 'Streak', icon: Zap, color: 'text-teal-400', bg: 'bg-teal-500/20' },
    { value: 'progress', label: 'Progress', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
    { value: 'reminder', label: 'Reminder', icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-500/20' },
    { value: 'system', label: 'System', icon: Bell, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    { value: 'update', label: 'Update', icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/20' },
  ];

  useEffect(() => {
    // Check if user is admin
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'admin') {
      navigate('/home');
      return;
    }
    
    fetchUsers();
    fetchAllNotifications();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const response = await notificationsAPI.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchAllNotifications = async () => {
    try {
      const response = await notificationsAPI.getAllNotifications();
      setAllNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      setMessage({ type: 'error', text: 'Title and description are required' });
      return;
    }

    try {
      setLoading(true);
      const selectedType = notificationTypes.find(t => t.value === formData.type);
      
      await notificationsAPI.createNotification({
        ...formData,
        iconColor: selectedType.color,
        iconBg: selectedType.bg
      });

      setMessage({ type: 'success', text: 'Notification sent successfully!' });
      setFormData({
        title: '',
        description: '',
        type: 'system',
        recipients: 'all',
        specificUsers: []
      });
      
      fetchAllNotifications();
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to send notification' });
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (id) => {
    const confirmed = await confirm({
      title: 'Delete Notification',
      message: 'Permanently delete this notification?',
      confirmText: 'Delete',
      variant: 'danger'
    });
    
    if (!confirmed) return;
    
    try {
      await notificationsAPI.deleteNotificationPermanently(id);
      setAllNotifications(allNotifications.filter(n => n._id !== id));
      setMessage({ type: 'success', text: 'Notification deleted' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete notification' });
    }
  };

  const toggleUserSelection = (userId) => {
    setFormData(prev => ({
      ...prev,
      specificUsers: prev.specificUsers.includes(userId)
        ? prev.specificUsers.filter(id => id !== userId)
        : [...prev.specificUsers, userId]
    }));
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden font-['Inter',sans-serif] p-6">
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(45, 212, 191, 0.3) 10px, rgba(45, 212, 191, 0.3) 11px)`,
        }}></div>
      </div>
      
      {/* Gradient Orbs */}
      <div className="absolute top-20 right-40 w-96 h-96 bg-gradient-to-br from-teal-500/20 to-emerald-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-40 left-40 w-96 h-96 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl"></div>

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Admin - Notification Center</h1>
            <p className="text-gray-400">Send notifications to all users or specific individuals</p>
          </div>
          <button
            onClick={() => navigate('/home')}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 transition-all"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl backdrop-blur-sm border ${
            message.type === 'success'
              ? 'bg-teal-500/10 text-teal-400 border-teal-500/30'
              : 'bg-red-500/10 text-red-400 border-red-500/30'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Notification Form */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-lg flex items-center justify-center">
                <Send className="w-5 h-5 text-black" />
              </div>
              <h2 className="text-xl font-bold text-white">Create Notification</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-gray-800/40 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                  placeholder="Achievement Unlocked!"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full bg-gray-800/40 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 resize-none"
                  placeholder="Describe the notification..."
                  required
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Notification Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {notificationTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: type.value })}
                        className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                          formData.type === type.value
                            ? `${type.bg} ${type.color} border-current`
                            : 'bg-gray-800/40 text-gray-400 border-white/10 hover:bg-white/5'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recipients */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Recipients</label>
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, recipients: 'all', specificUsers: [] })}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                      formData.recipients === 'all'
                        ? 'bg-teal-500/20 text-teal-400 border-teal-500/30'
                        : 'bg-gray-800/40 text-gray-400 border-white/10 hover:bg-white/5'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    All Users
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, recipients: 'specific' })}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                      formData.recipients === 'specific'
                        ? 'bg-teal-500/20 text-teal-400 border-teal-500/30'
                        : 'bg-gray-800/40 text-gray-400 border-white/10 hover:bg-white/5'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Specific Users
                  </button>
                </div>

                {/* User Selection */}
                {formData.recipients === 'specific' && (
                  <div className="bg-gray-800/40 border border-white/10 rounded-xl p-4 max-h-60 overflow-y-auto">
                    {users.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center">No users available</p>
                    ) : (
                      <div className="space-y-2">
                        {users.filter(u => u.role !== 'admin').map((user) => (
                          <label
                            key={user._id}
                            className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={formData.specificUsers.includes(user._id)}
                              onChange={() => toggleUserSelection(user._id)}
                              className="w-4 h-4 text-teal-500 rounded focus:ring-2 focus:ring-teal-500/50"
                            />
                            <div>
                              <p className="text-white text-sm font-medium">{user.username}</p>
                              <p className="text-gray-500 text-xs">{user.email}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-500 hover:to-emerald-600 text-black font-semibold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Notification'}
              </button>
            </form>
          </div>

          {/* Recent Notifications */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">All Notifications ({allNotifications.length})</h2>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {allNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No notifications sent yet</p>
                </div>
              ) : (
                allNotifications.map((notif) => {
                  const typeInfo = notificationTypes.find(t => t.value === notif.type) || notificationTypes[4];
                  const Icon = typeInfo.icon;
                  
                  return (
                    <div
                      key={notif._id}
                      className="bg-gray-800/40 border border-white/10 rounded-xl p-4 hover:bg-white/5 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg ${typeInfo.bg} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-5 h-5 ${typeInfo.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold text-sm mb-1">{notif.title}</h3>
                          <p className="text-gray-400 text-xs mb-2 line-clamp-2">{notif.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>{notif.recipients === 'all' ? 'All users' : `${notif.specificUsers?.length || 0} users`}</span>
                              <span>•</span>
                              <span>{new Date(notif.createdAt).toLocaleDateString()}</span>
                            </div>
                            <button
                              onClick={() => deleteNotification(notif._id)}
                              className="p-1.5 hover:bg-red-500/20 rounded-lg text-red-400 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
