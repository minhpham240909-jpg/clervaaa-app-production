'use client';

import React, { memo, useMemo } from 'react';
import Image from 'next/image';

// Memoized user avatar component
interface UserAvatarProps {
  user: {
    id: string;
    name: string;
    image?: string | null;
  };
  size?: number;
  className?: string;
}

export const MemoizedUserAvatar = memo(function UserAvatar({ 
  user, 
  size = 40, 
  className = '' 
}: UserAvatarProps) {
  const initials = useMemo(() => {
    return user.name
      ? user.name.split(' ').map((n: any) => n[0]).join('').toUpperCase()
      : 'U';
  }, [user.name]);

  if (user.image) {
    return (
      <Image
        src={user.image}
        alt={user.name}
        width={size}
        height={size}
        className={`rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`bg-primary-500 text-white rounded-full flex items-center justify-center font-medium ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
});

// Memoized message component for chat
interface MessageItemProps {
  message: {
    id: string;
    content: string;
    senderId: string;
    timestamp: Date;
    type?: string;
  };
  currentUserId: string;
  sender?: {
    id: string;
    name: string;
    image?: string | null;
  };
}

export const MemoizedMessageItem = memo(function MessageItem({ 
  message, 
  currentUserId, 
  sender 
}: MessageItemProps) {
  const isOwnMessage = message.senderId === currentUserId;
  
  const formattedTime = useMemo(() => {
    return message.timestamp.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  }, [message.timestamp]);

  return (
    <div className={`flex items-start space-x-2 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {sender && !isOwnMessage && (
        <MemoizedUserAvatar user={sender} size={32} />
      )}
      <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'text-right' : ''}`}>
        <div
          className={`px-4 py-2 rounded-lg ${
            isOwnMessage
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          <p className="text-sm">{message.content}</p>
        </div>
        <p className="text-xs text-gray-500 mt-1">{formattedTime}</p>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.currentUserId === nextProps.currentUserId &&
    prevProps.sender?.id === nextProps.sender?.id
  );
});

// Memoized study session card
interface StudySessionCardProps {
  session: {
    id: string;
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    participantCount: number;
    maxParticipants?: number;
    subject?: string;
  };
  onJoin?: (_sessionId: string) => void;
  isJoining?: boolean;
}

export const MemoizedStudySessionCard = memo(function StudySessionCard({ 
  session, 
  onJoin,
  isJoining = false 
}: StudySessionCardProps) {
  const duration = useMemo(() => {
    const diff = session.endTime.getTime() - session.startTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }, [session.startTime, session.endTime]);

  const timeRange = useMemo(() => {
    const startTime = session.startTime.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
    const endTime = session.endTime.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${startTime} - ${endTime}`;
  }, [session.startTime, session.endTime]);

  const spotsLeft = useMemo(() => {
    if (!session.maxParticipants) return null;
    return session.maxParticipants - session.participantCount;
  }, [session.maxParticipants, session.participantCount]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-900 text-sm">{session.title}</h3>
        {session.subject && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {session.subject}
          </span>
        )}
      </div>
      
      {session.description && (
        <p className="text-gray-600 text-xs mb-3 line-clamp-2">{session.description}</p>
      )}
      
      <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
        <span>{timeRange}</span>
        <span>{duration}</span>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-600">
          <span>{session.participantCount} participants</span>
          {spotsLeft !== null && (
            <span className="ml-2 text-orange-600">
              {spotsLeft} spots left
            </span>
          )}
        </div>
        
        {onJoin && (
          <button
            onClick={() => onJoin(session.id)}
            disabled={isJoining || spotsLeft === 0}
            className="px-3 py-1 bg-primary-500 text-white text-xs rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isJoining ? 'Joining...' : 'Join'}
          </button>
        )}
      </div>
    </div>
  );
});

// Memoized stat card for dashboard
interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red';
}

export const MemoizedStatCard = memo(function StatCard({ 
  title, 
  value, 
  change, 
  icon, 
  color = 'blue' 
}: StatCardProps) {
  const colorClasses = useMemo(() => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      red: 'bg-red-100 text-red-600'
    };
    return colors[color];
  }, [color]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${change.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {change.isPositive ? '+' : ''}{change.value}%
            </p>
          )}
        </div>
        <div className={`p-2 rounded-lg ${colorClasses}`}>
          {icon}
        </div>
      </div>
    </div>
  );
});

// Memoized list item for better virtual scrolling performance
interface ListItemProps {
  item: any;
  index: number;
  isSelected?: boolean;
  onClick?: (_item: any, _index: number) => void;
  renderContent: (_item: any, _index: number) => React.ReactNode;
}

export const MemoizedListItem = memo(function ListItem({ 
  item, 
  index, 
  isSelected, 
  onClick, 
  renderContent 
}: ListItemProps) {
  return (
    <div
      className={`p-2 cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
      }`}
      onClick={() => onClick?.(item, index)}
    >
      {renderContent(item, index)}
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.item === nextProps.item &&
    prevProps.index === nextProps.index &&
    prevProps.isSelected === nextProps.isSelected
  );
});