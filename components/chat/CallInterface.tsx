'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  PhoneOff, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Monitor, 
  MonitorOff,
  Settings,
  Maximize,
  Minimize,
  Users,
  MessageSquare,
  FileText,
  PenTool,
  Plus,
  Send
} from 'lucide-react';
import { useWebRTC } from '@/lib/hooks/useWebRTC';
import { useStudySession } from '@/lib/hooks/useStudySession';
import { logger } from '@/lib/logger';
import { ComponentErrorBoundary } from '@/components/ErrorBoundary';
import SafariPermissionsGuide from '@/components/safari/SafariPermissionsGuide';

interface CallInterfaceProps {
  call: {
    id: string;
    type: 'AUDIO' | 'VIDEO';
    participants: any[];
  };
  userId: string;
  onEndCall: () => void;
  onError?: (error: Error) => void;
}

interface VideoElementProps {
  stream: MediaStream | null;
  muted?: boolean;
  className?: string;
  placeholder?: React.ReactNode;
}

// Reusable video element component
const VideoElement: React.FC<VideoElementProps> = ({ stream, muted = false, className = '', placeholder }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!stream) {
    return (
      <div className={`bg-neutral-800 flex items-center justify-center ${className}`}>
        {placeholder || <VideoOff className='h-8 w-8 text-neutral-400' />}
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      className={`object-cover ${className}`}
      autoPlay
      playsInline
      muted={muted}
    />
  );
};

