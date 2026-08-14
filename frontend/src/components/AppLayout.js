import React, { useState, useRef, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  User,
  Home,
  List,
  FlaskConical,
  StickyNote,
  Settings,
  Bell,
  LogOut,
} from "lucide-react";
import { notificationsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { queryClient, queryKeys } from "../lib/queryClient";

const NAV_ITEMS = [
  { id: "home", icon: Home, label: "Home", path: "/home" },
  { id: "lists", icon: List, label: "Lists", path: "/lists" },
  { id: "labs", icon: FlaskConical, label: "Labs", path: "/labs" },
  { id: "notes", icon: StickyNote, label: "Notes", path: "/notes" },
  { id: "settings", icon: Settings, label: "Settings", path: "/settings" },
  { id: "profile", icon: User, label: "Profile", path: "/profile" },
];

const PATH_TO_NAV = {
  "/home": "home",
  "/lists": "lists",
  "/labs": "labs",
  "/notes": "notes",
  "/settings": "settings",
  "/profile": "profile",
  "/notifications": "notifications",
};

function getScale(currentIndex, hoveredIndex) {
  if (hoveredIndex === null) return 1;
  const distance = Math.abs(currentIndex - hoveredIndex);
  if (distance === 0) return 1.6;
  if (distance === 1) return 1.3;
  if (distance === 2) return 1.15;
  return 1;
}

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [hoveredNav, setHoveredNav] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  const activeNav = PATH_TO_NAV[location.pathname] || "";
  const userData = {
    username: user?.username || "User",
    email: user?.email || "",
    _id: user?._id || user?.id,
  };

  const { data: notifications = [] } = useQuery({
    queryKey: queryKeys.notifications,
    queryFn: async () => {
      const response = await notificationsAPI.getNotifications();
      return response.data || [];
    },
  });

  const topNotifications = notifications.slice(0, 2);
  const hasUnread = notifications.some(
    (n) => !n.readBy?.some((r) => String(r.userId) === String(userData._id)),
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    if (showNotifications || showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications, showProfileMenu]);

  const handleLogout = () => {
    queryClient.clear();
    logout();
    navigate("/login");
  };

  const go = (path) => {
    setIsMenuOpen(false);
    setShowNotifications(false);
    setShowProfileMenu(false);
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden font-['Inter',sans-serif]">
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(45, 212, 191, 0.3) 10px, rgba(45, 212, 191, 0.3) 11px)`,
          }}
        />
      </div>
      <div className="absolute top-20 right-40 w-96 h-96 bg-gradient-to-br from-teal-500/20 to-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-40 left-40 w-96 h-96 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl pointer-events-none" />

      <nav className="fixed top-3 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl lg:rounded-full px-4 sm:px-8 shadow-2xl">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <button
              onClick={() => go("/home")}
              className="flex items-center space-x-2 sm:space-x-3"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-base sm:text-lg font-bold text-black">
                  ✓
                </span>
              </div>
              <span className="text-lg sm:text-xl font-bold tracking-tight">
                <span className="text-white">Algo</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">
                  Tick
                </span>
              </span>
            </button>

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

            <div className="hidden md:flex items-center gap-3">
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowProfileMenu(false);
                  }}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors relative"
                >
                  <Bell className="w-5 h-5 text-gray-300" />
                  {hasUnread && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-teal-400 rounded-full" />
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50">
                    <div className="p-4 border-b border-white/10">
                      <h3 className="font-semibold text-white">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {topNotifications.length > 0 ? (
                        topNotifications.map((notification, index) => (
                          <div
                            key={notification._id}
                            className={`p-4 hover:bg-white/5 transition-colors cursor-pointer ${
                              index < topNotifications.length - 1
                                ? "border-b border-white/5"
                                : ""
                            }`}
                            onClick={() => go("/notifications")}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-2 h-2 rounded-full mt-2 ${
                                  !notification.readBy?.some(
                                    (r) =>
                                      String(r.userId) === String(userData._id),
                                  )
                                    ? "bg-teal-400"
                                    : "bg-white/20"
                                }`}
                              />
                              <div className="flex-1">
                                <p className="text-white text-sm">
                                  {notification.title}
                                </p>
                                <p className="text-white/60 text-xs mt-1">
                                  {notification.description}
                                </p>
                                <p className="text-white/40 text-xs mt-1">
                                  {new Date(
                                    notification.createdAt,
                                  ).toLocaleDateString()}
                                </p>
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
                        onClick={() => go("/notifications")}
                        className="w-full text-center text-teal-400 hover:text-teal-300 text-sm font-medium transition-colors"
                      >
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

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

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50">
                    <div className="p-3 border-b border-white/10">
                      <p className="text-white font-medium text-sm">
                        Hi {userData.username}
                      </p>
                      <p className="text-white/60 text-xs mt-1">
                        {userData.email}
                      </p>
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

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>

          {isMenuOpen && (
            <div className="lg:hidden border-t border-white/10 py-4 space-y-3">
              <div className="flex items-center gap-2 px-4 py-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 via-emerald-500 to-teal-500 p-0.5">
                  <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                    <User className="w-4 h-4 text-teal-400" />
                  </div>
                </div>
                <span className="text-gray-200 font-medium text-sm">
                  Hi {userData.username}
                </span>
              </div>
              <div className="px-4 space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeNav === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => go(item.path)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                        isActive
                          ? "bg-teal-500/15 text-teal-400"
                          : "text-gray-300 hover:text-teal-400 hover:bg-white/5"
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
                  onClick={() => go("/notifications")}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-teal-400 hover:bg-white/5 rounded-lg transition-all"
                >
                  <Bell className="w-5 h-5" />
                  <span className="text-sm font-medium">Notifications</span>
                </button>
                <button
                  onClick={handleLogout}
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

      <div className="hidden lg:flex">
        <div className="fixed left-4 xl:left-8 top-1/2 transform -translate-y-1/2 bg-gradient-to-b from-gray-800/60 via-gray-800/80 to-gray-900/60 backdrop-blur-2xl rounded-full p-3 border border-white/10 shadow-2xl shadow-black/50 flex flex-col gap-6 z-50">
          {NAV_ITEMS.map((item, index) => {
            const Icon = item.icon;
            const scale = getScale(index, hoveredNav);
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => go(item.path)}
                onMouseEnter={() => setHoveredNav(index)}
                onMouseLeave={() => setHoveredNav(null)}
                className={`p-3 rounded-full transition-all duration-300 relative group ${
                  isActive
                    ? "bg-gradient-to-br from-teal-400 to-emerald-500 shadow-lg shadow-teal-500/50"
                    : "bg-white/5 hover:bg-white/10"
                }`}
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: "center",
                }}
              >
                <Icon
                  className={`w-5 h-5 ${isActive ? "text-black" : "text-gray-300"}`}
                />
                <div className="absolute left-full ml-4 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">
                  {item.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 mt-20 sm:mt-24 lg:ml-20">
        <Outlet />
      </div>
    </div>
  );
}
