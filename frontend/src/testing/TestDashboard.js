import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, User, Home, BarChart3, Zap, Bot, TrendingUp, Link2, Target, List, FlaskConical, StickyNote, Settings, Bell, LogOut } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Label, Sector, Cell } from 'recharts';
import { questionsAPI, aiCoachAPI, notificationsAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const TestDashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [selectedTab, setSelectedTab] = useState('all');
  const [activeNav, setActiveNav] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [recentProblems, setRecentProblems] = useState([]);
  const [leetcodeActivity, setLeetcodeActivity] = useState(null);
  const [aiCoachData, setAiCoachData] = useState(null);
  const [userData, setUserData] = useState({ username: '', email: '' });
  const [topNotifications, setTopNotifications] = useState([]);
  // const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // const closeMenu = () => {
  //   setIsMenuOpen(false);
  // };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserData({
      username: user.username || 'User',
      email: user.email || 'user@example.com'
    });

    // Fetch top notifications
    const fetchTopNotifications = async () => {
      try {
        const response = await notificationsAPI.getNotifications();
        const allNotifications = response.data || [];
        setTopNotifications(allNotifications.slice(0, 2));
        
        // Unread count not currently displayed in UI
        // const countResponse = await notificationsAPI.getUnreadCount();
        // setUnreadCount(countResponse.data.count || 0);
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

  // Navigation items with labels and routes
  const navItems = [
    { id: 'home', icon: Home, label: 'Home', path: '/home' },
    { id: 'lists', icon: List, label: 'Lists', path: '/lists' },
    { id: 'labs', icon: FlaskConical, label: 'Labs', path: '/labs' },
    { id: 'notes', icon: StickyNote, label: 'Notes', path: '/notes' },
    { id: 'settings', icon: Settings, label: 'Settings', path: '/settings' },
    { id: 'profile', icon: User, label: 'Profile', path: '/profile' }
  ];

  // Calculate scale based on distance from hovered item
  const getScale = (currentIndex, hoveredIndex) => {
    if (hoveredIndex === null) return 1;
    const distance = Math.abs(currentIndex - hoveredIndex);
    if (distance === 0) return 1.6;
    if (distance === 1) return 1.3;
    if (distance === 2) return 1.15;
    return 1;
  };

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log('Fetching dashboard stats...');
        const response = await questionsAPI.getDashboardStats();
        console.log('Dashboard stats response:', response.data);
        setDashboardData(response.data);
        
        // Fetch LeetCode activity for weekly submissions
        try {
          console.log('Fetching LeetCode activity...');
          const leetcodeResponse = await questionsAPI.getLeetCodeActivity();
          console.log('LeetCode activity response:', leetcodeResponse.data);
          setLeetcodeActivity(leetcodeResponse.data);
        } catch (error) {
          console.log('LeetCode activity error:', error.response?.data || error.message);
        }
        
        // Fetch recent questions
        console.log('Fetching recent questions...');
        const questionsResponse = await questionsAPI.getQuestions({ sortBy: 'recent', limit: 3 });
        console.log('Recent questions response:', questionsResponse.data);
        setRecentProblems(questionsResponse.data.questions || []);
        
        // Fetch AI Coach data
        try {
          console.log('Fetching AI Coach data...');
          const aiCoachResponse = await aiCoachAPI.getDashboard();
          console.log('AI Coach response:', aiCoachResponse.data);
          setAiCoachData(aiCoachResponse.data);
        } catch (error) {
          console.log('AI Coach error:', error.response?.data || error.message);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        console.error('Error details:', error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
  
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

  const [activeDifficulty, setActiveDifficulty] = useState('Easy');
  
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <style>{`
          .wheel-and-hamster {
            --dur: 1s;
            position: relative;
            width: 12em;
            height: 12em;
            font-size: 14px;
          }

          .wheel,
          .hamster,
          .hamster div,
          .spoke {
            position: absolute;
          }

          .wheel,
          .spoke {
            border-radius: 50%;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
          }

          .wheel {
            background: radial-gradient(100% 100% at center,hsla(0,0%,60%,0) 47.8%,hsl(0,0%,60%) 48%);
            z-index: 2;
          }

          .hamster {
            animation: hamster var(--dur) ease-in-out infinite;
            top: 50%;
            left: calc(50% - 3.5em);
            width: 7em;
            height: 3.75em;
            transform: rotate(4deg) translate(-0.8em,1.85em);
            transform-origin: 50% 0;
            z-index: 1;
          }

          .hamster__head {
            animation: hamsterHead var(--dur) ease-in-out infinite;
            background: hsl(30,90%,55%);
            border-radius: 70% 30% 0 100% / 40% 25% 25% 60%;
            box-shadow: 0 -0.25em 0 hsl(30,90%,80%) inset,
              0.75em -1.55em 0 hsl(30,90%,90%) inset;
            top: 0;
            left: -2em;
            width: 2.75em;
            height: 2.5em;
            transform-origin: 100% 50%;
          }

          .hamster__ear {
            animation: hamsterEar var(--dur) ease-in-out infinite;
            background: hsl(0,90%,85%);
            border-radius: 50%;
            box-shadow: -0.25em 0 hsl(30,90%,55%) inset;
            top: -0.25em;
            right: -0.25em;
            width: 0.75em;
            height: 0.75em;
            transform-origin: 50% 75%;
          }

          .hamster__eye {
            animation: hamsterEye var(--dur) linear infinite;
            background-color: hsl(0,0%,0%);
            border-radius: 50%;
            top: 0.375em;
            left: 1.25em;
            width: 0.5em;
            height: 0.5em;
          }

          .hamster__nose {
            background: hsl(0,90%,75%);
            border-radius: 35% 65% 85% 15% / 70% 50% 50% 30%;
            top: 0.75em;
            left: 0;
            width: 0.2em;
            height: 0.25em;
          }

          .hamster__body {
            animation: hamsterBody var(--dur) ease-in-out infinite;
            background: hsl(30,90%,90%);
            border-radius: 50% 30% 50% 30% / 15% 60% 40% 40%;
            box-shadow: 0.1em 0.75em 0 hsl(30,90%,55%) inset,
              0.15em -0.5em 0 hsl(30,90%,80%) inset;
            top: 0.25em;
            left: 2em;
            width: 4.5em;
            height: 3em;
            transform-origin: 17% 50%;
            transform-style: preserve-3d;
          }

          .hamster__limb--fr,
          .hamster__limb--fl {
            clip-path: polygon(0 0,100% 0,70% 80%,60% 100%,0% 100%,40% 80%);
            top: 2em;
            left: 0.5em;
            width: 1em;
            height: 1.5em;
            transform-origin: 50% 0;
          }

          .hamster__limb--fr {
            animation: hamsterFRLimb var(--dur) linear infinite;
            background: linear-gradient(hsl(30,90%,80%) 80%,hsl(0,90%,75%) 80%);
            transform: rotate(15deg) translateZ(-1px);
          }

          .hamster__limb--fl {
            animation: hamsterFLLimb var(--dur) linear infinite;
            background: linear-gradient(hsl(30,90%,90%) 80%,hsl(0,90%,85%) 80%);
            transform: rotate(15deg);
          }

          .hamster__limb--br,
          .hamster__limb--bl {
            border-radius: 0.75em 0.75em 0 0;
            clip-path: polygon(0 0,100% 0,100% 30%,70% 90%,70% 100%,30% 100%,40% 90%,0% 30%);
            top: 1em;
            left: 2.8em;
            width: 1.5em;
            height: 2.5em;
            transform-origin: 50% 30%;
          }

          .hamster__limb--br {
            animation: hamsterBRLimb var(--dur) linear infinite;
            background: linear-gradient(hsl(30,90%,80%) 90%,hsl(0,90%,75%) 90%);
            transform: rotate(-25deg) translateZ(-1px);
          }

          .hamster__limb--bl {
            animation: hamsterBLLimb var(--dur) linear infinite;
            background: linear-gradient(hsl(30,90%,90%) 90%,hsl(0,90%,85%) 90%);
            transform: rotate(-25deg);
          }

          .hamster__tail {
            animation: hamsterTail var(--dur) linear infinite;
            background: hsl(0,90%,85%);
            border-radius: 0.25em 50% 50% 0.25em;
            box-shadow: 0 -0.2em 0 hsl(0,90%,75%) inset;
            top: 1.5em;
            right: -0.5em;
            width: 1em;
            height: 0.5em;
            transform: rotate(30deg) translateZ(-1px);
            transform-origin: 0.25em 0.25em;
          }

          .spoke {
            animation: spoke var(--dur) linear infinite;
            background: radial-gradient(100% 100% at center,hsl(0,0%,60%) 4.8%,hsla(0,0%,60%,0) 5%),
              linear-gradient(hsla(0,0%,55%,0) 46.9%,hsl(0,0%,65%) 47% 52.9%,hsla(0,0%,65%,0) 53%) 50% 50% / 99% 99% no-repeat;
          }

          @keyframes hamster {
            from, to {
              transform: rotate(4deg) translate(-0.8em,1.85em);
            }
            50% {
              transform: rotate(0) translate(-0.8em,1.85em);
            }
          }

          @keyframes hamsterHead {
            from, 25%, 50%, 75%, to {
              transform: rotate(0);
            }
            12.5%, 37.5%, 62.5%, 87.5% {
              transform: rotate(8deg);
            }
          }

          @keyframes hamsterEye {
            from, 90%, to {
              transform: scaleY(1);
            }
            95% {
              transform: scaleY(0);
            }
          }

          @keyframes hamsterEar {
            from, 25%, 50%, 75%, to {
              transform: rotate(0);
            }
            12.5%, 37.5%, 62.5%, 87.5% {
              transform: rotate(12deg);
            }
          }

          @keyframes hamsterBody {
            from, 25%, 50%, 75%, to {
              transform: rotate(0);
            }
            12.5%, 37.5%, 62.5%, 87.5% {
              transform: rotate(-2deg);
            }
          }

          @keyframes hamsterFRLimb {
            from, 25%, 50%, 75%, to {
              transform: rotate(50deg) translateZ(-1px);
            }
            12.5%, 37.5%, 62.5%, 87.5% {
              transform: rotate(-30deg) translateZ(-1px);
            }
          }

          @keyframes hamsterFLLimb {
            from, 25%, 50%, 75%, to {
              transform: rotate(-30deg);
            }
            12.5%, 37.5%, 62.5%, 87.5% {
              transform: rotate(50deg);
            }
          }

          @keyframes hamsterBRLimb {
            from, 25%, 50%, 75%, to {
              transform: rotate(-60deg) translateZ(-1px);
            }
            12.5%, 37.5%, 62.5%, 87.5% {
              transform: rotate(20deg) translateZ(-1px);
            }
          }

          @keyframes hamsterBLLimb {
            from, 25%, 50%, 75%, to {
              transform: rotate(20deg);
            }
            12.5%, 37.5%, 62.5%, 87.5% {
              transform: rotate(-60deg);
            }
          }

          @keyframes hamsterTail {
            from, 25%, 50%, 75%, to {
              transform: rotate(30deg) translateZ(-1px);
            }
            12.5%, 37.5%, 62.5%, 87.5% {
              transform: rotate(10deg) translateZ(-1px);
            }
          }

          @keyframes spoke {
            from {
              transform: rotate(0);
            }
            to {
              transform: rotate(-1turn);
            }
          }
        `}</style>
        <div aria-label="Orange and tan hamster running in a metal wheel" role="img" className="wheel-and-hamster">
          <div className="wheel"></div>
          <div className="hamster">
            <div className="hamster__body">
              <div className="hamster__head">
                <div className="hamster__ear"></div>
                <div className="hamster__eye"></div>
                <div className="hamster__nose"></div>
              </div>
              <div className="hamster__limb hamster__limb--fr"></div>
              <div className="hamster__limb hamster__limb--fl"></div>
              <div className="hamster__limb hamster__limb--br"></div>
              <div className="hamster__limb hamster__limb--bl"></div>
              <div className="hamster__tail"></div>
            </div>
          </div>
          <div className="spoke"></div>
        </div>
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
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl lg:rounded-full px-4 sm:px-8 shadow-2xl">
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
                  <span className="absolute top-1 right-1 w-2 h-2 bg-teal-400 rounded-full"></span>
                </button>
                
                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50">
                    <div className="p-4 border-b border-white/10">
                      <h3 className="font-semibold text-white">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {topNotifications.length > 0 ? (
                        topNotifications.map((notification, index) => (
                          <div key={notification._id} className={`p-4 hover:bg-white/5 transition-colors cursor-pointer ${index < topNotifications.length - 1 ? 'border-b border-white/5' : ''}`}>
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-2 ${!notification.readBy?.some(r => r.userId === JSON.parse(localStorage.getItem('user') || '{}')._id) ? 'bg-teal-400' : 'bg-white/20'}`}></div>
                              <div className="flex-1">
                                <p className="text-white text-sm">{notification.title}</p>
                                <p className="text-white/60 text-xs mt-1">{notification.description}</p>
                                <p className="text-white/40 text-xs mt-1">{new Date(notification.createdAt).toLocaleDateString()}</p>
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
                        onClick={() => {
                          navigate('/notifications');
                          setShowNotifications(false);
                        }}
                        className="w-full text-center text-teal-400 hover:text-teal-300 text-sm font-medium transition-colors"
                      >
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotifications(false);
                  }}
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 via-emerald-500 to-teal-500 p-0.5 shadow-lg shadow-teal-500/30 hover:scale-105 transition-transform"
                >
                  <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                    <User className="w-5 h-5 text-teal-400" />
                  </div>
                </button>

                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50">
                    <div className="p-3 border-b border-white/10">
                      <p className="text-white font-medium text-sm">Hi {userData.username}</p>
                      <p className="text-white/60 text-xs mt-1">{userData.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full p-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-red-400 hover:text-red-300"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={toggleMenu}
              className="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
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
            <div className="lg:hidden border-t border-white/10 py-4 space-y-3">
              <div className="flex items-center gap-2 px-4 py-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 via-emerald-500 to-teal-500 p-0.5">
                  <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                    <User className="w-4 h-4 text-teal-400" />
                  </div>
                </div>
                <span className="text-gray-200 font-medium text-sm">Hi {userData.username}</span>
              </div>
              <div className="px-4 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeNav === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveNav(item.id);
                        setIsMenuOpen(false);
                        navigate(item.path);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                        isActive
                          ? 'bg-teal-500/15 text-teal-400'
                          : 'text-gray-300 hover:text-teal-400 hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="px-4 pt-2 border-t border-white/10 space-y-1">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate('/notifications');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-teal-400 hover:bg-white/5 rounded-lg transition-all"
                >
                  <Bell className="w-5 h-5" />
                  <span className="text-sm font-medium">Notifications</span>
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="relative z-10 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 mt-20 sm:mt-24">
        {/* Hello User - Outside Container */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 sm:mb-8 tracking-tight lg:ml-28 xl:ml-32">
          Hello <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">
            {leetcodeActivity?.activity?.realName || 
             leetcodeActivity?.activity?.username || 
             JSON.parse(localStorage.getItem('user') || '{}').username ||
             'User'}
          </span>
        </h2>
        
        <div className="flex gap-4 sm:gap-6">
          {/* Floating Left Sidebar Capsule */}
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
          <div className="flex-1 lg:ml-20 flex flex-col lg:flex-row gap-4 sm:gap-6">
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
                          setLoading(true);
                          const response = await aiCoachAPI.refresh();
                          if (response.data?.data) {
                            setAiCoachData(response.data);
                          }
                        } catch (error) {
                          console.error('Error refreshing AI Coach:', error);
                          toast.error(error.response?.data?.message || 'Failed to refresh AI insights. Please try again later.');
                        } finally {
                          setLoading(false);
                        }
                      }}
                      disabled={loading}
                      className="text-teal-400 text-xs sm:text-sm flex items-center gap-1 sm:gap-2 hover:text-teal-300 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className={`w-3 h-3 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        </div>
      </div>
    </div>
  );
};

export default TestDashboard;
