import React, { useState } from 'react';
import { Bell, Check, Trash2, Award, TrendingUp, Zap, AlertCircle } from 'lucide-react';
import { notificationsAPI } from '../services/api';
import { useConfirm } from '../context/ConfirmContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';

const Notifications = () => {
  const { confirm } = useConfirm();
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState('all');

  const getNotificationIcon = (type) => {
    const iconMap = {
      achievement: { icon: Award, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
      streak: { icon: Zap, color: 'text-teal-400', bg: 'bg-teal-500/20' },
      progress: { icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
      reminder: { icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-500/20' },
      system: { icon: Bell, color: 'text-blue-400', bg: 'bg-blue-500/20' },
      update: { icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/20' },
    };
    return iconMap[type] || iconMap.system;
  };

  const formatTimestamp = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diff = now - notifDate;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) !== 1 ? 's' : ''} ago`;
    return notifDate.toLocaleDateString();
  };

  const { data: notifications = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.notifications,
    queryFn: async () => {
      const response = await notificationsAPI.getNotifications();
      return response.data || [];
    },
  });

  const invalidateNotifications = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
  };

  const toggleNotificationRead = async (id, currentReadStatus) => {
    try {
      if (currentReadStatus) {
        await notificationsAPI.markAsUnread(id);
      } else {
        await notificationsAPI.markAsRead(id);
      }
      invalidateNotifications();
    } catch (error) {
      console.error('Error toggling notification read status:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationsAPI.deleteNotification(id);
      invalidateNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      invalidateNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const clearAll = async () => {
    const confirmed = await confirm({
      title: 'Delete All Notifications',
      message: 'Are you sure you want to delete all notifications?',
      confirmText: 'Delete All',
      variant: 'danger'
    });

    if (!confirmed) return;

    try {
      await notificationsAPI.deleteAll();
      invalidateNotifications();
    } catch (error) {
      console.error('Error deleting all notifications:', error);
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filterType === 'unread') return !notif.read;
    if (filterType === 'read') return notif.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Notifications</h1>
              <p className="text-gray-400 text-sm mt-1">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-1">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterType === 'all'
                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilterType('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterType === 'unread'
                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilterType('read')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterType === 'read'
                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Read ({notifications.length - unreadCount})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 hover:text-teal-400 transition-all text-sm font-medium"
            >
              <Check className="w-4 h-4" />
              Mark all as read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 hover:text-red-300 transition-all text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center">
            <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4 animate-pulse" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">Loading notifications...</h3>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center">
            <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No notifications</h3>
            <p className="text-gray-500 text-sm">
              {filterType === 'unread'
                ? "You're all caught up! No unread notifications."
                : filterType === 'read'
                ? "No read notifications to show."
                : "You don't have any notifications yet."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const iconInfo = getNotificationIcon(notif.type);
            const NotifIcon = iconInfo.icon;
            const timestamp = formatTimestamp(notif.createdAt);

            return (
              <div
                key={notif._id}
                className={`group bg-white/5 backdrop-blur-sm border rounded-2xl p-5 transition-all hover:bg-white/10 ${
                  notif.read ? 'border-white/10' : 'border-teal-500/30 bg-teal-500/5'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${iconInfo.bg} flex items-center justify-center flex-shrink-0`}>
                    <NotifIcon className={`w-6 h-6 ${iconInfo.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-white font-semibold text-base">{notif.title}</h3>
                      <span className="text-gray-500 text-xs whitespace-nowrap">{timestamp}</span>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed mb-3">{notif.description}</p>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleNotificationRead(notif._id, notif.read)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          notif.read
                            ? 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10'
                            : 'bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 border border-teal-500/30'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                        {notif.read ? 'Mark unread' : 'Mark read'}
                      </button>
                      <button
                        onClick={() => deleteNotification(notif._id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:text-red-300 text-xs font-medium transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {notifications.length === 0 && !loading && (
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Notifications will appear here when you achieve milestones, maintain streaks, or receive important updates.
          </p>
        </div>
      )}
    </>
  );
};

export default Notifications;
