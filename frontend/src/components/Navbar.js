import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLogoClick = () => {
    if (user) {
      navigate('/home');
    } else {
      navigate('/');
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-3 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl">
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl sm:rounded-full px-4 sm:px-8 shadow-2xl">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo - Clickable */}
          <button 
            onClick={handleLogoClick}
            className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-[#61dca3] to-[#61b3dc] rounded-lg flex items-center justify-center">
              <span className="text-base sm:text-lg font-bold text-black">✓</span>
            </div>
            <span className="text-lg sm:text-xl font-bold text-white tracking-tight">AlgoTick</span>
          </button>
          
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/dashboard"
              className="text-white/70 hover:text-white font-medium transition-colors text-sm"
            >
              Dashboard
            </Link>
            <Link
              to="/lists"
              className="text-white/70 hover:text-white font-medium transition-colors text-sm"
            >
              Lists
            </Link>
            <Link
              to="/labs"
              className="text-white/70 hover:text-white font-medium transition-colors text-sm"
            >
              Labs
            </Link>
            <Link
              to="/notes"
              className="text-white/70 hover:text-white font-medium transition-colors text-sm"
            >
              Notes
            </Link>
            <Link
              to="/settings"
              className="text-white/70 hover:text-white font-medium transition-colors text-sm"
            >
              Settings
            </Link>
            <span className="text-white/60 text-sm">
              <span className="font-semibold text-white">{user?.username}</span>
            </span>
            <button
              onClick={handleLogout}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-2 rounded-full text-sm font-semibold transition-all"
            >
              Logout
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              // X icon
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              // Hamburger icon
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-white/10 py-4 space-y-3">
            <Link
              to="/dashboard"
              onClick={closeMenu}
              className="block text-white/70 hover:text-white hover:bg-white/5 font-medium transition-colors text-sm px-4 py-2 rounded-lg"
            >
              Dashboard
            </Link>
            <Link
              to="/lists"
              onClick={closeMenu}
              className="block text-white/70 hover:text-white hover:bg-white/5 font-medium transition-colors text-sm px-4 py-2 rounded-lg"
            >
              Lists
            </Link>
            <Link
              to="/labs"
              onClick={closeMenu}
              className="block text-white/70 hover:text-white hover:bg-white/5 font-medium transition-colors text-sm px-4 py-2 rounded-lg"
            >
              Labs
            </Link>
            <Link
              to="/notes"
              onClick={closeMenu}
              className="block text-white/70 hover:text-white hover:bg-white/5 font-medium transition-colors text-sm px-4 py-2 rounded-lg"
            >
              Notes
            </Link>
            <Link
              to="/settings"
              onClick={closeMenu}
              className="block text-white/70 hover:text-white hover:bg-white/5 font-medium transition-colors text-sm px-4 py-2 rounded-lg"
            >
              Settings
            </Link>
            <div className="px-4 py-2 border-t border-white/10">
              <span className="text-white/60 text-sm block mb-2">
                Logged in as <span className="font-semibold text-white">{user?.username}</span>
              </span>
              <button
                onClick={() => {
                  closeMenu();
                  handleLogout();
                }}
                className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
