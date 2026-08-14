import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Home, List, FlaskConical, StickyNote, Settings, X, Zap, Layers, ArrowRightLeft, GitBranch, Mountain, BarChart3, Bell, LogOut } from 'lucide-react';
import { notificationsAPI } from '../services/api';
import { HeapVisualizer } from './visualizers/heap/HeapVisualizer';
import { ArrayVisualizer } from './visualizers/ArrayVisualizer';
import { StackVisualizer } from './visualizers/stack/StackVisualizer';
import { QueueVisualizer } from './visualizers/queue/QueueVisualizer';
import { BinaryTreeVisualizer } from './visualizers/binary-tree/BinaryTreeVisualizer';
import { CodeExecutor } from './visualizers/code-executor/CodeExecutor';
import './Labs.css';

const Labs = () => {
  const navigate = useNavigate();
  const [selectedDS, setSelectedDS] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState(null);
  const [activeNav, setActiveNav] = useState('labs');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userData, setUserData] = useState({ username: '', email: '' });
  const [topNotifications, setTopNotifications] = useState([]);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  const handleCardClick = (dsId) => {
    setSelectedDS(dsId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Delay clearing selection for smooth animation
    setTimeout(() => setSelectedDS(null), 300);
  };

  // Handle ESC key to close modal
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

  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        handleCloseModal();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isModalOpen]);

  // Navigation items
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

  const dataStructures = [
    { 
      id: 'code', 
      name: 'Code Executor', 
      icon: Zap,
      description: 'Paste Java/Python code and watch it execute with live visualization' 
    },
    { 
      id: 'stack', 
      name: 'Stack (LIFO)', 
      icon: Layers,
      description: 'Visualize stack operations - push, pop with animations' 
    },
    { 
      id: 'queue', 
      name: 'Queue (FIFO)', 
      icon: ArrowRightLeft,
      description: 'Visualize queue operations - enqueue, dequeue' 
    },
    { 
      id: 'tree', 
      name: 'Binary Tree', 
      icon: GitBranch,
      description: 'Visualize BST insert and traversals (inorder/preorder/postorder/levelorder)' 
    },
    { 
      id: 'heap', 
      name: 'Heap (Min/Max)', 
      icon: Mountain,
      description: 'Visualize heap operations - insert, heapify with array view' 
    },
    { 
      id: 'array', 
      name: 'Array Sorting', 
      icon: BarChart3,
      description: 'Visualize sorting algorithms - bubble, merge, quick sort' 
    },
  ];

  const renderVisualizer = () => {
    if (!selectedDS) return null;
    
    switch (selectedDS) {
      case 'code':
        return <CodeExecutor />;
      case 'stack':
        return <StackVisualizer />;
      case 'queue':
        return <QueueVisualizer />;
      case 'tree':
        return <BinaryTreeVisualizer />;
      case 'heap':
        return <HeapVisualizer />;
      case 'array':
        return <ArrayVisualizer />;
      default:
        return null;
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
        {/* Page Title */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 sm:mb-8 tracking-tight lg:ml-28 xl:ml-32">
          AlgoTick <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">Labs</span>
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
            {/* Data Structure Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {dataStructures.map((ds, index) => (
                <button
                  key={ds.id}
                  onClick={() => handleCardClick(ds.id)}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className="group relative overflow-hidden p-8 rounded-2xl transition-all duration-300 text-left min-h-[200px]
                           bg-gradient-to-br from-teal-900/40 via-emerald-900/30 to-teal-900/40 backdrop-blur-2xl 
                           border border-teal-500/30 hover:border-teal-500/60 hover:scale-[1.02] 
                           hover:shadow-2xl hover:shadow-teal-500/20 animate-fadeIn"
                >
                  {/* Animated glow effects */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-400/20 rounded-full blur-3xl group-hover:bg-teal-400/30 transition-all duration-300"></div>
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-400/20 rounded-full blur-3xl group-hover:bg-emerald-400/30 transition-all duration-300"></div>
                  
                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col">
                    {/* Icon & Title */}
                    <div className="flex items-center gap-4 mb-4">
                      <ds.icon className="w-10 h-10 text-teal-400 group-hover:text-emerald-400 group-hover:scale-110 transition-all duration-300" />
                      <div className="font-bold text-white text-xl group-hover:text-teal-400 transition-colors">{ds.name}</div>
                    </div>
                    
                    {/* Description */}
                    <div className="text-base text-white/60 leading-relaxed group-hover:text-white/80 transition-colors flex-1">
                      {ds.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal/Popup Overlay */}
      {isModalOpen && (
        <div 
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
            isModalOpen ? 'bg-black/80 backdrop-blur-sm' : 'bg-black/0'
          }`}
          onClick={handleCloseModal}
        >
          {/* Modal Content */}
          <div 
            className={`relative w-full max-w-[95vw] max-h-[95vh] bg-gradient-to-br from-black via-gray-900 to-black border-2 border-teal-500/30 rounded-3xl shadow-2xl shadow-teal-500/20 overflow-hidden transform transition-all duration-500 ease-out ${
              isModalOpen ? 'scale-100 opacity-100 rotate-0' : 'scale-90 opacity-0 -rotate-2'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Bar with Close Button */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-4 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border-b border-white/10 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                {/* Traffic Light Dots */}
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors cursor-pointer" onClick={handleCloseModal}></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors cursor-pointer"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 transition-colors cursor-pointer"></div>
                </div>
                
                {/* Title with Icon */}
                <div className="flex items-center gap-3 ml-2">
                  {(() => {
                    const IconComponent = dataStructures.find(ds => ds.id === selectedDS)?.icon;
                    return IconComponent ? <IconComponent className="w-7 h-7 text-teal-400" /> : null;
                  })()}
                  <div>
                    <span className="text-white font-semibold text-lg">
                      {dataStructures.find(ds => ds.id === selectedDS)?.name}
                    </span>
                    <p className="text-white/50 text-xs">
                      AlgoTick Labs
                    </p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleCloseModal}
                className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-xl transition-all duration-300 group"
                title="Close (ESC)"
              >
                <X className="w-5 h-5 text-red-400 group-hover:text-red-300 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* Visualizer Container - With scroll */}
            <div className="h-[calc(95vh-4rem)] pt-20 pb-4 px-4 overflow-y-auto custom-scrollbar">
              <div className="animate-fadeIn">
                {renderVisualizer()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Labs;
