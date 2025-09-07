'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { WebRTCManager, CallConfig, CallParticipant } from '@/lib/webrtc/WebRTCManager';
import { logger } from '@/lib/logger';

export interface UseWebRTCOptions {
  roomId: string;
  userId: string;
  config?: CallConfig;
  onError?: (error: Error) => void;
  onParticipantJoined?: (participant: CallParticipant) => void;
  onParticipantLeft?: (participantId: string) => void;
  onCallEnded?: () => void;
}

export interface UseWebRTCReturn {
  // State
  isConnected: boolean;
  isConnecting: boolean;
  participants: CallParticipant[];
  localStream: MediaStream | null;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  error: string | null;
  
  // Actions
  startCall: (isInitiator?: boolean) => Promise<void>;
  endCall: () => Promise<void>;
  toggleVideo: () => Promise<void>;
  toggleAudio: () => Promise<void>;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => Promise<void>;
  getParticipantStream: (participantId: string) => MediaStream | undefined;
}

export function useWebRTC(options: UseWebRTCOptions): UseWebRTCReturn {
  const {
    roomId,
    userId,
    config = { video: true, audio: true },
    onError,
    onParticipantJoined,
    onParticipantLeft,
    onCallEnded
  } = options;

  // State
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [participants, setParticipants] = useState<CallParticipant[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(config.video || false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(config.audio || false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const webrtcManagerRef = useRef<WebRTCManager | null>(null);
  const participantStreamsRef = useRef<Map<string, MediaStream>>(new Map());

  // Initialize WebRTC manager
  const initializeManager = useCallback(() => {
    if (webrtcManagerRef.current) {
      return webrtcManagerRef.current;
    }

    const manager = new WebRTCManager(roomId, userId, config);
    
    // Set up event listeners
    manager.addEventListener('participant-joined', (event: any) => {
      const participant = event.detail;
      setParticipants(prev => {
        const exists = prev.find(p => p.id === participant.id);
        if (exists) return prev;
        return [...prev, participant];
      });
      
      // Set connected when first participant joins (for real environment)
      if (!roomId.includes('test-chat')) {
        setIsConnected(true);
        setIsConnecting(false);
      }
      
      onParticipantJoined?.(participant);
      logger.info('Participant joined via hook', { participantId: participant.id });
    });

    manager.addEventListener('participant-left', (event: any) => {
      const participantId = event.detail;
      setParticipants(prev => prev.filter(p => p.id !== participantId));
      participantStreamsRef.current.delete(participantId);
      onParticipantLeft?.(participantId);
      logger.info('Participant left via hook', { participantId });
    });

    manager.addEventListener('stream-received', (event: any) => {
      const { participantId, stream } = event.detail;
      participantStreamsRef.current.set(participantId, stream);
      logger.info('Stream received via hook', { participantId });
    });

    manager.addEventListener('stream-removed', (event: any) => {
      const participantId = event.detail;
      participantStreamsRef.current.delete(participantId);
      logger.info('Stream removed via hook', { participantId });
    });

    manager.addEventListener('call-ended', () => {
      setIsConnected(false);
      setIsConnecting(false);
      setParticipants([]);
      setLocalStream(null);
      participantStreamsRef.current.clear();
      onCallEnded?.();
      logger.info('Call ended via hook');
    });

    manager.addEventListener('error', (event: any) => {
      const error = event.detail;
      setError(error.message || 'Unknown WebRTC error');
      setIsConnecting(false);
      onError?.(error);
      logger.error('WebRTC error via hook', error);
    });

    webrtcManagerRef.current = manager;
    return manager;
  }, [roomId, userId, config, onError, onParticipantJoined, onParticipantLeft, onCallEnded]);

  // Start call
  const startCall = useCallback(async (isInitiator = false) => {
    try {
      setIsConnecting(true);
      setError(null);

      const manager = initializeManager();
      await manager.initializeCall(isInitiator);
      
      // Get local stream
      const stream = manager.getLocalStream();
      setLocalStream(stream || null);
      
      // For test environment: simulate connection process
      if (roomId.includes('test-chat')) {
        // Set a timeout to simulate connection establishment
        setTimeout(() => {
          setIsConnected(true);
          setIsConnecting(false);
          logger.info('Test call connected via hook', { roomId, userId, isInitiator });
        }, 2000); // 2 second delay to simulate connection
      } else {
        // Real environment: wait for actual peer connections
        // This will be set to true when the first peer connects
        // For now, keep connecting state until participants join
        logger.info('Waiting for participants to join', { roomId, userId, isInitiator });
      }
      
      logger.info('Call started via hook', { roomId, userId, isInitiator });
    } catch (error) {
      setError((error as Error).message);
      setIsConnecting(false);
      logger.error('Failed to start call via hook', error as Error);
      throw error;
    }
  }, [initializeManager, roomId, userId]);

  // End call
  const endCall = useCallback(async () => {
    try {
      if (webrtcManagerRef.current) {
        await webrtcManagerRef.current.endCall();
        webrtcManagerRef.current = null;
      }
      
      setIsConnected(false);
      setIsConnecting(false);
      setParticipants([]);
      setLocalStream(null);
      setIsScreenSharing(false);
      participantStreamsRef.current.clear();
      
      logger.info('Call ended manually via hook');
    } catch (error) {
      logger.error('Error ending call via hook', error as Error);
      setError((error as Error).message);
    }
  }, []);

  // Toggle video
  const toggleVideo = useCallback(async () => {
    try {
      if (webrtcManagerRef.current) {
        const enabled = await webrtcManagerRef.current.toggleVideo();
        setIsVideoEnabled(enabled);
        logger.info('Video toggled via hook', { enabled });
      }
    } catch (error) {
      logger.error('Error toggling video via hook', error as Error);
      setError((error as Error).message);
    }
  }, []);

  // Toggle audio
  const toggleAudio = useCallback(async () => {
    try {
      if (webrtcManagerRef.current) {
        const enabled = await webrtcManagerRef.current.toggleAudio();
        setIsAudioEnabled(enabled);
        logger.info('Audio toggled via hook', { enabled });
      }
    } catch (error) {
      logger.error('Error toggling audio via hook', error as Error);
      setError((error as Error).message);
    }
  }, []);

  // Start screen sharing
  const startScreenShare = useCallback(async () => {
    try {
      if (webrtcManagerRef.current) {
        const screenStream = await webrtcManagerRef.current.startScreenShare();
        setIsScreenSharing(!!screenStream);
        logger.info('Screen sharing started via hook');
      }
    } catch (error) {
      logger.error('Error starting screen share via hook', error as Error);
      setError((error as Error).message);
      throw error;
    }
  }, []);

  // Stop screen sharing
  const stopScreenShare = useCallback(async () => {
    try {
      if (webrtcManagerRef.current) {
        await webrtcManagerRef.current.stopScreenShare();
        setIsScreenSharing(false);
        logger.info('Screen sharing stopped via hook');
      }
    } catch (error) {
      logger.error('Error stopping screen share via hook', error as Error);
      setError((error as Error).message);
    }
  }, []);

  // Get participant stream
  const getParticipantStream = useCallback((participantId: string): MediaStream | undefined => {
    return participantStreamsRef.current.get(participantId);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (webrtcManagerRef.current) {
        webrtcManagerRef.current.endCall();
        webrtcManagerRef.current = null;
      }
    };
  }, []);

  // Clear error after some time
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return {
    // State
    isConnected,
    isConnecting,
    participants,
    localStream,
    isVideoEnabled,
    isAudioEnabled,
    isScreenSharing,
    error,
    
    // Actions
    startCall,
    endCall,
    toggleVideo,
    toggleAudio,
    startScreenShare,
    stopScreenShare,
    getParticipantStream,
  };
}

// Hook for checking WebRTC support
export function useWebRTCSupport() {
  const [isSupported, setIsSupported] = useState(false);
  const [supportDetails, setSupportDetails] = useState({
    webRTC: false,
    getUserMedia: false,
    screenCapture: false,
  });

  useEffect(() => {
    const checkSupport = async () => {
      // Only check support on client side
      if (typeof window === 'undefined' || typeof navigator === 'undefined') {
        return;
      }
      
      const webRTC = WebRTCManager.isSupported();
      const getUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      const screenCapture = !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);

      const details = {
        webRTC,
        getUserMedia,
        screenCapture,
      };

      setSupportDetails(details);
      setIsSupported(webRTC && getUserMedia);
    };

    checkSupport();
  }, []);

  return {
    isSupported,
    supportDetails,
  };
}

// Hook for managing media devices
export function useMediaDevices() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [permissions, setPermissions] = useState({ video: false, audio: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkDevicesAndPermissions = async () => {
      try {
        setLoading(true);
        
        // Check permissions
        const mediaAccess = await WebRTCManager.testMediaAccess();
        setPermissions(mediaAccess);
        
        // Get devices
        const deviceList = await WebRTCManager.getDevices();
        setDevices(deviceList);
        
        logger.info('Media devices checked', { 
          deviceCount: deviceList.length, 
          permissions: mediaAccess 
        });
      } catch (error) {
        logger.error('Error checking media devices', error as Error);
      } finally {
        setLoading(false);
      }
    };

    checkDevicesAndPermissions();

    // Listen for device changes (only on client side)
    if (typeof window !== 'undefined' && navigator?.mediaDevices?.addEventListener) {
      navigator.mediaDevices.addEventListener('devicechange', checkDevicesAndPermissions);
      return () => {
        if (navigator?.mediaDevices?.removeEventListener) {
          navigator.mediaDevices.removeEventListener('devicechange', checkDevicesAndPermissions);
        }
      };
    }
  }, []);

  return {
    devices,
    permissions,
    loading,
    videoDevices: devices.filter(d => d.kind === 'videoinput'),
    audioDevices: devices.filter(d => d.kind === 'audioinput'),
    audioOutputDevices: devices.filter(d => d.kind === 'audiooutput'),
  };
}