import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, AlertTriangle, Info, Gift, X } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const NotificationsPanel = ({ notifications, onMarkAsRead }) => {
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'WARNING': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'SUCCESS': return <Check className="h-5 w-5 text-green-600" />;
      case 'PROMOTION': return <Gift className="h-5 w-5 text-purple-600" />;
      default: return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'WARNING': return 'border-yellow-200 bg-yellow-50';
      case 'SUCCESS': return 'border-green-200 bg-green-50';
      case 'PROMOTION': return 'border-purple-200 bg-purple-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  const getNotificationTextColor = (type) => {
    switch (type) {
      case 'WARNING': return 'text-yellow-800';
      case 'SUCCESS': return 'text-green-800';
      case 'PROMOTION': return 'text-purple-800';
      default: return 'text-blue-800';
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.patch(`/api/user/notifications/${notificationId}/read`);
      onMarkAsRead();
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Error updating notification');
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (notifications.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card"
      >
        <div className="text-center py-12">
          <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Notifications</h3>
          <p className="text-gray-500">
            You're all caught up! Check back later for updates about your membership and gym news.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Bell className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
              <p className="text-sm text-gray-500">
                {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
              </p>
            </div>
          </div>
          
          {unreadCount > 0 && (
            <div className="flex items-center">
              <div className="h-6 w-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">{unreadCount}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`card border-l-4 ${getNotificationColor(notification.type)} ${
              !notification.is_read ? 'ring-2 ring-blue-100' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-sm font-medium ${getNotificationTextColor(notification.type)}`}>
                      {notification.title}
                    </h4>
                    {!notification.is_read && (
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              
              {!notification.is_read && (
                <button
                  onClick={() => handleMarkAsRead(notification.id)}
                  className="ml-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  title="Mark as read"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Notification Types Legend */}
      <div className="card">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Notification Types</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center">
            <Info className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-sm text-gray-600">Info</span>
          </div>
          <div className="flex items-center">
            <Check className="h-4 w-4 text-green-600 mr-2" />
            <span className="text-sm text-gray-600">Success</span>
          </div>
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
            <span className="text-sm text-gray-600">Warning</span>
          </div>
          <div className="flex items-center">
            <Gift className="h-4 w-4 text-purple-600 mr-2" />
            <span className="text-sm text-gray-600">Promotion</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationsPanel;
