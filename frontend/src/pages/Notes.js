import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Home, List, FlaskConical, StickyNote, Settings, Plus, Trash2, Edit2, FileText, Link2, Download, Eye, X, Bell, LogOut } from 'lucide-react';
import { notesAPI, notificationsAPI } from '../services/api';
import { useConfirm } from '../context/ConfirmContext';
import HamsterLoader from '../components/HamsterLoader';

const Notes = () => {
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [hoveredNav, setHoveredNav] = useState(null);
  const [activeNav, setActiveNav] = useState('notes');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userData, setUserData] = useState({ username: '', email: '' });
  const [topNotifications, setTopNotifications] = useState([]);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    link: '',
    pdfFile: null
  });

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
    fetchNotes();
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

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await notesAPI.getNotes();
      setNotes(response.data.notes);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      showMessage('error', 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setFormData({ ...formData, pdfFile: file });
    } else if (file) {
      showMessage('error', 'Only PDF files are allowed');
      e.target.value = '';
    }
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };
  const handleCreateNote = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showMessage('error', 'Note name is required');
      return;
    }

    try {
      setSubmitting(true);
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      if (formData.link) formDataToSend.append('link', formData.link);
      if (formData.pdfFile) formDataToSend.append('pdf', formData.pdfFile);

      const response = await notesAPI.createNote(formDataToSend);
      setNotes([response.data.note, ...notes]);
      setFormData({ name: '', link: '', pdfFile: null });
      setShowCreateForm(false);
      showMessage('success', 'Note created successfully!');
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to create note');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateNote = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showMessage('error', 'Note name is required');
      return;
    }

    try {
      setSubmitting(true);
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('link', formData.link || '');
      if (formData.pdfFile) formDataToSend.append('pdf', formData.pdfFile);

      const response = await notesAPI.updateNote(selectedNote._id, formDataToSend);
      setNotes(notes.map(n => n._id === selectedNote._id ? response.data.note : n));
      setSelectedNote(response.data.note);
      setEditMode(false);
      showMessage('success', 'Note updated successfully!');
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to update note');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    const confirmed = await confirm({
      title: 'Delete Note',
      message: 'Are you sure you want to delete this note?',
      confirmText: 'Delete',
      variant: 'danger'
    });
    
    if (!confirmed) return;

    try {
      await notesAPI.deleteNote(noteId);
      setNotes(notes.filter(n => n._id !== noteId));
      if (selectedNote?._id === noteId) {
        setSelectedNote(null);
      }
      showMessage('success', 'Note deleted successfully');
    } catch (error) {
      showMessage('error', 'Failed to delete note');
    }
  };

  const handleSelectNote = (note) => {
    setSelectedNote(note);
    setFormData({
      name: note.name,
      link: note.link || '',
      pdfFile: null
    });
    setEditMode(false);
  };

  const handleEditClick = () => {
    setEditMode(true);
    setFormData({
      name: selectedNote.name,
      link: selectedNote.link || '',
      pdfFile: null
    });
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setFormData({
      name: selectedNote.name,
      link: selectedNote.link || '',
      pdfFile: null
    });
  };

  const handleRemovePdf = async () => {
    const confirmed = await confirm({
      title: 'Remove PDF',
      message: 'Are you sure you want to remove the PDF?',
      confirmText: 'Remove',
      variant: 'warning'
    });
    
    if (!confirmed) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', selectedNote.name);
      formDataToSend.append('link', selectedNote.link || '');
      formDataToSend.append('removePdf', 'true');

      const response = await notesAPI.updateNote(selectedNote._id, formDataToSend);
      setNotes(notes.map(n => n._id === selectedNote._id ? response.data.note : n));
      setSelectedNote(response.data.note);
      showMessage('success', 'PDF removed successfully');
    } catch (error) {
      showMessage('error', 'Failed to remove PDF');
    }
  };

  const getPdfUrl = (pdfUrl) => {
    if (!pdfUrl) return null;
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.replace('/api', '');
    const fullUrl = `${baseUrl}${pdfUrl}`;
    return fullUrl;
  };

  if (loading && notes.length === 0) {
    return <HamsterLoader />;
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
          My <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">Notes</span>
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
              {/* Notes Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-teal-900/40 via-emerald-900/30 to-teal-900/40 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-teal-500/30 p-4 sm:p-6 shadow-2xl shadow-teal-500/20 relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-400/30 rounded-full blur-3xl animate-pulse"></div>
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-400/30 rounded-full blur-3xl animate-pulse"></div>
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-white">Notes</h2>
                      <button
                        onClick={() => {
                          setShowCreateForm(true);
                          setFormData({ name: '', link: '', pdfFile: null });
                        }}
                        className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-teal-500/50 transition-all flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        New
                      </button>
                    </div>

                    {loading ? (
                      <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="p-4 bg-gray-900/40 border border-teal-500/20 rounded-xl animate-pulse">
                            <div className="h-5 bg-white/10 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-white/10 rounded w-1/2"></div>
                          </div>
                        ))}
                      </div>
                    ) : notes.length === 0 ? (
                      <p className="text-white/50 text-center py-8">No notes yet. Create one to get started!</p>
                    ) : (
                      <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                        {notes.map(note => (
                          <div
                            key={note._id}
                            onClick={() => handleSelectNote(note)}
                            className={`p-4 rounded-xl cursor-pointer transition-all ${
                              selectedNote?._id === note._id
                                ? 'bg-gradient-to-r from-teal-500/20 to-emerald-500/20 border border-teal-500/40'
                                : 'bg-gray-900/40 border border-teal-500/20 hover:bg-gray-800/60 hover:border-teal-500/30'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="font-semibold text-white">{note.name}</h3>
                                <div className="text-sm text-white/60 mt-1 space-y-1">
                                  {note.pdfFileName && (
                                    <div className="flex items-center gap-1">
                                      <FileText className="w-3 h-3" />
                                      <span>{note.pdfFileName.length > 20 ? note.pdfFileName.substring(0, 20) + '...' : note.pdfFileName}</span>
                                    </div>
                                  )}
                                  {note.link && (
                                    <div className="flex items-center gap-1">
                                      <Link2 className="w-3 h-3" />
                                      <span>Link attached</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNote(note._id);
                                }}
                                className="text-red-400 hover:text-red-300 transition-colors p-1"
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

              {/* Note Details / Create Form */}
              <div className="lg:col-span-2">
                <div className="bg-gradient-to-br from-teal-900/40 via-emerald-900/30 to-teal-900/40 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-teal-500/30 p-4 sm:p-6 shadow-2xl shadow-teal-500/20 relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-400/30 rounded-full blur-3xl animate-pulse"></div>
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-400/30 rounded-full blur-3xl animate-pulse"></div>
                  
                  <div className="relative z-10">
                    {showCreateForm ? (
                      /* Create Form */
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-6">Create New Note</h2>
                        <form onSubmit={handleCreateNote} className="space-y-4">
                          <div>
                            <label className="block text-white/80 mb-2 font-medium">Name *</label>
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent backdrop-blur-sm transition-all"
                              placeholder="Enter note name"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-white/80 mb-2 font-medium">Link (optional)</label>
                            <input
                              type="url"
                              value={formData.link}
                              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent backdrop-blur-sm transition-all"
                              placeholder="https://example.com"
                            />
                          </div>

                          <div>
                            <label className="block text-white/80 mb-2 font-medium">PDF File (optional)</label>
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={handleFileChange}
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-teal-500 file:to-emerald-500 file:text-white hover:file:shadow-lg file:transition-all"
                            />
                            <p className="text-white/40 text-sm mt-1">Max file size: 10MB</p>
                          </div>

                          <div className="flex gap-3 pt-2">
                            <button
                              type="submit"
                              disabled={submitting}
                              className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-teal-500/50 transition-all disabled:opacity-50"
                            >
                              {submitting ? 'Creating...' : 'Create Note'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowCreateForm(false);
                                setFormData({ name: '', link: '', pdfFile: null });
                              }}
                              className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : selectedNote ? (
                      /* Note Details / Edit Form */
                      <div>
                        {editMode ? (
                          /* Edit Mode */
                          <div>
                            <h2 className="text-2xl font-bold text-white mb-6">Edit Note</h2>
                            <form onSubmit={handleUpdateNote} className="space-y-4">
                              <div>
                                <label className="block text-white/80 mb-2 font-medium">Name *</label>
                                <input
                                  type="text"
                                  value={formData.name}
                                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent backdrop-blur-sm transition-all"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-white/80 mb-2 font-medium">Link</label>
                                <input
                                  type="url"
                                  value={formData.link}
                                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent backdrop-blur-sm transition-all"
                                  placeholder="https://example.com"
                                />
                              </div>

                              <div>
                                <label className="block text-white/80 mb-2 font-medium">Update PDF File</label>
                                <input
                                  type="file"
                                  accept=".pdf"
                                  onChange={handleFileChange}
                                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-teal-500 file:to-emerald-500 file:text-white hover:file:shadow-lg file:transition-all"
                                />
                                {selectedNote.pdfFileName && (
                                  <p className="text-white/60 text-sm mt-1">
                                    Current: {selectedNote.pdfFileName}
                                  </p>
                                )}
                              </div>

                              <div className="flex gap-3 pt-2">
                                <button
                                  type="submit"
                                  disabled={submitting}
                                  className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-teal-500/50 transition-all disabled:opacity-50"
                                >
                                  {submitting ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCancelEdit}
                                  className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all"
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          </div>
                        ) : (
                          /* View Mode */
                          <div>
                            <div className="flex justify-between items-start mb-6">
                              <h2 className="text-2xl font-bold text-white">{selectedNote.name}</h2>
                              <button
                                onClick={handleEditClick}
                                className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-teal-500/50 transition-all flex items-center gap-2"
                              >
                                <Edit2 className="w-4 h-4" />
                                Edit
                              </button>
                            </div>

                            <div className="space-y-4">
                              {/* PDF Section */}
                              {selectedNote.pdfUrl ? (
                                <div className="bg-white/5 border border-teal-500/20 rounded-xl p-5">
                                  <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center gap-2">
                                      <FileText className="w-5 h-5 text-teal-400" />
                                      <h3 className="text-lg font-semibold text-white">PDF Document</h3>
                                    </div>
                                    <button
                                      onClick={handleRemovePdf}
                                      className="text-red-400 hover:text-red-300 text-sm transition-colors flex items-center gap-1"
                                    >
                                      <X className="w-4 h-4" />
                                      Remove
                                    </button>
                                  </div>
                                  <p className="text-white/60 mb-4">{selectedNote.pdfFileName}</p>
                                  <div className="flex gap-3">
                                    <a
                                      href={getPdfUrl(selectedNote.pdfUrl)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-teal-500/50 transition-all inline-flex items-center gap-2"
                                    >
                                      <Eye className="w-4 h-4" />
                                      View PDF
                                    </a>
                                    <a
                                      href={getPdfUrl(selectedNote.pdfUrl)}
                                      download={selectedNote.pdfFileName}
                                      className="bg-white/5 border border-white/10 text-white px-4 py-2 rounded-xl hover:bg-white/10 transition-all inline-flex items-center gap-2"
                                    >
                                      <Download className="w-4 h-4" />
                                      Download
                                    </a>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-white/5 border border-teal-500/20 rounded-xl p-5 text-white/50 text-center py-8">
                                  No PDF attached
                                </div>
                              )}

                              {/* Link Section */}
                              {selectedNote.link ? (
                                <div className="bg-white/5 border border-teal-500/20 rounded-xl p-5">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Link2 className="w-5 h-5 text-teal-400" />
                                    <h3 className="text-lg font-semibold text-white">Link</h3>
                                  </div>
                                  <a
                                    href={selectedNote.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-teal-400 hover:text-teal-300 transition-opacity break-all"
                                  >
                                    {selectedNote.link}
                                  </a>
                                </div>
                              ) : (
                                <div className="bg-white/5 border border-teal-500/20 rounded-xl p-5 text-white/50 text-center py-8">
                                  No link attached
                                </div>
                              )}

                              {/* Metadata */}
                              <div className="bg-white/5 border border-teal-500/20 rounded-xl p-4 text-sm text-white/60 space-y-1">
                                <div>Created: {new Date(selectedNote.createdAt).toLocaleDateString()}</div>
                                <div>Updated: {new Date(selectedNote.updatedAt).toLocaleDateString()}</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* No Selection */
                      <div className="text-center text-white/50 py-16">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-teal-400/50" />
                        <p className="text-xl">Select a note to view details</p>
                        <p className="text-white/40 text-sm mt-2">or create a new note to get started</p>
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

export default Notes;
