import React, { useState, useEffect, useRef } from 'react';
import { LineChart as MUILineChart } from '@mui/x-charts/LineChart';
import { useAnimate } from '@mui/x-charts/hooks';
import { ChartContainer } from '@mui/x-charts/ChartContainer';
import { BarPlot } from '@mui/x-charts/BarChart';
import { ChartsXAxis } from '@mui/x-charts/ChartsXAxis';
import { ChartsYAxis } from '@mui/x-charts/ChartsYAxis';
import { styled } from '@mui/material/styles';
import { interpolateObject } from '@mui/x-charts-vendor/d3-interpolate';
import { Download, RefreshCw, Users, Activity, Database, Clock, CheckCircle, XCircle, AlertCircle, Home, List, FlaskConical, Settings, User, Shield, Bell, Send, X, Trash2, LayoutDashboard, BellRing, CalendarClock, LogOut, Code2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import AdminLoader from './AdminLoader';
import AdminAlgorithms from './AdminAlgorithms';

// Styled Text component for bar labels
const BarLabelText = styled('text')(({ theme }) => ({
  stroke: 'none',
  fill: '#e5e7eb',
  transition: 'opacity 0.2s ease-in, fill 0.2s ease-in',
  textAnchor: 'middle',
  dominantBaseline: 'central',
  pointerEvents: 'none',
  fontSize: '14px',
  fontWeight: '600'
}));

// Bar Label component
function BarLabel(props) {
  const {
    seriesId,
    dataIndex,
    color,
    isFaded,
    isHighlighted,
    classes,
    xOrigin,
    yOrigin,
    x,
    y,
    width,
    height,
    layout,
    skipAnimation,
    ...otherProps
  } = props;

  const animatedProps = useAnimate(
    { x: x + width / 2, y: y - 8 },
    {
      initialProps: { x: x + width / 2, y: yOrigin },
      createInterpolator: interpolateObject,
      transformProps: (p) => p,
      applyProps: (element, p) => {
        element.setAttribute('x', p.x.toString());
        element.setAttribute('y', p.y.toString());
      },
      skip: skipAnimation,
    },
  );

  return (
    <BarLabelText {...otherProps} fill={color} textAnchor="middle" {...animatedProps} />
  );
}

const Admin = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const toast = useToast();
  const { confirm } = useConfirm();
  
  // API URL for backend
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [hoveredNav, setHoveredNav] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [userData, setUserData] = useState({ username: '', email: '' });
  const [activeSection, setActiveSection] = useState('dashboard'); // dashboard, notifications, cron
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  // Live sync state
  const [syncProgress, setSyncProgress] = useState(null);
  const [syncLogs, setSyncLogs] = useState([]);
  const eventSourceRef = useRef(null);

  // Notification state
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    description: '',
    type: 'system',
    recipients: 'all',
    iconColor: 'text-teal-400',
    iconBg: 'bg-teal-500/20'
  });
  const [sendingNotification, setSendingNotification] = useState(false);
  
  // Cron job states
  const [cronJobs, setCronJobs] = useState({
    leetcodeSync: true,
    aiCoach: true
  });
  
  // Sent notifications state
  const [sentNotifications, setSentNotifications] = useState([]);
  const [loadingSentNotifications, setLoadingSentNotifications] = useState(false);
  
  // User growth chart state
  const [userGrowthPeriod, setUserGrowthPeriod] = useState('week'); // 'week' or '6months'

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch admin stats');
      
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchSentNotifications = async () => {
    try {
      setLoadingSentNotifications(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/notifications/admin/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch sent notifications');
      
      const data = await response.json();
      setSentNotifications(data);
    } catch (err) {
      console.error('Error fetching sent notifications:', err);
    } finally {
      setLoadingSentNotifications(false);
    }
  };
  
  const handleDeleteNotification = async (notificationId) => {
    const confirmed = await confirm({
      title: 'Delete Notification',
      message: 'Are you sure you want to delete this notification? This will remove it from all users.',
      confirmText: 'Delete',
      variant: 'danger'
    });
    
    if (!confirmed) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/notifications/admin/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to delete notification');
      
      // Remove from local state
      setSentNotifications(sentNotifications.filter(notif => notif._id !== notificationId));
      toast.success('Notification deleted successfully!');
    } catch (err) {
      console.error('Error deleting notification:', err);
      toast.error('Failed to delete notification: ' + err.message);
    }
  };

  const fetchCronStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/cron-status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCronJobs(data);
      }
    } catch (error) {
      console.error('Error fetching cron status:', error);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserData({
      username: user.username || 'Admin',
      email: user.email || 'admin@example.com'
    });

    fetchAdminStats();
    fetchCronStatus();
    
    // Cleanup function
    return () => {
      // Close EventSource if still open
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Fetch sent notifications when notifications section is active
  useEffect(() => {
    if (activeSection === 'notifications') {
      fetchSentNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

  const handleSyncAll = async () => {
    try {
      setSyncing(true);
      setSyncProgress(null);
      setSyncLogs([]);

      // Close any existing EventSource
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Create new EventSource for SSE
      const eventSource = new EventSource(`${API_URL}/admin/sync-all-stream`, {
        withCredentials: true
      });
      
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Sync update:', data);

        if (data.type === 'start') {
          setSyncProgress({
            totalUsers: data.totalUsers,
            currentIndex: 0,
            successCount: 0,
            failCount: 0,
            skippedCount: 0
          });
          setSyncLogs(prev => [...prev, { type: 'info', message: data.message, timestamp: new Date() }]);
        } 
        else if (data.type === 'progress') {
          setSyncProgress({
            totalUsers: data.totalUsers,
            currentIndex: data.userIndex,
            currentUser: data.currentUser,
            successCount: data.successCount,
            failCount: data.failCount,
            skippedCount: data.skippedCount
          });
        } 
        else if (data.type === 'user-complete') {
          setSyncLogs(prev => [...prev, {
            type: data.status,
            username: data.username,
            message: data.message,
            timestamp: new Date()
          }]);
        } 
        else if (data.type === 'complete') {
          setSyncLogs(prev => [...prev, { type: 'success', message: data.message, timestamp: new Date() }]);
          eventSource.close();
          setSyncing(false);
          fetchAdminStats(); // Refresh stats
        } 
        else if (data.type === 'error') {
          setSyncLogs(prev => [...prev, { type: 'error', message: data.message, timestamp: new Date() }]);
          eventSource.close();
          setSyncing(false);
        }
      };

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        setSyncLogs(prev => [...prev, { type: 'error', message: 'Connection error', timestamp: new Date() }]);
        eventSource.close();
        setSyncing(false);
      };

    } catch (err) {
      console.error('Error starting sync:', err);
      toast.error('Failed to start sync: ' + err.message);
      setSyncing(false);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleClearStaleCache = async () => {
    const confirmed = await confirm({
      title: 'Clear Stale Cache',
      message: 'Are you sure you want to clear stale cache?',
      confirmText: 'Clear Cache',
      variant: 'warning'
    });
    
    if (!confirmed) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/clear-stale-cache`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to clear cache');
      
      const result = await response.json();
      toast.success(`Cache cleared! Problems: ${result.deleted.problems}, User Stats: ${result.deleted.userStats}`);
      await fetchAdminStats();
    } catch (err) {
      console.error('Error clearing cache:', err);
      toast.error('Failed to clear cache: ' + err.message);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleForceRefresh = async () => {
    const confirmed = await confirm({
      title: 'Force Refresh All Data',
      message: 'This will delete ALL cached data and re-fetch everything. Are you sure?',
      confirmText: 'Force Refresh',
      variant: 'danger'
    });
    
    if (!confirmed) return;
    
    try {
      setSyncing(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/force-refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Force refresh failed');
      
      await response.json();
      toast.success('All data refreshed successfully!');
      await fetchAdminStats();
    } catch (err) {
      console.error('Error force refreshing:', err);
      toast.error('Force refresh failed: ' + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/export`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'algotick-admin-report.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting:', err);
      toast.error('Export failed: ' + err.message);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleClearAllNotifications = async () => {
    const confirmed = await confirm({
      title: 'Clear All Notifications',
      message: 'This will permanently delete ALL notifications from ALL users. Are you sure?',
      confirmText: 'Clear All',
      variant: 'danger'
    });
    
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/notifications/admin/clear-all', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[Admin] Server error response:', errorData);
        throw new Error(errorData.message || 'Failed to clear notifications');
      }

      const data = await response.json();
      toast.success(`${data.count} notifications cleared from all users`);
    } catch (err) {
      console.error('Error clearing notifications:', err);
      toast.error(`Failed to clear notifications: ${err.message}`);
    }
  };

  const handlePostNotification = async () => {
    try {
      if (!notificationForm.title || !notificationForm.description) {
        toast.warning('Please fill in both title and description');
        return;
      }

      setSendingNotification(true);
      
      console.log('Sending notification:', notificationForm);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated. Please login again.');
      }
      
      const response = await fetch(`${API_URL}/notifications/admin/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(notificationForm)
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.message || 'Failed to create notification');
      }

      const result = await response.json();
      console.log('Success result:', result);
      toast.success(`Notification sent successfully to ${notificationForm.recipients === 'all' ? 'all users' : 'selected users'}!`);
      
      // Reset form
      setNotificationForm({
        title: '',
        description: '',
        type: 'system',
        recipients: 'all',
        iconColor: 'text-teal-400',
        iconBg: 'bg-teal-500/20'
      });
      
      setShowNotificationModal(false);
      
      // Refresh sent notifications list
      fetchSentNotifications();
    } catch (err) {
      console.error('Error posting notification:', err);
      toast.error('Failed to post notification: ' + err.message);
    } finally {
      setSendingNotification(false);
    }
  };

  // Render different sections based on activeSection
  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'notifications':
        return renderNotifications();
      case 'cron':
        return renderCronJobs();
      case 'algorithms':
        return <AdminAlgorithms />;
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => {
    if (!stats) return null;
    
    // Get current day and rotate the chart so today is at the end
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDayIndex = new Date().getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // Rotate days so today is at the end
    const rotatedDays = [
      ...daysOfWeek.slice(currentDayIndex + 1),
      ...daysOfWeek.slice(0, currentDayIndex + 1)
    ];
    
    // Sample data that increases cumulatively (rotate to match days)
    const baseData = [15, 23, 31, 45, 52, 68, 82];
    const rotatedData = [
      ...baseData.slice(currentDayIndex + 1),
      ...baseData.slice(0, currentDayIndex + 1)
    ];
    
    // User growth data (rotate to match days)
    const userGrowthBaseData = [5, 8, 12, 15, 10, 18, 22];
    const rotatedUserGrowthData = [
      ...userGrowthBaseData.slice(currentDayIndex + 1),
      ...userGrowthBaseData.slice(0, currentDayIndex + 1)
    ];
    
    return (
      <>
        {/* Quick Actions Bar */}
        <div className="bg-gradient-to-br from-gray-800/60 via-gray-800/80 to-gray-900/60 backdrop-blur-2xl rounded-2xl border border-white/10 p-6 shadow-2xl">
          <div className="flex flex-wrap gap-3 justify-between items-center">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-400" />
              Quick Actions
            </h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleExport}
                className="bg-gradient-to-br from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-lg hover:shadow-green-500/50"
              >
                <Download className="w-4 h-4" />
                Export Excel
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            onClick={() => navigate('/admin/users')}
            className="bg-gradient-to-br from-teal-900/40 via-emerald-900/30 to-teal-900/40 backdrop-blur-2xl rounded-2xl border border-teal-500/30 p-6 shadow-2xl shadow-teal-500/20 relative overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-400/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-teal-400" />
                <span className="text-4xl font-bold text-white">{stats.userStats.total}</span>
              </div>
              <h3 className="text-gray-300 text-sm font-medium">Total Users</h3>
              <p className="text-teal-400 text-xs mt-2">{stats.userStats.withLeetCode} with LeetCode</p>
              <p className="text-teal-300 text-xs mt-1 font-semibold">Click to manage →</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-900/40 via-cyan-900/30 to-blue-900/40 backdrop-blur-2xl rounded-2xl border border-blue-500/30 p-6 shadow-2xl shadow-blue-500/20 relative overflow-hidden">
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-400/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-blue-400" />
                <span className="text-4xl font-bold text-white">{stats.userStats.newThisWeek}</span>
              </div>
              <h3 className="text-gray-300 text-sm font-medium">New This Week</h3>
              <p className="text-blue-400 text-xs mt-2">{stats.userStats.newThisMonth} this month</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-900/40 via-green-900/30 to-emerald-900/40 backdrop-blur-2xl rounded-2xl border border-emerald-500/30 p-6 shadow-2xl shadow-emerald-500/20 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-400/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <Activity className="w-8 h-8 text-emerald-400" />
                <span className="text-4xl font-bold text-white">{stats.activityOverview.totalQuestions}</span>
              </div>
              <h3 className="text-gray-300 text-sm font-medium">Questions Tracked</h3>
              <p className="text-emerald-400 text-xs mt-2">{stats.activityOverview.totalSubmissions} submissions</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-900/40 via-amber-900/30 to-orange-900/40 backdrop-blur-2xl rounded-2xl border border-orange-500/30 p-6 shadow-2xl shadow-orange-500/20 relative overflow-hidden">
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-400/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <Activity className="w-8 h-8 text-orange-400" />
                <span className="text-4xl font-bold text-white">{stats.activityOverview.avgProblemsPerUser}</span>
              </div>
              <h3 className="text-gray-300 text-sm font-medium">Avg Problems Solved</h3>
              <p className="text-orange-400 text-xs mt-2">Per user</p>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-gray-800/60 via-gray-800/80 to-gray-900/60 backdrop-blur-2xl rounded-2xl border border-white/10 p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-400" />
              Activity Trend (Last 7 Days)
            </h3>
            {rotatedData && rotatedData.length > 0 ? (
            <MUILineChart
              xAxis={[{ 
                data: rotatedDays,
                scaleType: 'point',
                label: 'Days of the Week'
              }]}
              yAxis={[{
                label: 'Cumulative Submissions'
              }]}
              series={[
                {
                  data: rotatedData,
                  area: true,
                  color: '#61dca3',
                  showMark: false,
                  label: 'All Users'
                },
              ]}
              height={300}
              sx={{
                '& .MuiChartsAxis-root': { 
                  '& .MuiChartsAxis-line': { stroke: '#9ca3af' },
                  '& .MuiChartsAxis-tick': { stroke: '#9ca3af' },
                  '& .MuiChartsAxis-tickLabel': { fill: '#e5e7eb !important' }
                },
                '& text': { fill: '#e5e7eb !important' },
                '& .MuiChartsAxis-bottom .MuiChartsAxis-tickLabel': { fill: '#e5e7eb !important' },
                '& .MuiChartsAxis-left .MuiChartsAxis-tickLabel': { fill: '#e5e7eb !important' },
                '& .MuiChartsLegend-root text': { fill: '#e5e7eb !important' },
                '& .MuiChartsLegend-series text': { fill: '#e5e7eb !important' },
                '& .MuiChartsLegend-label': { color: '#e5e7eb !important' },
                '& .MuiChartsLabel-root': { color: '#e5e7eb !important' },
                '& .MuiChartsLabel-root.MuiChartsLegend-label': { color: '#e5e7eb !important' },
                '& span.MuiChartsLegend-label': { color: '#e5e7eb !important' },
                '& .MuiChartsLegend-mark': { fill: '#61dca3 !important' },
                '& .MuiAreaElement-root': { 
                  fill: 'url(#algoGreenGradient)'
                },
                '& .MuiLineElement-root': {
                  stroke: '#61dca3',
                  strokeWidth: 2
                }
              }}
              margin={{ top: 10, right: 20, bottom: 30, left: 40 }}
            >
              <defs>
                <linearGradient id="algoGreenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#61dca3" stopOpacity={0.8} />
                  <stop offset="50%" stopColor="#61dca3" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#61dca3" stopOpacity={0.1} />
                </linearGradient>
              </defs>
            </MUILineChart>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium">Not Enough Data</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-gray-800/60 via-gray-800/80 to-gray-900/60 backdrop-blur-2xl rounded-2xl border border-white/10 p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              Top 5 Tracked Problems
            </h3>
            {['Two Sum', 'Valid Parentheses', 'Merge Two Lists', 'Best Time to Buy', 'Max Subarray'].length > 0 ? (
            <ChartContainer
              xAxis={[{ 
                scaleType: 'band', 
                data: ['Two Sum', 'Valid Parentheses', 'Merge Two Lists', 'Best Time to Buy', 'Max Subarray']
              }]}
              series={[{ 
                type: 'bar', 
                id: 'problems', 
                data: [45, 38, 32, 28, 25],
                color: 'url(#barGradient)'
              }]}
              height={400}
              yAxis={[{ width: 35 }]}
              margin={{ left: 0, right: 10, bottom: 100, top: 30 }}
              sx={{
                '& .MuiChartsAxis-line': { stroke: '#ffffff' },
                '& .MuiChartsAxis-tick': { stroke: '#ffffff' },
                '& .MuiChartsAxis-tickLabel': { fill: '#e5e7eb !important', fontSize: '12px' },
                '& .MuiChartsAxis-bottom .MuiChartsAxis-tickLabel': { 
                  fill: '#e5e7eb !important',
                  transform: 'rotate(-35deg)',
                  textAnchor: 'end',
                  fontSize: '12px'
                },
                '& text': { fill: '#e5e7eb !important' },
              }}
            >
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6ee7b7" stopOpacity={1} />
                  <stop offset="50%" stopColor="#34d399" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <BarPlot barLabel="value" slots={{ barLabel: BarLabel }} />
              <ChartsXAxis />
              <ChartsYAxis />
            </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-gray-400">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium">Not Enough Data</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="bg-gradient-to-br from-gray-800/60 via-gray-800/80 to-gray-900/60 backdrop-blur-2xl rounded-2xl border border-white/10 p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              User Growth Over Time
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setUserGrowthPeriod('week')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  userGrowthPeriod === 'week'
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => setUserGrowthPeriod('6months')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  userGrowthPeriod === '6months'
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                Last 6 Months
              </button>
            </div>
          </div>
          {(userGrowthPeriod === 'week' ? rotatedUserGrowthData : [45, 68, 92, 115, 138, 167]).length > 0 ? (
          <MUILineChart
            xAxis={[{ 
              data: userGrowthPeriod === 'week' 
                ? rotatedDays
                : ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
              scaleType: 'point',
              label: userGrowthPeriod === 'week' ? 'Days of the Week' : 'Months'
            }]}
            yAxis={[{
              label: 'New Users'
            }]}
            series={[
              {
                data: userGrowthPeriod === 'week'
                  ? rotatedUserGrowthData
                  : [45, 68, 92, 115, 138, 167],
                area: true,
                color: '#a78bfa',
                showMark: true,
                label: 'New Users'
              },
            ]}
            height={350}
            sx={{
              '& .MuiChartsAxis-root': { 
                '& .MuiChartsAxis-line': { stroke: '#d1d5db' },
                '& .MuiChartsAxis-tick': { stroke: '#d1d5db' },
                '& .MuiChartsAxis-tickLabel': { fill: '#e5e7eb !important' }
              },
              '& text': { fill: '#e5e7eb !important' },
              '& .MuiChartsAxis-bottom .MuiChartsAxis-tickLabel': { fill: '#e5e7eb !important' },
              '& .MuiChartsAxis-left .MuiChartsAxis-tickLabel': { fill: '#e5e7eb !important' },
              '& .MuiChartsLegend-root text': { fill: '#e5e7eb !important' },
              '& .MuiChartsLegend-series text': { fill: '#e5e7eb !important' },
              '& .MuiChartsLegend-label': { color: '#e5e7eb !important' },
              '& .MuiChartsLabel-root': { color: '#e5e7eb !important' },
              '& .MuiChartsLegend-mark': { fill: '#a78bfa !important' },
              '& .MuiAreaElement-root': { 
                fill: 'url(#userGrowthGradient)'
              },
              '& .MuiLineElement-root': {
                stroke: '#a78bfa',
                strokeWidth: 2
              },
              '& .MuiMarkElement-root': {
                fill: '#a78bfa',
                stroke: '#fff',
                strokeWidth: 2,
                r: 4
              }
            }}
            margin={{ top: 10, right: 20, bottom: 30, left: 50 }}
          >
            <defs>
              <linearGradient id="userGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.8} />
                <stop offset="50%" stopColor="#a78bfa" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.1} />
              </linearGradient>
            </defs>
          </MUILineChart>
          ) : (
            <div className="flex items-center justify-center h-[350px] text-gray-400">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">Not Enough Data</p>
              </div>
            </div>
          )}
        </div>

        {/* Most Active Users */}
        <div className="bg-gradient-to-br from-gray-800/60 via-gray-800/80 to-gray-900/60 backdrop-blur-2xl rounded-2xl border border-white/10 p-6 shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-400" />
            Most Active Users
          </h3>
          <div className="space-y-3">
            {stats.userStats.mostActive.map((user, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-teal-500/30 transition-all">
                <div>
                  <p className="text-white font-semibold">{user.username}</p>
                  <p className="text-gray-400 text-sm">{user.leetcodeUsername || 'No LeetCode'}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">{user.questionCount}</p>
                  <p className="text-gray-400 text-xs">questions</p>
                </div>
              </div>
            ))}
            {stats.userStats.mostActive.length === 0 && (
              <div className="flex items-center justify-center py-12 text-gray-400">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium">Not Enough Data</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  const renderNotifications = () => (
    <>
      <div className="bg-gradient-to-br from-gray-800/60 via-gray-800/80 to-gray-900/60 backdrop-blur-2xl rounded-2xl border border-white/10 p-6 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <BellRing className="w-5 h-5 text-purple-400" />
          Notification Management
        </h3>
        <div className="flex gap-3">
          <button
            onClick={() => setShowNotificationModal(true)}
            className="bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-purple-500/50"
          >
            <Bell className="w-5 h-5" />
            Post Notification
          </button>
          <button
            onClick={handleClearAllNotifications}
            className="bg-gradient-to-br from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-red-500/50"
          >
            <Trash2 className="w-5 h-5" />
            Clear All Notifications
          </button>
        </div>
      </div>
      
      {/* Sent Notifications List */}
      <div className="bg-gradient-to-br from-gray-800/60 via-gray-800/80 to-gray-900/60 backdrop-blur-2xl rounded-2xl border border-white/10 p-6 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Bell className="w-5 h-5 text-purple-400" />
          Sent Notifications
        </h3>
        
        {loadingSentNotifications ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading notifications...</p>
          </div>
        ) : sentNotifications.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No notifications sent yet</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {sentNotifications.map((notif) => (
              <div key={notif._id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-white font-semibold">{notif.title}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        notif.type === 'system' ? 'bg-blue-500/20 text-blue-400' :
                        notif.type === 'achievement' ? 'bg-yellow-500/20 text-yellow-400' :
                        notif.type === 'streak' ? 'bg-teal-500/20 text-teal-400' :
                        notif.type === 'progress' ? 'bg-emerald-500/20 text-emerald-400' :
                        notif.type === 'reminder' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {notif.type}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{notif.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {notif.recipients === 'all' ? 'All users' : `${notif.specificUsers?.length || 0} users`}
                      </span>
                      <span>{new Date(notif.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteNotification(notif._id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-all text-gray-400 hover:text-red-400"
                    title="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );

  const renderCronJobs = () => {
    if (!stats) return null;
    
    const toggleCronJob = async (jobName) => {
      try {
        const newStatus = !cronJobs[jobName];
        
        // Optimistically update UI
        setCronJobs(prev => ({
          ...prev,
          [jobName]: newStatus
        }));

        // Call backend API
        const token = localStorage.getItem('token');
        const endpoint = jobName === 'leetcodeSync' 
          ? '/api/admin/cron/leetcode-sync/toggle'
          : '/api/admin/cron/ai-coach/toggle';
        
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${endpoint}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ enabled: newStatus })
        });

        if (!response.ok) {
          // Revert on error
          setCronJobs(prev => ({
            ...prev,
            [jobName]: !newStatus
          }));
          console.error('Failed to toggle cron job');
        }
      } catch (error) {
        console.error('Error toggling cron job:', error);
        // Revert on error
        setCronJobs(prev => ({
          ...prev,
          [jobName]: !cronJobs[jobName]
        }));
      }
    };
    
    return (
      <>
        {/* Scheduled Cron Jobs */}
        <div className="bg-gradient-to-br from-gray-800/60 via-gray-800/80 to-gray-900/60 backdrop-blur-2xl rounded-2xl border border-white/10 p-6 shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-blue-400" />
            Scheduled Cron Jobs
          </h3>
          <div className="space-y-4">
            <div className="bg-gray-900/60 rounded-xl border border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-semibold">LeetCode Sync</h4>
                  <p className="text-gray-400 text-sm">Runs daily at 2:00 AM</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${cronJobs.leetcodeSync ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}></div>
                    <span className={`text-sm font-medium ${cronJobs.leetcodeSync ? 'text-green-400' : 'text-gray-500'}`}>
                      {cronJobs.leetcodeSync ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleCronJob('leetcodeSync')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      cronJobs.leetcodeSync ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        cronJobs.leetcodeSync ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-gray-900/60 rounded-xl border border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-semibold">AI Coach</h4>
                  <p className="text-gray-400 text-sm">Runs daily at 2:00 AM</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${cronJobs.aiCoach ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}></div>
                    <span className={`text-sm font-medium ${cronJobs.aiCoach ? 'text-green-400' : 'text-gray-500'}`}>
                      {cronJobs.aiCoach ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleCronJob('aiCoach')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      cronJobs.aiCoach ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        cronJobs.aiCoach ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Manual Sync Controls */}
        <div className="bg-gradient-to-br from-gray-800/60 via-gray-800/80 to-gray-900/60 backdrop-blur-2xl rounded-2xl border border-white/10 p-6 shadow-2xl">
          <div className="flex flex-wrap gap-3 justify-between items-center">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-teal-400" />
              Manual Sync
            </h3>
            <button
              onClick={handleSyncAll}
              disabled={syncing}
              className="bg-gradient-to-br from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all shadow-lg hover:shadow-teal-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync All Users'}
            </button>
          </div>
        </div>

        {/* Live Sync Progress */}
        {syncing && syncProgress && (
          <div className="bg-gradient-to-br from-gray-800/60 via-gray-800/80 to-gray-900/60 backdrop-blur-2xl rounded-2xl border border-teal-500/30 p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-teal-400 animate-spin" />
              Live Sync Progress
            </h3>

            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-300">
                  {syncProgress.currentUser ? `Syncing: ${syncProgress.currentUser}` : 'Starting...'}
                </span>
                <span className="text-teal-400">
                  {syncProgress.currentIndex}/{syncProgress.totalUsers}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-300 rounded-full"
                  style={{ width: `${(syncProgress.currentIndex / syncProgress.totalUsers) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-900/30 border border-green-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">{syncProgress.successCount}</div>
                    <div className="text-xs text-gray-400">Success</div>
                  </div>
                </div>
              </div>
              <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">{syncProgress.failCount}</div>
                    <div className="text-xs text-gray-400">Failed</div>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">{syncProgress.skippedCount}</div>
                    <div className="text-xs text-gray-400">Skipped</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/60 rounded-xl border border-white/10 p-4 max-h-64 overflow-y-auto">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">Live Logs</h4>
              <div className="text-xs font-mono space-y-1">
                {syncLogs.slice(-10).map((log, idx) => (
                  <div key={idx} className={`flex items-start gap-2 ${
                    log.type === 'success' ? 'text-green-400' :
                    log.type === 'error' || log.type === 'failed' ? 'text-red-400' :
                    log.type === 'skipped' ? 'text-yellow-400' :
                    'text-gray-400'
                  }`}>
                    <span className="text-gray-600">{log.timestamp?.toLocaleTimeString()}</span>
                    <span>{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sync Status & History */}
        <div className="bg-gradient-to-br from-gray-800/60 via-gray-800/80 to-gray-900/60 backdrop-blur-2xl rounded-2xl border border-white/10 p-6 shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-400" />
            Sync Status & History
          </h3>
          {stats.syncStatus.lastSync ? (
            <div className="space-y-4">
              <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-400 text-sm">Last Sync</span>
                  <span className="text-white font-semibold text-sm">
                    {new Date(stats.syncStatus.lastSync.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm flex-wrap">
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <CheckCircle className="w-4 h-4" />
                    {stats.syncStatus.lastSync.successCount} success
                  </span>
                  <span className="flex items-center gap-1 text-red-400 font-medium">
                    <XCircle className="w-4 h-4" />
                    {stats.syncStatus.lastSync.failedCount} failed
                  </span>
                  <span className="flex items-center gap-1 text-yellow-400 font-medium">
                    <AlertCircle className="w-4 h-4" />
                    {stats.syncStatus.lastSync.skippedCount} skipped
                  </span>
                </div>
                <div className="mt-3 text-xs text-gray-400 flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  Duration: {(stats.syncStatus.lastSync.duration / 1000).toFixed(1)}s
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-teal-500/10 to-emerald-500/10 backdrop-blur-sm rounded-xl border border-teal-500/30">
                <span className="text-gray-300 text-sm block mb-2">Next Scheduled Sync</span>
                <span className="text-white font-semibold">
                  {stats.syncStatus.nextScheduledSync
                    ? new Date(stats.syncStatus.nextScheduledSync).toLocaleString()
                    : 'Not scheduled'}
                </span>
              </div>
              <div className="p-4 bg-gray-900/60 rounded-xl border border-white/10">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">Recent Sync History (Last 10)</h4>
                <div className="text-xs text-gray-400">
                  <p>History details would appear here...</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No sync history available</p>
          )}
        </div>
      </>
    );
  };

  // eslint-disable-next-line no-unused-vars
  const navItems = [
    { id: 'home', icon: Home, label: 'Home', path: '/home' },
    { id: 'lists', icon: List, label: 'Lists', path: '/lists' },
    { id: 'labs', icon: FlaskConical, label: 'Labs', path: '/labs' },
    { id: 'algorithms', icon: Code2, label: 'Algorithms', path: '/algorithms' },
    { id: 'settings', icon: Settings, label: 'Settings', path: '/settings' },
    { id: 'admin', icon: Shield, label: 'Admin', path: '/admin' }
  ];

  const adminSections = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'teal' },
    { id: 'algorithms', icon: Code2, label: 'Algorithms', color: 'teal' },
    { id: 'notifications', icon: BellRing, label: 'Notifications', color: 'purple' },
    { id: 'cron', icon: CalendarClock, label: 'Cron Jobs', color: 'blue' }
  ];

  const getScale = (currentIndex, hoveredIndex) => {
    if (hoveredIndex === null) return 1;
    const distance = Math.abs(currentIndex - hoveredIndex);
    if (distance === 0) return 1.6;
    if (distance === 1) return 1.3;
    if (distance === 2) return 1.15;
    return 1;
  };

  if (loading) {
    return <AdminLoader />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-400 text-2xl">Error: {error}</div>
      </div>
    );
  }

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
            
            {/* Admin Badge */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-teal-500/10 border border-teal-500/30 rounded-full">
              <Shield className="w-4 h-4 text-teal-400" />
              <span className="text-teal-400 font-semibold text-sm">Admin Panel</span>
            </div>

            {/* User Profile */}
            <div className="hidden md:flex items-center gap-3 relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="hover:opacity-80 transition-opacity"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 via-emerald-500 to-teal-500 p-0.5">
                  <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                    <User className="w-5 h-5 text-teal-400" />
                  </div>
                </div>
              </button>

              {/* Profile Dropdown */}
              {isProfileDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-gray-800/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3"
                  >
                    <LogOut className="w-4 h-4 text-teal-400" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMenu}
              className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
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
        </div>
      </nav>

      <div className="relative z-10 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 mt-20 sm:mt-24">
        {/* Hello Admin */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 sm:mb-8 tracking-tight lg:ml-24">
          Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">Panel</span>
        </h2>
        
        <div className="flex gap-4 sm:gap-6">
          {/* Left Navigation - Admin Sections in Capsule */}
          <div className="hidden lg:flex">
            <div className="fixed left-4 xl:left-8 top-1/2 transform -translate-y-1/2 bg-gradient-to-b from-gray-800/60 via-gray-800/80 to-gray-900/60 backdrop-blur-2xl rounded-full p-4 border border-white/10 shadow-2xl shadow-black/50 flex flex-col gap-8 z-50">
              {adminSections.map((section, index) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;

                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    onMouseEnter={() => setHoveredNav(index)}
                    onMouseLeave={() => setHoveredNav(null)}
                    className={`p-3 rounded-full transition-all duration-300 relative group ${
                      isActive 
                        ? 'bg-gradient-to-br from-teal-400 to-emerald-500 shadow-lg shadow-teal-500/50' 
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                    style={{
                      transform: `scale(${getScale(index, hoveredNav)})`,
                      transformOrigin: 'center'
                    }}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-black' : 'text-gray-300'}`} />
                    
                    <div className="absolute left-full ml-4 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">
                      {section.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 lg:ml-20 space-y-6">{renderSection()}</div>
        </div>
      </div>

      {/* Notification Modal */}
      {showNotificationModal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowNotificationModal(false);
          }}
        >
          <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-3xl w-full border border-purple-500/20 animate-slideUp overflow-hidden">
            {/* Gradient Accent Bar */}
            <div className="h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"></div>
            
            {/* Modal Header */}
            <div className="relative p-8 pb-6">
              <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10"></div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-50"></div>
                    <div className="relative bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-2xl shadow-lg">
                      <Bell className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400">
                      Post Notification
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Create and send notification to users</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className="text-gray-400 hover:text-white hover:bg-white/5 p-2.5 rounded-xl transition-all duration-200 hover:rotate-90"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-8 pb-6 space-y-5 max-h-[calc(90vh-280px)] overflow-y-auto custom-scrollbar">
              {/* Title & Description Row */}
              <div className="space-y-5">
                <div>
                  <label className="flex items-center gap-2 text-white font-semibold mb-3 text-sm">
                    <div className="w-1 h-4 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                    Title <span className="text-red-400 text-lg">*</span>
                  </label>
                  <input
                    type="text"
                    value={notificationForm.title}
                    onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                    placeholder="e.g., New Feature Released!"
                    className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-5 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/25 focus:bg-gray-800/70 transition-all duration-200 text-base"
                    maxLength={100}
                  />
                  <p className="text-gray-500 text-xs mt-1.5 ml-1">{notificationForm.title.length}/100 characters</p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-white font-semibold mb-3 text-sm">
                    <div className="w-1 h-4 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                    Message <span className="text-red-400 text-lg">*</span>
                  </label>
                  <textarea
                    value={notificationForm.description}
                    onChange={(e) => setNotificationForm({ ...notificationForm, description: e.target.value })}
                    placeholder="Enter your notification message here..."
                    rows={4}
                    className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-5 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/25 focus:bg-gray-800/70 transition-all duration-200 resize-none text-base leading-relaxed"
                    maxLength={500}
                  />
                  <p className="text-gray-500 text-xs mt-1.5 ml-1">{notificationForm.description.length}/500 characters</p>
                </div>
              </div>

              {/* Settings Grid */}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="flex items-center gap-2 text-white font-semibold mb-3 text-sm">
                    <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
                    Category
                  </label>
                  <div className="relative">
                    <select
                      value={notificationForm.type}
                      onChange={(e) => setNotificationForm({ ...notificationForm, type: e.target.value })}
                      className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-5 py-3.5 text-white focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/25 transition-all appearance-none cursor-pointer text-base"
                    >
                      <option value="system">📢 System</option>
                      <option value="update">🚀 Update</option>
                      <option value="achievement">🏆 Achievement</option>
                      <option value="streak">🔥 Streak</option>
                      <option value="progress">📈 Progress</option>
                      <option value="reminder">⏰ Reminder</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-white font-semibold mb-3 text-sm">
                    <div className="w-1 h-4 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
                    Recipients
                  </label>
                  <div className="relative">
                    <select
                      value={notificationForm.recipients}
                      onChange={(e) => setNotificationForm({ ...notificationForm, recipients: e.target.value })}
                      className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-5 py-3.5 text-white focus:outline-none focus:border-green-500/60 focus:ring-2 focus:ring-green-500/25 transition-all appearance-none cursor-pointer text-base"
                    >
                      <option value="all">👥 All Users</option>
                      <option value="specific" disabled>🎯 Specific Users (Soon)</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                  </div>
                </div>
              </div>

              {/* Color Pickers */}
              <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/30 rounded-2xl p-5">
                <p className="text-white font-semibold mb-4 text-sm flex items-center gap-2">
                  <div className="w-1 h-4 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-full"></div>
                  Appearance
                </p>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-gray-300 text-xs mb-2 ml-1">Icon Color</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { value: 'text-teal-400', color: 'bg-teal-400', name: 'Teal' },
                        { value: 'text-blue-400', color: 'bg-blue-400', name: 'Blue' },
                        { value: 'text-purple-400', color: 'bg-purple-400', name: 'Purple' },
                        { value: 'text-pink-400', color: 'bg-pink-400', name: 'Pink' },
                        { value: 'text-green-400', color: 'bg-green-400', name: 'Green' },
                        { value: 'text-yellow-400', color: 'bg-yellow-400', name: 'Yellow' },
                        { value: 'text-orange-400', color: 'bg-orange-400', name: 'Orange' },
                        { value: 'text-red-400', color: 'bg-red-400', name: 'Red' }
                      ].map((item) => (
                        <button
                          key={item.value}
                          onClick={() => setNotificationForm({ 
                            ...notificationForm, 
                            iconColor: item.value,
                            iconBg: item.color.replace('bg-', 'bg-').replace('-400', '-500/20')
                          })}
                          className={`${item.color} h-10 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-lg relative group ${
                            notificationForm.iconColor === item.value ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-105' : ''
                          }`}
                          title={item.name}
                        >
                          {notificationForm.iconColor === item.value && (
                            <CheckCircle className="w-5 h-5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Preview */}
              <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-purple-500/20 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-4 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                  <p className="text-white font-semibold text-sm">Live Preview</p>
                </div>
                <div className="bg-gray-900/80 border border-gray-700/50 rounded-xl p-5 hover:border-purple-500/30 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className={`${notificationForm.iconBg} p-3 rounded-xl flex-shrink-0 shadow-lg`}>
                      <Bell className={`w-6 h-6 ${notificationForm.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-bold text-lg mb-1.5 line-clamp-2">
                        {notificationForm.title || 'Your notification title will appear here'}
                      </h4>
                      <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                        {notificationForm.description || 'Your notification message will be displayed here. Make it clear and engaging!'}
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-gray-500 text-xs">Just now</span>
                        <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                        <span className="text-purple-400 text-xs font-medium">{notificationForm.type}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-t border-gray-700/50 px-8 py-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">
                  {notificationForm.recipients === 'all' ? '📨 Will be sent to all users' : '🎯 Select recipients'}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowNotificationModal(false)}
                    className="px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-xl transition-all duration-200 font-medium border border-gray-600/50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePostNotification}
                    disabled={sendingNotification || !notificationForm.title || !notificationForm.description}
                    className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 disabled:opacity-50 text-white rounded-xl flex items-center gap-2.5 transition-all duration-200 shadow-lg hover:shadow-purple-500/50 font-semibold disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                  >
                    {sendingNotification ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Notification
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