export default function CallInterface({ call, userId, onEndCall, onError }: CallInterfaceProps) {
  const [callDuration, setCallDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [activeStudyTool, setActiveStudyTool] = useState<'chat' | 'whiteboard' | 'notes' | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [showSafariGuide, setShowSafariGuide] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Use WebRTC hook
  const {
    isConnected,
    isConnecting,
    participants,
    localStream,
    isVideoEnabled,
    isAudioEnabled,
    isScreenSharing,
    error,
    startCall,
    endCall,
    toggleVideo,
    toggleAudio,
    startScreenShare,
    stopScreenShare,
    getParticipantStream,
  } = useWebRTC({
    roomId: call.id,
    userId,
    config: { video: call.type === 'VIDEO', audio: true },
    onError: (err) => {
      logger.error('WebRTC error in CallInterface', err);
      
      // Check if this is a Safari permissions error
      if (isClient && err.message.includes('Permission denied') || err.message.includes('NotAllowedError')) {
        const userAgent = navigator.userAgent;
        const isSafari = userAgent.includes('Safari') && !userAgent.includes('Chrome');
        if (isSafari) {
          setShowSafariGuide(true);
          return; // Don't call onError for Safari permission issues
        }
      }
      
      onError?.(err);
    },
    onParticipantJoined: (participant) => {
      studySession.addParticipant(participant.id);
    },
    onParticipantLeft: (participantId) => {
      studySession.removeParticipant(participantId);
    },
    onCallEnded: () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      const sessionData = studySession.endSession();
      logger.info('Study session completed', sessionData);
      onEndCall();
    },
  });

  // Use Study Session hook
  const studySession = useStudySession({
    sessionId: call.id,
    userId,
    topic: `${call.type} Call Session`,
    onSessionEnd: (sessionData) => {
      logger.info('Study session ended with data', sessionData);
    },
    onNoteAdded: (note) => {
      logger.info('New study note added', note);
    }
  });

  // Client-side hydration check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Start call when component mounts
  useEffect(() => {
    if (!isClient) return; // Wait for client-side hydration
    
    const initializeCall = async () => {
      try {
        await startCall(true); // Assume first user is initiator
      } catch (err) {
        logger.error('Failed to start call', err as Error);
      }
    };

    initializeCall();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [startCall, isClient]);

  // Call duration timer
  useEffect(() => {
    if (isConnected && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    if (!isConnected && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isConnected]);

  const formatDuration = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleEndCall = useCallback(async () => {
    try {
      await endCall();
    } catch (err) {
      logger.error('Error ending call', err as Error);
      onEndCall(); // Force end if there's an error
    }
  }, [endCall, onEndCall]);

  const handleToggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        await stopScreenShare();
        studySession.recordScreenshareEvent(userId, 'stop');
      } else {
        await startScreenShare();
        studySession.recordScreenshareEvent(userId, 'start');
      }
    } catch (err) {
      logger.error('Error toggling screen share', err as Error);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Error state
  if (error) {
    return (
      <ComponentErrorBoundary>
        <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-8 text-center max-w-md'>
            <div className='text-6xl mb-4'>⚠️</div>
            <h3 className='text-lg font-semibold mb-2 text-red-600'>Call Error</h3>
            <p className='text-neutral-600 mb-4'>{error}</p>
            <button
              onClick={onEndCall}
              className='bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors'
            >
              Close
            </button>
          </div>
        </div>
      </ComponentErrorBoundary>
    );
  }

  // Loading state - Stable connecting interface
  if (isConnecting) {
    return (
      <div className='fixed inset-0 bg-black flex items-center justify-center z-50'>
        <div className='text-center text-white max-w-md mx-auto px-6'>
          <div className='w-24 h-24 mx-auto mb-6 bg-primary-500 rounded-full flex items-center justify-center'>
            <Users className='h-12 w-12 text-white' />
          </div>
          <h2 className='text-2xl font-semibold mb-2'>Setting up call...</h2>
          <p className='text-gray-300 mb-6'>Preparing your {call.type.toLowerCase()} connection</p>
          <div className='flex justify-center items-center'>
            <div className='w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin'></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ComponentErrorBoundary>
      <div className={`fixed inset-0 bg-black flex flex-col z-50 ${isFullscreen ? 'bg-black' : ''} ${showTools && !isFullscreen ? 'pr-80' : ''} md:pr-0`}>
        {/* Call Header */}
        <div className='p-3 md:p-4 bg-black bg-opacity-70 text-white backdrop-blur-sm'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-2 md:space-x-4 flex-1 min-w-0'>
              <div className='flex-1 min-w-0'>
                <h3 className='font-medium flex items-center space-x-2 text-sm md:text-base truncate'>
                  <span className='truncate'>{call.type === 'VIDEO' ? 'Video Call' : 'Voice Call'}</span>
                  <Users className='h-4 w-4 flex-shrink-0' />
                  <span className='text-xs md:text-sm opacity-75 hidden sm:inline'>
                    {participants.length + 1} participant{participants.length !== 0 ? 's' : ''}
                  </span>
                </h3>
                <p className='text-xs md:text-sm opacity-75'>
                  {isConnected ? formatDuration(callDuration) : 'Connecting...'}
                </p>
              </div>
            </div>
            
            <div className='flex items-center space-x-1 md:space-x-2 flex-shrink-0'>
              <button
                onClick={toggleFullscreen}
                className='p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors hidden md:block'
                title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? <Minimize className='h-5 w-5' /> : <Maximize className='h-5 w-5' />}
              </button>
              
              <button
                onClick={() => setShowTools(!showTools)}
                className={`p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors ${
                  showTools ? 'bg-white bg-opacity-20' : ''
                }`}
                title='Study tools'
              >
                <PenTool className='h-4 w-4 md:h-5 md:w-5' />
              </button>
            </div>
          </div>
        </div>

        {/* Video Area */}
        <div className='flex-1 relative overflow-hidden'>
          {call.type === 'VIDEO' ? (
            <>
              {/* Main video area */}
              <div className='w-full h-full bg-neutral-900'>
                {participants.length > 0 ? (
                  // Show first participant as main video
                  <VideoElement 
                    stream={getParticipantStream(participants[0].id) || null}
                    className='w-full h-full'
                    placeholder={
                      <div className='text-center text-white'>
                        <div className='w-32 h-32 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4'>
                          <span className='text-3xl font-medium'>
                            {participants[0]?.name?.charAt(0) || 'P'}
                          </span>
                        </div>
                        <p className='text-xl'>{participants[0]?.name || 'Participant'}</p>
                        <div className='w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin mt-2'></div>
                      </div>
                    }
                  />
                ) : (
                  // No participants yet - show stable waiting state
                  <div className='w-full h-full flex items-center justify-center'>
                    <div className='text-center text-white'>
                      <div className='w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-xl'>
                        <Users className='h-16 w-16 text-white' />
                      </div>
                      <h2 className='text-2xl font-semibold mb-2'>Waiting for others to join...</h2>
                      <p className='text-gray-300 mb-4'>Share the meeting link to invite participants</p>
                      <div className='flex justify-center items-center'>
                        <div className='w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin'></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Local video (Picture-in-Picture) */}
              <div className='absolute top-2 right-2 md:top-4 md:right-4 w-32 h-24 md:w-48 md:h-36 bg-neutral-900 rounded-lg overflow-hidden border-2 border-white border-opacity-20 shadow-lg'>
                <VideoElement 
                  stream={localStream}
                  muted={true}
                  className='w-full h-full'
                  placeholder={
                    <div className='w-full h-full bg-neutral-800 flex items-center justify-center'>
                      <VideoOff className='h-4 w-4 md:h-8 md:w-8 text-neutral-400' />
                    </div>
                  }
                />
                
                {/* Video indicators */}
                <div className='absolute bottom-1 left-1 md:bottom-2 md:left-2 flex space-x-1'>
                  {!isAudioEnabled && (
                    <div className='bg-red-500 rounded-full p-0.5 md:p-1'>
                      <MicOff className='h-2 w-2 md:h-3 md:w-3 text-white' />
                    </div>
                  )}
                  {!isVideoEnabled && (
                    <div className='bg-red-500 rounded-full p-0.5 md:p-1'>
                      <VideoOff className='h-2 w-2 md:h-3 md:w-3 text-white' />
                    </div>
                  )}
                </div>
              </div>

              {/* Additional participants grid (for multiple participants) */}
              {participants.length > 1 && (
                <div className='absolute bottom-16 md:bottom-20 left-2 right-2 md:left-4 md:right-60 max-h-24 md:max-h-32'>
                  <div className='flex space-x-2 overflow-x-auto pb-2'>
                    {participants.slice(1).map((participant) => (
                      <div key={participant.id} className='flex-shrink-0 w-24 h-18 md:w-32 md:h-24 bg-neutral-800 rounded-lg overflow-hidden'>
                        <VideoElement 
                          stream={getParticipantStream(participant.id) || null}
                          className='w-full h-full'
                          placeholder={
                            <div className='w-full h-full bg-neutral-700 flex items-center justify-center'>
                              <span className='text-white text-xs md:text-sm font-medium'>
                                {participant.name?.charAt(0) || 'P'}
                              </span>
                            </div>
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Audio Call UI - Stable waiting interface */
            <div className='flex-1 flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800'>
              <div className='text-center text-white'>
                <div className='w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6'>
                  <Users className='h-16 w-16' />
                </div>
                <h3 className='text-2xl font-medium mb-2'>
                  {participants.length > 0 ? 'Audio Call' : 'Waiting for participants...'}
                </h3>
                <p className='text-primary-100 mb-4'>
                  {participants.length > 0 
                    ? `${participants.length + 1} participant${participants.length > 0 ? 's' : ''} in call`
                    : 'Connecting...'
                  }
                </p>
                
                {/* Participant list for audio call */}
                {participants.length > 0 && (
                  <div className='flex justify-center space-x-4 mt-6'>
                    {participants.map((participant) => (
                      <div key={participant.id} className='text-center'>
                        <div className='w-16 h-16 bg-white bg-opacity-30 rounded-full flex items-center justify-center mb-2'>
                          <span className='text-lg font-medium'>
                            {participant.name?.charAt(0) || 'P'}
                          </span>
                        </div>
                        <p className='text-sm opacity-90'>{participant.name || 'Participant'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Study Tools Sidebar */}
        {showTools && (
          <>
            {/* Mobile overlay */}
            <div 
              className='md:hidden fixed inset-0 bg-black bg-opacity-50 z-30'
              onClick={() => setShowTools(false)}
            />
            
            {/* Sidebar */}
            <div className='fixed md:absolute right-0 top-0 bottom-0 w-full max-w-sm md:w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-40 overflow-y-auto'>
            <div className='p-4 border-b bg-gradient-to-r from-primary-50 to-primary-100'>
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-semibold text-primary-800'>Study Tools</h3>
                <button
                  onClick={() => setShowTools(false)}
                  className='p-2 hover:bg-primary-200 rounded-lg transition-colors text-primary-600'
                  title='Close study tools'
                >
                  ×
                </button>
              </div>
              <p className='text-sm text-primary-600 mt-1'>Enhance your study session</p>
            </div>
            
            <div className='p-4 space-y-3'>
              {/* Active Study Tool Content */}
              {activeStudyTool === 'notes' && (
                <div className='bg-white border rounded-lg p-4 mb-4'>
                  <div className='flex items-center justify-between mb-3'>
                    <h4 className='font-medium text-neutral-800'>Study Notes</h4>
                    <button
                      onClick={() => setActiveStudyTool(null)}
                      className='text-neutral-400 hover:text-neutral-600'
                    >
                      ×
                    </button>
                  </div>
                  
                  {/* Note input */}
                  <div className='mb-3'>
                    <div className='flex space-x-2'>
                      <input
                        type='text'
                        value={studySession.currentNote}
                        onChange={(e) => studySession.setCurrentNote(e.target.value)}
                        placeholder='Add a study note...'
                        className='flex-1 text-sm border border-neutral-300 rounded px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && studySession.currentNote.trim()) {
                            studySession.addNote(studySession.currentNote);
                            studySession.setCurrentNote('');
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          if (studySession.currentNote.trim()) {
                            studySession.addNote(studySession.currentNote);
                            studySession.setCurrentNote('');
                          }
                        }}
                        disabled={!studySession.currentNote.trim()}
                        className='px-3 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed'
                      >
                        <Plus className='h-4 w-4' />
                      </button>
                    </div>
                  </div>

                  {/* Notes list */}
                  <div className='max-h-48 overflow-y-auto space-y-2'>
                    {studySession.sessionData.notes.length === 0 ? (
                      <p className='text-sm text-neutral-500 text-center py-4'>
                        No notes yet. Start taking notes to track your study session!
                      </p>
                    ) : (
                      studySession.sessionData.notes.map((note) => (
                        <div key={note.id} className='bg-neutral-50 rounded p-2 text-sm'>
                          <div className='flex items-center justify-between mb-1'>
                            <span className='text-xs text-neutral-500'>
                              {new Date(note.timestamp).toLocaleTimeString()}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              note.type === 'note' ? 'bg-blue-100 text-blue-700' :
                              note.type === 'highlight' ? 'bg-yellow-100 text-yellow-700' :
                              note.type === 'question' ? 'bg-red-100 text-red-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {note.type}
                            </span>
                          </div>
                          <p className='text-neutral-800'>{note.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Chat Tool */}
              <div className={`rounded-lg p-3 border transition-all ${
                activeStudyTool === 'chat' 
                  ? 'bg-blue-100 border-blue-300' 
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <button 
                  onClick={() => setActiveStudyTool(activeStudyTool === 'chat' ? null : 'chat')}
                  className='w-full flex items-center space-x-3 text-left hover:bg-blue-100 p-2 rounded-lg transition-colors'
                >
                  <MessageSquare className='h-5 w-5 text-blue-600 flex-shrink-0' />
                  <div className='flex-1'>
                    <span className='font-medium text-blue-800'>Live Chat</span>
                    <p className='text-xs text-blue-600 mt-1'>Send messages during the call</p>
                  </div>
                </button>
              </div>

              {/* Whiteboard Tool */}
              <div className={`rounded-lg p-3 border transition-all ${
                activeStudyTool === 'whiteboard' 
                  ? 'bg-green-100 border-green-300' 
                  : 'bg-green-50 border-green-200'
              }`}>
                <button 
                  onClick={() => setActiveStudyTool(activeStudyTool === 'whiteboard' ? null : 'whiteboard')}
                  className='w-full flex items-center space-x-3 text-left hover:bg-green-100 p-2 rounded-lg transition-colors'
                >
                  <PenTool className='h-5 w-5 text-green-600 flex-shrink-0' />
                  <div className='flex-1'>
                    <span className='font-medium text-green-800'>Collaborative Whiteboard</span>
                    <p className='text-xs text-green-600 mt-1'>Draw diagrams and solve problems together</p>
                  </div>
                </button>
              </div>

              {/* Shared Notes */}
              <div className={`rounded-lg p-3 border transition-all ${
                activeStudyTool === 'notes' 
                  ? 'bg-purple-100 border-purple-300' 
                  : 'bg-purple-50 border-purple-200'
              }`}>
                <button 
                  onClick={() => setActiveStudyTool(activeStudyTool === 'notes' ? null : 'notes')}
                  className='w-full flex items-center space-x-3 text-left hover:bg-purple-100 p-2 rounded-lg transition-colors'
                >
                  <FileText className='h-5 w-5 text-purple-600 flex-shrink-0' />
                  <div className='flex-1'>
                    <span className='font-medium text-purple-800'>Study Notes</span>
                    <p className='text-xs text-purple-600 mt-1'>
                      Take notes together ({studySession.sessionData.notes.length} notes)
                    </p>
                  </div>
                </button>
              </div>

              {/* Screen Share Status */}
              <div className={`rounded-lg p-3 border ${
                isScreenSharing 
                  ? 'bg-primary-50 border-primary-200' 
                  : 'bg-neutral-50 border-neutral-200'
              }`}>
                <div className='flex items-center space-x-3'>
                  <Monitor className={`h-5 w-5 flex-shrink-0 ${
                    isScreenSharing ? 'text-primary-600' : 'text-neutral-500'
                  }`} />
                  <div className='flex-1'>
                    <span className={`font-medium ${
                      isScreenSharing ? 'text-primary-800' : 'text-neutral-700'
                    }`}>
                      Screen Share
                    </span>
                    <p className={`text-xs mt-1 ${
                      isScreenSharing ? 'text-primary-600' : 'text-neutral-500'
                    }`}>
                      {isScreenSharing ? 'Currently sharing your screen' : 'Share your screen to show content'}
                    </p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    isScreenSharing ? 'bg-primary-500 animate-pulse' : 'bg-neutral-300'
                  }`} />
                </div>
              </div>
            </div>

            {/* Study Session Info */}
            <div className='border-t p-4 bg-neutral-50'>
              <h4 className='font-medium text-neutral-800 mb-3'>Session Info</h4>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-neutral-600'>Duration:</span>
                  <span className='font-medium text-neutral-800'>
                    {studySession.formatDuration(studySession.sessionData.duration)}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-neutral-600'>Participants:</span>
                  <span className='font-medium text-neutral-800'>
                    {studySession.sessionData.participants.length}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-neutral-600'>Notes:</span>
                  <span className='font-medium text-neutral-800'>
                    {studySession.sessionData.notes.length}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-neutral-600'>Connection:</span>
                  <span className={`font-medium ${
                    isConnected ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {isConnected ? 'Stable' : 'Connecting...'}
                  </span>
                </div>
              </div>
              
              {/* Quick actions */}
              <div className='mt-4 pt-3 border-t'>
                <button
                  onClick={() => {
                    const summary = studySession.getSessionSummary();
                    logger.info('Study session summary', summary);
                    // In a real app, could show a modal with session summary
                  }}
                  className='w-full text-xs bg-primary-50 hover:bg-primary-100 text-primary-700 py-2 rounded-lg transition-colors'
                >
                  View Session Summary
                </button>
              </div>
            </div>
            </div>
          </>
        )}

        {/* Call Controls */}
        <div className='p-4 md:p-6 bg-black bg-opacity-70 backdrop-blur-sm'>
          <div className='flex items-center justify-center space-x-2 md:space-x-4'>
            {/* Video controls */}
            {call.type === 'VIDEO' && (
              <>
                <button
                  onClick={toggleVideo}
                  className={`p-3 md:p-4 rounded-full transition-all transform active:scale-95 md:hover:scale-105 ${
                    isVideoEnabled
                      ? 'bg-neutral-700 hover:bg-neutral-600 text-white shadow-lg'
                      : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25'
                  }`}
                  title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
                >
                  {isVideoEnabled ? (
                    <Video className='h-5 w-5 md:h-6 md:w-6' />
                  ) : (
                    <VideoOff className='h-5 w-5 md:h-6 md:w-6' />
                  )}
                </button>

                <button
                  onClick={handleToggleScreenShare}
                  className={`p-3 md:p-4 rounded-full transition-all transform active:scale-95 md:hover:scale-105 hidden sm:block ${
                    isScreenSharing
                      ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                      : 'bg-neutral-700 hover:bg-neutral-600 text-white shadow-lg'
                  }`}
                  title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
                >
                  {isScreenSharing ? (
                    <MonitorOff className='h-5 w-5 md:h-6 md:w-6' />
                  ) : (
                    <Monitor className='h-5 w-5 md:h-6 md:w-6' />
                  )}
                </button>
              </>
            )}

            {/* Audio control */}
            <button
              onClick={toggleAudio}
              className={`p-3 md:p-4 rounded-full transition-all transform active:scale-95 md:hover:scale-105 ${
                isAudioEnabled
                  ? 'bg-neutral-700 hover:bg-neutral-600 text-white shadow-lg'
                  : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25'
              }`}
              title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
            >
              {isAudioEnabled ? (
                <Mic className='h-5 w-5 md:h-6 md:w-6' />
              ) : (
                <MicOff className='h-5 w-5 md:h-6 md:w-6' />
              )}
            </button>

            {/* End call */}
            <button
              onClick={handleEndCall}
              className='p-3 md:p-4 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all transform active:scale-95 md:hover:scale-105 shadow-lg shadow-red-500/25'
              title='End call'
            >
              <PhoneOff className='h-5 w-5 md:h-6 md:w-6' />
            </button>

            {/* Settings - hidden on mobile */}
            <button
              className='p-3 md:p-4 bg-neutral-700 hover:bg-neutral-600 text-white rounded-full transition-all transform active:scale-95 md:hover:scale-105 shadow-lg hidden sm:block'
              title='Call settings'
            >
              <Settings className='h-5 w-5 md:h-6 md:w-6' />
            </button>
          </div>
          
          {/* Connection status indicator */}
          <div className='flex items-center justify-center mt-3 md:mt-4'>
            <div className={`flex items-center space-x-2 text-xs md:text-sm ${
              isConnected ? 'text-green-400' : 'text-yellow-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'
              }`} />
              <span>{isConnected ? 'Connected' : 'Connecting...'}</span>
            </div>
          </div>
        </div>

        {/* Safari Permissions Guide */}
        {showSafariGuide && (
          <SafariPermissionsGuide 
            onPermissionsGranted={() => {
              setShowSafariGuide(false);
              // Retry starting the call after permissions are granted
              setTimeout(() => {
                startCall(true).catch(err => {
                  logger.error('Failed to restart call after Safari permissions granted', err);
                });
              }, 500);
            }}
            onRetry={() => {
              setShowSafariGuide(false);
              // Retry starting the call
              setTimeout(() => {
                startCall(true).catch(err => {
                  logger.error('Failed to retry call from Safari guide', err);
                  // If still failing, show the guide again
                  if (err.message.includes('Permission denied') || err.message.includes('NotAllowedError')) {
                    setShowSafariGuide(true);
                  } else {
                    onError?.(err);
                  }
                });
              }, 500);
            }}
          />
        )}
      </div>
    </ComponentErrorBoundary>
  );
}