import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Home, List, FlaskConical, StickyNote, Settings, Plus, Trash2, ExternalLink, Calendar, Bell, LogOut } from 'lucide-react';
import { listsAPI, notificationsAPI } from '../services/api';
import { useConfirm } from '../context/ConfirmContext';
import HamsterLoader from '../components/HamsterLoader';

const CustomLists = () => {
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [listDetailsLoading, setListDetailsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddQuestionForm, setShowAddQuestionForm] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [hoveredNav, setHoveredNav] = useState(null);
  const [activeNav, setActiveNav] = useState('lists');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userData, setUserData] = useState({ username: '', email: '' });
  const [topNotifications, setTopNotifications] = useState([]);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  // Form states
  const [newListData, setNewListData] = useState({
    name: '',
    description: '',
    color: '#61dca3'
  });
  const [questionInput, setQuestionInput] = useState('');

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
    fetchLists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const fetchLists = async () => {
    try {
      setLoading(true);
      const response = await listsAPI.getLists();
      setLists(response.data.lists);
    } catch (error) {
      console.error('Failed to fetch lists:', error);
      showMessage('error', 'Failed to load lists');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    
    if (!newListData.name.trim()) {
      showMessage('error', 'List name is required');
      return;
    }

    try {
      const response = await listsAPI.createList(newListData);
      setLists([response.data.list, ...lists]);
      setNewListData({ name: '', description: '', color: '#61dca3' });
      setShowCreateForm(false);
      showMessage('success', 'List created successfully!');
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to create list');
    }
  };

  const handleDeleteList = async (listId) => {
    const confirmed = await confirm({
      title: 'Delete List',
      message: 'Are you sure you want to delete this list?',
      confirmText: 'Delete',
      variant: 'danger'
    });
    
    if (!confirmed) return;

    try {
      await listsAPI.deleteList(listId);
      setLists(lists.filter(l => l._id !== listId));
      if (selectedList?._id === listId) {
        setSelectedList(null);
      }
      showMessage('success', 'List deleted successfully');
    } catch (error) {
      showMessage('error', 'Failed to delete list');
    }
  };

  const handleSelectList = async (listId) => {
    try {
      setListDetailsLoading(true);
      const response = await listsAPI.getList(listId);
      setSelectedList(response.data.list);
      setShowAddQuestionForm(false);
    } catch (error) {
      showMessage('error', 'Failed to load list details');
    } finally {
      setListDetailsLoading(false);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    
    if (!questionInput.trim()) {
      showMessage('error', 'Please enter a question number or URL');
      return;
    }

    if (submitting) return;

    try {
      setSubmitting(true);
      const response = await listsAPI.addQuestionToList(selectedList._id, {
        url: questionInput
      });
      
      setSelectedList(response.data.list);
      setLists(lists.map(l => 
        l._id === response.data.list._id ? response.data.list : l
      ));
      
      setQuestionInput('');
      setShowAddQuestionForm(false);
      showMessage('success', 'Question added to list!');
    } catch (error) {
      console.error('Add question error:', error);
      showMessage('error', error.response?.data?.message || 'Failed to add question');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveQuestion = async (questionNumber) => {
    try {
      const response = await listsAPI.removeQuestionFromList(
        selectedList._id,
        questionNumber
      );
      setSelectedList(response.data.list);
      setLists(lists.map(l => 
        l._id === response.data.list._id ? response.data.list : l
      ));
      showMessage('success', 'Question removed from list');
    } catch (error) {
      showMessage('error', 'Failed to remove question');
    }
  };

  const handleAddQuestionToToday = async (questionNumber) => {
    try {
      await listsAPI.addQuestionToToday(selectedList._id, { questionNumber });
      showMessage('success', 'Question added to today\'s due!');
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to add to today');
    }
  };

  const handleAddAllToToday = async () => {
    const confirmed = await confirm({
      title: 'Add All Questions',
      message: `Add all ${selectedList.questions.length} questions to today's due?`,
      confirmText: 'Add All',
      variant: 'info'
    });
    
    if (!confirmed) return;

    try {
      const response = await listsAPI.addAllToToday(selectedList._id);
      showMessage('success', response.data.message);
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to add questions');
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      Easy: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
      Medium: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
      Hard: 'text-red-400 bg-red-500/20 border-red-500/30'
    };
    return colors[difficulty] || 'text-gray-400 bg-gray-500/20 border-gray-500/30';
  };

  if (loading && lists.length === 0) {
    return <HamsterLoader />;
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full filter blur-[128px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full filter blur-[128px] animate-pulse delay-1000"></div>
      </div>

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
          My <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">Lists</span>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Lists Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-teal-900/40 via-emerald-900/30 to-teal-900/40 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-teal-500/30 p-4 sm:p-6 shadow-2xl shadow-teal-500/20 relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-400/30 rounded-full blur-3xl animate-pulse"></div>
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-400/30 rounded-full blur-3xl animate-pulse"></div>
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-white">My Lists</h2>
                      <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-teal-500/50 transition-all flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        New
                      </button>
                    </div>

                    {showCreateForm && (
                      <form onSubmit={handleCreateList} className="mb-6 p-4 bg-gray-900/40 rounded-xl border border-teal-500/20">
                        <input
                          type="text"
                          placeholder="List name"
                          value={newListData.name}
                          onChange={(e) => setNewListData({ ...newListData, name: e.target.value })}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500 mb-3"
                        />
                        <textarea
                          placeholder="Description (optional)"
                          value={newListData.description}
                          onChange={(e) => setNewListData({ ...newListData, description: e.target.value })}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500 mb-3"
                          rows="2"
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold py-2 rounded-xl hover:shadow-lg transition-all"
                          >
                            Create
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowCreateForm(false)}
                            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}

                    {loading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="p-4 bg-gray-900/40 border border-white/10 rounded-xl animate-pulse">
                            <div className="h-5 bg-white/10 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-white/10 rounded w-1/2 mb-2"></div>
                            <div className="h-3 bg-white/10 rounded w-1/4"></div>
                          </div>
                        ))}
                      </div>
                    ) : lists.length === 0 ? (
                      <div className="text-center py-8">
                        <List className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                        <p className="text-white/50">No lists yet</p>
                        <p className="text-white/40 text-sm mt-1">Create one to get started!</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {lists.map((list) => (
                          <div
                            key={list._id}
                            className={`p-4 rounded-xl cursor-pointer transition-all ${
                              selectedList?._id === list._id
                                ? 'bg-gradient-to-r from-teal-500/20 to-emerald-500/20 border-2 border-teal-500/50 shadow-lg shadow-teal-500/20'
                                : 'bg-gray-900/40 border border-white/10 hover:bg-gray-900/60 hover:border-teal-500/30'
                            }`}
                            onClick={() => handleSelectList(list._id)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="font-semibold text-white mb-1">{list.name}</h3>
                                {list.description && (
                                  <p className="text-sm text-white/60 mb-2">{list.description}</p>
                                )}
                                <p className="text-xs text-teal-400 font-medium">
                                  {list.questions.length} question{list.questions.length !== 1 ? 's' : ''}
                                </p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteList(list._id);
                                }}
                                className="text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-red-500/10 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* List Details */}
              <div className="lg:col-span-2">
                {listDetailsLoading ? (
                  <div className="bg-gradient-to-br from-teal-900/40 via-emerald-900/30 to-teal-900/40 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-teal-500/30 p-6 shadow-2xl shadow-teal-500/20">
                    <div className="animate-pulse space-y-4">
                      <div className="h-8 bg-white/10 rounded w-1/3"></div>
                      <div className="h-4 bg-white/10 rounded w-1/2"></div>
                      <div className="h-12 bg-white/10 rounded-xl"></div>
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 bg-gray-900/40 border border-white/10 rounded-xl">
                          <div className="h-4 bg-white/10 rounded w-full mb-2"></div>
                          <div className="h-3 bg-white/10 rounded w-3/4"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : selectedList ? (
                  <div className="bg-gradient-to-br from-teal-900/40 via-emerald-900/30 to-teal-900/40 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-teal-500/30 p-6 shadow-2xl shadow-teal-500/20 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-400/30 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-400/30 rounded-full blur-3xl animate-pulse"></div>
                    
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h2 className="text-2xl font-bold text-white">{selectedList.name}</h2>
                          {selectedList.description && (
                            <p className="text-white/60 mt-1">{selectedList.description}</p>
                          )}
                        </div>
                        {selectedList.questions.length > 0 && (
                          <button
                            onClick={handleAddAllToToday}
                            className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold px-6 py-2 rounded-xl hover:shadow-lg hover:shadow-teal-500/50 transition-all flex items-center gap-2"
                          >
                            <Calendar className="w-4 h-4" />
                            Add All
                          </button>
                        )}
                      </div>

                      <div className="mb-6">
                        <button
                          onClick={() => setShowAddQuestionForm(!showAddQuestionForm)}
                          className="w-full py-3 bg-gray-900/40 border border-teal-500/30 rounded-xl text-white hover:bg-gray-900/60 hover:border-teal-500/50 transition-all font-medium flex items-center justify-center gap-2"
                        >
                          <Plus className="w-5 h-5" />
                          Add Question
                        </button>

                        {showAddQuestionForm && (
                          <form onSubmit={handleAddQuestion} className="mt-4 p-4 bg-gray-900/60 rounded-xl border border-teal-500/20">
                            <input
                              type="text"
                              placeholder="Question number, URL, or slug (e.g., 1, two-sum)"
                              value={questionInput}
                              onChange={(e) => setQuestionInput(e.target.value)}
                              disabled={submitting}
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500 mb-3 disabled:opacity-50"
                            />
                            <div className="flex gap-2">
                              <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold py-2 rounded-xl hover:shadow-lg hover:shadow-teal-500/50 transition-all disabled:opacity-50"
                              >
                                {submitting ? 'Adding...' : 'Add'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowAddQuestionForm(false)}
                                disabled={submitting}
                                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        )}
                      </div>

                      {selectedList.questions.length === 0 ? (
                        <div className="text-center py-12">
                          <List className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                          <p className="text-white/50 text-lg">No questions yet</p>
                          <p className="text-white/40 text-sm mt-2">Add questions to get started</p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                          {selectedList.questions.map((question) => (
                            <div
                              key={question._id || question.questionNumber}
                              className="p-4 bg-gray-900/40 border border-white/10 rounded-xl hover:bg-gray-900/60 hover:border-teal-500/30 transition-all"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                                    <span className="text-teal-400 font-mono text-sm font-semibold">#{question.questionNumber}</span>
                                    <a
                                      href={question.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="font-semibold text-white hover:text-teal-400 transition-colors flex items-center gap-1"
                                    >
                                      {question.title}
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-lg border ${getDifficultyColor(question.difficulty)}`}>
                                      {question.difficulty}
                                    </span>
                                  </div>
                                  {question.tags && question.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                      {question.tags.slice(0, 5).map((tag, idx) => (
                                        <span
                                          key={idx}
                                          className="text-xs px-2 py-1 bg-teal-500/10 border border-teal-500/20 rounded-lg text-teal-300"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                      {question.tags.length > 5 && (
                                        <span className="text-xs px-2 py-1 text-gray-400">
                                          +{question.tags.length - 5} more
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleAddQuestionToToday(question.questionNumber)}
                                    className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-teal-500/50 transition-all"
                                    title="Add to today"
                                  >
                                    <Calendar className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleRemoveQuestion(question.questionNumber)}
                                    className="px-3 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition-all"
                                    title="Remove"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-teal-900/40 via-emerald-900/30 to-teal-900/40 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-teal-500/30 p-12 shadow-2xl shadow-teal-500/20 text-center">
                    <List className="w-20 h-20 text-gray-500 mx-auto mb-4" />
                    <p className="text-white/50 text-lg">Select a list to view details</p>
                    <p className="text-white/40 text-sm mt-2">or create a new list to get started</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(45, 212, 191, 0.3);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(45, 212, 191, 0.5);
          }
        `}</style>
      </div>
    </div>
  );
};

export default CustomLists;
