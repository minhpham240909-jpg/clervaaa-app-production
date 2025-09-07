'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Clock, Users, Trophy, BookOpen, MessageCircle, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';

interface Notification {
  id: string;
  title: string;
  message: string;
  notificationType: string;
  isRead: boolean;
  relatedId?: string;
  data?: any;
  createdAt: string;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'study' | 'social' | 'achievements'>('all');
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      checkPushNotificationStatus();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      // This would be replaced with actual API call
      // const response = await fetch('/api/notifications');
      // const data = await response.json();
      
      // Mock data for demonstration
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: '🔥 Keep Your Streak Alive!',
          message: "You're on a 5-day study streak. Don't break it now!",
          notificationType: 'STREAK_MAINTENANCE',
          isRead: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          title: '🤝 New Study Partner Request',
          message: 'Sarah wants to be your study partner for Mathematics!',
          notificationType: 'PARTNER_REQUEST',
          isRead: false,
          relatedId: 'user-123',
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          title: '🏆 Achievement Unlocked!',
          message: 'Congratulations! You earned "Study Warrior" badge',
          notificationType: 'ACHIEVEMENT',
          isRead: true,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '4',
          title: '⏰ Deadline Reminder',
          message: 'Physics assignment is due in 2 days',
          notificationType: 'DEADLINE_ALERT',
          isRead: false,
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '5',
          title: '📚 Study Time!',
          message: 'Time for your scheduled study session',
          notificationType: 'STUDY_REMINDER',
          isRead: true,
          createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        },
      ];
      
      setNotifications(mockNotifications);
    } catch (error) {
      logger.error('Failed to fetch notifications', error instanceof Error ? error : new Error(String(error)));
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const checkPushNotificationStatus = () => {
    if ('Notification' in window) {
      setPushNotificationsEnabled(Notification.permission === 'granted');
    }
  };

  const requestPushNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setPushNotificationsEnabled(permission === 'granted');
      
      if (permission === 'granted') {
        toast.success('Push notifications enabled!');
      } else {
        toast.error('Push notifications denied');
      }
    }
  };

  const markAsRead = async (notificationIds: string[]) => {
    try {
      // This would be replaced with actual API call
      // await fetch('/api/notifications/read', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ notificationIds }),
      // });

      setNotifications(prev =>
        prev.map((notif: any) =>
          notificationIds.includes(notif.id)
            ? { ...notif, isRead: true }
            : notif
        )
      );
    } catch (error) {
      logger.error('Failed to mark notifications as read', error instanceof Error ? error : new Error(String(error)));
      toast.error('Failed to update notifications');
    }
  };

  const markAllAsRead = () => {
    const unreadIds = notifications.filter((n: any) => !n.isRead).map((n: any) => n.id);
    if (unreadIds.length > 0) {
      markAsRead(unreadIds);
    }
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter((n: any) => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'STUDY_REMINDER':
      case 'DEADLINE_ALERT':
        return <BookOpen className="w-5 h-5 text-blue-500" />;
      case 'PARTNER_REQUEST':
      case 'PARTNER_ACTIVITY':
        return <Users className="w-5 h-5 text-green-500" />;
      case 'ACHIEVEMENT':
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'CHAT_MESSAGE':
        return <MessageCircle className="w-5 h-5 text-purple-500" />;
      case 'STREAK_MAINTENANCE':
        return <Clock className="w-5 h-5 text-orange-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter((n: any) => !n.isRead);
      case 'study':
        return notifications.filter((n: any) => 
          ['STUDY_REMINDER', 'DEADLINE_ALERT', 'STREAK_MAINTENANCE'].includes(n.type)
        );
      case 'social':
        return notifications.filter((n: any) => 
          ['PARTNER_REQUEST', 'PARTNER_ACTIVITY', 'CHAT_MESSAGE'].includes(n.type)
        );
      case 'achievements':
        return notifications.filter((n: any) => n.type === 'ACHIEVEMENT');
      default:
        return notifications;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  if (!isOpen) return null;

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-xl border-l border-gray-200"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Bell className="w-6 h-6 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            {unreadCount > 0 && (
              <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Push Notification Settings */}
        {!pushNotificationsEnabled && (
          <div className="p-4 bg-blue-50 border-b border-blue-100">
            <div className="flex items-start space-x-3">
              <Bell className="w-5 h-5 text-blue-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-blue-800 font-medium">Enable Push Notifications</p>
                <p className="text-xs text-blue-600 mb-2">Get notified even when the app is closed</p>
                <button
                  onClick={requestPushNotifications}
                  className="text-xs bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600"
                >
                  Enable
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex overflow-x-auto p-4 pb-2 border-b border-gray-100">
          {[
            { key: 'all', label: 'All', count: notifications.length },
            { key: 'unread', label: 'Unread', count: unreadCount },
            { key: 'study', label: 'Study', count: notifications.filter((n: any) => ['STUDY_REMINDER', 'DEADLINE_ALERT', 'STREAK_MAINTENANCE'].includes(n.type)).length },
            { key: 'social', label: 'Social', count: notifications.filter((n: any) => ['PARTNER_REQUEST', 'PARTNER_ACTIVITY', 'CHAT_MESSAGE'].includes(n.type)).length },
            { key: 'achievements', label: 'Achievements', count: notifications.filter((n: any) => n.type === 'ACHIEVEMENT').length },
          ].map((tab: any) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm whitespace-nowrap mr-2 ${
                filter === tab.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                  filter === tab.key ? 'bg-blue-400' : 'bg-gray-300'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Actions */}
        {unreadCount > 0 && (
          <div className="p-4 pb-2">
            <button
              onClick={markAllAsRead}
              className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
            >
              <Check className="w-4 h-4" />
              <span>Mark all as read</span>
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <Bell className="w-12 h-12 mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredNotifications.map((notification: any) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`border-b border-gray-100 p-4 hover:bg-gray-50 cursor-pointer ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    if (!notification.isRead) {
                      markAsRead([notification.id]);
                    }
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className={`text-sm font-medium text-gray-900 ${
                          !notification.isRead ? 'font-semibold' : ''
                        }`}>
                          {notification.title}
                        </h4>
                        <button
                          onClick={(e: any) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="text-gray-400 hover:text-gray-600 ml-2"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                        
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 w-full">
            <Settings className="w-4 h-4" />
            <span>Notification Settings</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}