import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Trophy, Star, Award, TrendingUp, Calendar, Zap } from 'lucide-react';
import api from '../../services/api';

const Notifications = ({ memberId }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, achievements, leaderboard

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/user/notifications/${memberId}`);
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (memberId) {
      fetchNotifications();
    }
  }, [memberId]);

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/api/user/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(notif => 
          notif.notification_id === notificationId 
            ? { ...notif, is_read: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      await Promise.all(
        unreadNotifications.map(notif => 
          api.patch(`/api/user/notifications/${notif.notification_id}/read`)
        )
      );
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'ACHIEVEMENT':
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'LEADERBOARD':
        return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case 'SUCCESS':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'PROMOTION':
        return <Star className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'ACHIEVEMENT':
        return 'border-l-yellow-400 bg-yellow-50';
      case 'LEADERBOARD':
        return 'border-l-blue-400 bg-blue-50';
      case 'SUCCESS':
        return 'border-l-green-400 bg-green-50';
      case 'PROMOTION':
        return 'border-l-purple-400 bg-purple-50';
      default:
        return 'border-l-gray-400 bg-gray-50';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.is_read;
    if (filter === 'achievements') return notification.type === 'ACHIEVEMENT';
    if (filter === 'leaderboard') return notification.type === 'LEADERBOARD';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Bell className="w-12 h-12 text-purple-500 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full ml-2">
                {unreadCount}
              </span>
            )}
          </div>
          <p className="text-gray-600 text-lg">
            Stay updated with your gym achievements and progress
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-gray-700">Filter:</span>
              <div className="flex gap-2">
                {[
                  { key: 'all', label: 'All', icon: Bell },
                  { key: 'unread', label: 'Unread', icon: X },
                  { key: 'achievements', label: 'Achievements', icon: Trophy },
                  { key: 'leaderboard', label: 'Leaderboard', icon: TrendingUp }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      filter === key
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                    {key === 'unread' && unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Check className="w-4 h-4" />
                Mark All Read
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div
                key={notification.notification_id}
                className={`bg-white rounded-xl shadow-lg border-l-4 p-6 transition-all hover:shadow-xl ${
                  getNotificationColor(notification.type)
                } ${!notification.is_read ? 'ring-2 ring-purple-200' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={`font-semibold text-lg mb-2 ${
                          !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h3>
                        <p className={`text-gray-600 mb-3 ${
                          !notification.is_read ? 'font-medium' : ''
                        }`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(notification.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Zap className="w-4 h-4" />
                            {new Date(notification.created_at).toLocaleTimeString()}
                          </div>
                          {!notification.is_read && (
                            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                              New
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {!notification.is_read && (
                        <button
                          onClick={() => markAsRead(notification.notification_id)}
                          className="flex-shrink-0 p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {filter === 'unread' ? 'No unread notifications' : 
                 filter === 'achievements' ? 'No achievement notifications' :
                 filter === 'leaderboard' ? 'No leaderboard notifications' :
                 'No notifications yet'}
              </h3>
              <p className="text-gray-500">
                {filter === 'unread' ? 'All caught up! Check back later for new updates.' :
                 filter === 'achievements' ? 'Keep visiting the gym to unlock achievements!' :
                 filter === 'leaderboard' ? 'Stay active to see leaderboard updates!' :
                 'You\'ll receive notifications about your progress and achievements here.'}
              </p>
            </div>
          )}
        </div>

        {/* Stats Summary */}
        {notifications.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {notifications.length}
              </div>
              <div className="text-gray-600">Total Notifications</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {unreadCount}
              </div>
              <div className="text-gray-600">Unread</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {notifications.filter(n => n.type === 'ACHIEVEMENT').length}
              </div>
              <div className="text-gray-600">Achievements</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
