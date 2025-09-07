'use client'

import React, { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Bell, X, CheckCircle, AlertTriangle, Info, Calendar, Users, Book } from 'lucide-react'

interface Notification {
  id: string
  title: string
  message: string
  type: 'reminder' | 'deadline' | 'system' | 'social' | 'achievement' | 'study_session'
  isRead: boolean
  createdAt: Date
  actionUrl?: string
  priority: 'low' | 'medium' | 'high'
}

interface NotificationCenterProps {
  notifications: Notification[]
  onMarkAsRead: (_id: string) => void
  onDismiss: (_id: string) => void
  onMarkAllAsRead: () => void
}

export default function NotificationCenter({ 
  notifications, 
  onMarkAsRead, 
  onDismiss, 
  onMarkAllAsRead 
}: NotificationCenterProps) {
  const [showAll, setShowAll] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all')

  const unreadCount = notifications.filter((n: any) => !n.isRead).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reminder':
        return <Bell className="h-5 w-5 text-blue-600" />
      case 'deadline':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'achievement':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'social':
        return <Users className="h-5 w-5 text-purple-600" />
      case 'study_session':
        return <Book className="h-5 w-5 text-indigo-600" />
      case 'system':
        return <Info className="h-5 w-5 text-neutral-600" />
      default:
        return <Calendar className="h-5 w-5 text-neutral-600" />
    }
  }

  const filteredNotifications = notifications.filter((notification: any) => {
    switch (filter) {
      case 'unread':
        return !notification.isRead
      case 'high':
        return notification.priority === 'high'
      default:
        return true
    }
  })

  const displayNotifications = showAll 
    ? filteredNotifications 
    : filteredNotifications.slice(0, 5)

  const markAsRead = (id: string) => {
    onMarkAsRead(id)
  }

  const dismissNotification = (id: string) => {
    onDismiss(id)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-neutral-600" />
          <h3 className="text-lg font-semibold text-neutral-900">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-neutral-100 rounded-lg p-1">
        {[
          { key: 'all', label: 'All' },
          { key: 'unread', label: 'Unread' },
          { key: 'high', label: 'High Priority' }
        ].map((tab: any) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              filter === tab.key
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {displayNotifications.length === 0 ? (
        <div className="text-center py-8">
          <Bell className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-500 mb-2">No notifications</p>
          <p className="text-sm text-neutral-400">
            You're all caught up! New notifications will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayNotifications.map((notification: any) => (
            <div
              key={notification.id}
              className={`border rounded-lg p-3 transition-colors cursor-pointer ${
                notification.isRead
                  ? 'bg-white border-neutral-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-neutral-900 text-sm mb-1">
                      {notification.title}
                    </h4>
                    <p className="text-sm text-neutral-600 mb-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={(e: any) => {
                    e.stopPropagation()
                    dismissNotification(notification.id)
                  }}
                  className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              {!notification.isRead && (
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Show More/Less Button */}
      {filteredNotifications.length > 5 && (
        <div className="mt-4 pt-4 border-t border-neutral-200">
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
          >
            {showAll ? 'Show less' : `View all ${filteredNotifications.length} notifications`} →
          </button>
        </div>
      )}
    </div>
  )
}