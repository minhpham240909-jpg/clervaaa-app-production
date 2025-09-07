'use client';

import SimplePeer from 'simple-peer';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export interface CallConfig {
  video: boolean;
  audio: boolean;
  screen?: boolean;
  constraints?: MediaStreamConstraints;
}

export interface CallParticipant {
  id: string;
  name: string;
  image?: string;
  peer?: SimplePeer.Instance;
  stream?: MediaStream;
  isMuted?: boolean;
  isVideoOff?: boolean;
}

export interface CallEvents {
  'participant-joined': (participant: CallParticipant) => void;
  'participant-left': (participantId: string) => void;
  'stream-received': (participantId: string, stream: MediaStream) => void;
  'stream-removed': (participantId: string) => void;
  'call-ended': () => void;
  'error': (error: Error) => void;
  'connection-state-changed': (state: string) => void;
  'data-received': (participantId: string, data: any) => void;
}

export class WebRTCManager extends EventTarget {
  private roomId: string;
  private userId: string;
  private participants = new Map<string, CallParticipant>();
  private localStream?: MediaStream;
  private screenStream?: MediaStream;
  private config: CallConfig;
  private isInitiator = false;
  private realtimeChannel?: any;
  
  // ICE servers for better connectivity (Safari-compatible)
  private iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' },
    // Safari-friendly STUN servers
    { urls: 'stun:stun.services.mozilla.com' },
    { urls: 'stun:stun.cloudflare.com:3478' }
  ];

  constructor(roomId: string, userId: string, config: CallConfig = { video: true, audio: true }) {
    super();
    this.roomId = roomId;
    this.userId = userId;
    this.config = config;
  }

  // Initialize the call
  async initializeCall(isInitiator = false): Promise<void> {
    try {
      this.isInitiator = isInitiator;
      
      // Get user media
      await this.getUserMedia();
      
      // Set up Supabase real-time signaling
      await this.setupSignaling();
      
      logger.info('WebRTC Manager initialized', { 
        roomId: this.roomId, 
        userId: this.userId,
        isInitiator: this.isInitiator 
      });
    } catch (error) {
      logger.error('Failed to initialize WebRTC', error as Error);
      this.dispatchEvent(new CustomEvent('error', { detail: error }));
      throw error;
    }
  }

  // Get user media (camera/microphone) - Safari optimized
  private async getUserMedia(): Promise<void> {
    try {
      // Safari-compatible constraints with fallbacks
      const constraints: MediaStreamConstraints = {
        video: this.config.video ? {
          width: { ideal: 1280, max: 1920, min: 640 },
          height: { ideal: 720, max: 1080, min: 480 },
          frameRate: { ideal: 30, max: 30 },
          facingMode: 'user'
        } : false,
        audio: this.config.audio ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: { ideal: 48000 }
        } : false,
        ...this.config.constraints
      };

      // Try with full constraints first
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (detailedError) {
        logger.warn('Detailed constraints failed, trying basic constraints', detailedError);
        
        // Fallback to basic constraints for Safari
        const basicConstraints: MediaStreamConstraints = {
          video: this.config.video,
          audio: this.config.audio
        };
        
        this.localStream = await navigator.mediaDevices.getUserMedia(basicConstraints);
      }
      
      logger.info('Got user media', { 
        hasVideo: this.localStream.getVideoTracks().length > 0,
        hasAudio: this.localStream.getAudioTracks().length > 0,
        browser: this.detectBrowser()
      });
    } catch (error) {
      logger.error('Failed to get user media', error as Error);
      
      // Safari-specific error messages
      const errorMessage = this.getSafariErrorMessage(error as Error);
      throw new Error(errorMessage);
    }
  }

  // Detect browser for Safari-specific handling
  private detectBrowser(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      return 'Safari';
    } else if (userAgent.includes('Chrome')) {
      return 'Chrome';
    } else if (userAgent.includes('Firefox')) {
      return 'Firefox';
    }
    return 'Unknown';
  }

  // Get Safari-friendly error messages
  private getSafariErrorMessage(error: Error): string {
    const isSafari = this.detectBrowser() === 'Safari';
    
    if (error.name === 'NotAllowedError') {
      return isSafari 
        ? 'Camera/microphone access denied. Please enable permissions in Safari Settings → Websites → Camera/Microphone'
        : 'Camera/microphone access denied. Please check permissions.';
    } else if (error.name === 'NotFoundError') {
      return 'No camera or microphone found. Please connect a device and try again.';
    } else if (error.name === 'NotReadableError') {
      return isSafari
        ? 'Camera/microphone is busy. Close other apps using these devices and try again.'
        : 'Device is busy or not available.';
    } else if (error.name === 'ConstraintNotSatisfiedError') {
      return 'Camera/microphone settings not supported. Trying with basic settings...';
    }
    
    return `Camera/microphone error: ${error.message}`;
  }

  // Set up Supabase real-time signaling
  private async setupSignaling(): Promise<void> {
    try {
      this.realtimeChannel = supabase.channel(`call:${this.roomId}`)
        .on('broadcast', { event: 'signal' }, (payload) => {
          this.handleSignal(payload.payload);
        })
        .on('broadcast', { event: 'user-joined' }, (payload) => {
          this.handleUserJoined(payload.payload);
        })
        .on('broadcast', { event: 'user-left' }, (payload) => {
          this.handleUserLeft(payload.payload);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            // Announce presence
            await this.announcePresence();
          }
        });

      logger.info('Signaling channel set up', { roomId: this.roomId });
    } catch (error) {
      logger.error('Failed to set up signaling', error as Error);
      throw error;
    }
  }

  // Announce user presence to other participants
  private async announcePresence(): Promise<void> {
    try {
      await this.realtimeChannel.send({
        type: 'broadcast',
        event: 'user-joined',
        payload: {
          userId: this.userId,
          roomId: this.roomId,
          timestamp: Date.now()
        }
      });
      
      logger.info('Announced presence', { userId: this.userId, roomId: this.roomId });
    } catch (error) {
      logger.error('Failed to announce presence', error as Error);
    }
  }

  // Handle when a user joins
  private async handleUserJoined(payload: any): Promise<void> {
    const { userId, roomId } = payload;
    
    if (userId === this.userId || roomId !== this.roomId) return;
    
    logger.info('User joined', { userId, roomId });
    
    // Create peer connection for new participant
    await this.createPeerConnection(userId, this.isInitiator);
  }

  // Handle when a user leaves
  private handleUserLeft(payload: any): Promise<void> {
    const { userId } = payload;
    
    if (userId === this.userId) return Promise.resolve();
    
    logger.info('User left', { userId });
    
    this.removeParticipant(userId);
    return Promise.resolve();
  }

  // Create peer connection for a participant
  private async createPeerConnection(participantId: string, initiator: boolean): Promise<void> {
    try {
      const peer = new SimplePeer({
        initiator,
        trickle: true,
        config: {
          iceServers: this.iceServers,
          iceCandidatePoolSize: 10,
        },
        stream: this.localStream,
      });

      const participant: CallParticipant = {
        id: participantId,
        name: `User ${participantId.slice(0, 8)}`,
        peer,
        isMuted: false,
        isVideoOff: false,
      };

      this.participants.set(participantId, participant);

      // Set up peer event handlers
      peer.on('signal', async (signal) => {
        await this.sendSignal(participantId, signal);
      });

      peer.on('stream', (stream) => {
        participant.stream = stream;
        this.dispatchEvent(new CustomEvent('stream-received', { 
          detail: { participantId, stream } 
        }));
        logger.info('Received stream from participant', { participantId });
      });

      peer.on('connect', () => {
        logger.info('Peer connected', { participantId });
        this.dispatchEvent(new CustomEvent('participant-joined', { 
          detail: participant 
        }));
      });

      peer.on('close', () => {
        logger.info('Peer connection closed', { participantId });
        this.removeParticipant(participantId);
      });

      peer.on('error', (error) => {
        logger.error('Peer connection error', error, { participantId });
        this.removeParticipant(participantId);
      });

      peer.on('data', (data) => {
        try {
          const parsedData = JSON.parse(data.toString());
          this.dispatchEvent(new CustomEvent('data-received', { 
            detail: { participantId, data: parsedData } 
          }));
        } catch (error) {
          logger.warn('Failed to parse peer data', error as Error);
        }
      });

      logger.info('Created peer connection', { participantId, initiator });
    } catch (error) {
      logger.error('Failed to create peer connection', error as Error, { participantId });
      throw error;
    }
  }

  // Send signaling data to a specific participant
  private async sendSignal(targetUserId: string, signal: any): Promise<void> {
    try {
      await this.realtimeChannel.send({
        type: 'broadcast',
        event: 'signal',
        payload: {
          from: this.userId,
          to: targetUserId,
          signal,
          roomId: this.roomId,
          timestamp: Date.now()
        }
      });
    } catch (error) {
      logger.error('Failed to send signal', error as Error);
    }
  }

  // Handle incoming signals
  private handleSignal(payload: any): void {
    const { from, to, signal } = payload;
    
    if (to !== this.userId || from === this.userId) return;
    
    const participant = this.participants.get(from);
    if (participant?.peer) {
      try {
        participant.peer.signal(signal);
        logger.debug('Processed signal from participant', { from });
      } catch (error) {
        logger.error('Failed to process signal', error as Error, { from });
      }
    } else {
      // Create peer connection if it doesn't exist
      this.createPeerConnection(from, false);
      
      // Process signal after a short delay to allow peer creation
      setTimeout(() => {
        const newParticipant = this.participants.get(from);
        if (newParticipant?.peer) {
          try {
            newParticipant.peer.signal(signal);
          } catch (error) {
            logger.error('Failed to process delayed signal', error as Error, { from });
          }
        }
      }, 100);
    }
  }

  // Toggle local video
  async toggleVideo(): Promise<boolean> {
    if (!this.localStream) return false;

    const videoTracks = this.localStream.getVideoTracks();
    if (videoTracks.length > 0) {
      videoTracks[0].enabled = !videoTracks[0].enabled;
      
      // Notify other participants about video state change
      this.broadcastToAll({
        type: 'video-toggle',
        enabled: videoTracks[0].enabled,
        userId: this.userId
      });

      logger.info('Toggled video', { enabled: videoTracks[0].enabled });
      return videoTracks[0].enabled;
    }

    return false;
  }

  // Toggle local audio
  async toggleAudio(): Promise<boolean> {
    if (!this.localStream) return false;

    const audioTracks = this.localStream.getAudioTracks();
    if (audioTracks.length > 0) {
      audioTracks[0].enabled = !audioTracks[0].enabled;
      
      // Notify other participants about audio state change
      this.broadcastToAll({
        type: 'audio-toggle',
        enabled: audioTracks[0].enabled,
        userId: this.userId
      });

      logger.info('Toggled audio', { enabled: audioTracks[0].enabled });
      return audioTracks[0].enabled;
    }

    return false;
  }

  // Start screen sharing
  async startScreenShare(): Promise<MediaStream | null> {
    try {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      // Replace video track in all peer connections
      if (this.screenStream.getVideoTracks().length > 0) {
        const videoTrack = this.screenStream.getVideoTracks()[0];
        
        for (const participant of this.participants.values()) {
          if (participant.peer) {
            try {
              participant.peer.replaceTrack(
                participant.peer.streams[0]?.getVideoTracks()[0],
                videoTrack,
                participant.peer.streams[0] || this.localStream!
              );
            } catch (error) {
              logger.warn('Failed to replace track for screen share', error as Error);
            }
          }
        }

        // Handle screen share ending
        videoTrack.onended = () => {
          this.stopScreenShare();
        };
      }

      logger.info('Started screen sharing');
      return this.screenStream;
    } catch (error) {
      logger.error('Failed to start screen sharing', error as Error);
      throw new Error('Screen sharing not available or denied');
    }
  }

  // Stop screen sharing
  async stopScreenShare(): Promise<void> {
    if (!this.screenStream) return;

    // Stop all screen share tracks
    this.screenStream.getTracks().forEach(track => track.stop());
    
    // Replace back to camera if available
    if (this.localStream && this.localStream.getVideoTracks().length > 0) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      
      for (const participant of this.participants.values()) {
        if (participant.peer) {
          try {
            participant.peer.replaceTrack(
              participant.peer.streams[0]?.getVideoTracks()[0],
              videoTrack,
              participant.peer.streams[0] || this.localStream
            );
          } catch (error) {
            logger.warn('Failed to replace track after screen share', error as Error);
          }
        }
      }
    }

    this.screenStream = undefined;
    logger.info('Stopped screen sharing');
  }

  // Send data to all participants
  private broadcastToAll(data: any): void {
    const message = JSON.stringify(data);
    for (const participant of this.participants.values()) {
      if (participant.peer && participant.peer.connected) {
        try {
          participant.peer.send(message);
        } catch (error) {
          logger.warn('Failed to send data to participant', error as Error);
        }
      }
    }
  }

  // Remove a participant
  private removeParticipant(participantId: string): void {
    const participant = this.participants.get(participantId);
    if (participant) {
      // Close peer connection
      if (participant.peer) {
        participant.peer.destroy();
      }
      
      // Stop participant streams
      if (participant.stream) {
        participant.stream.getTracks().forEach(track => track.stop());
      }

      this.participants.delete(participantId);
      
      this.dispatchEvent(new CustomEvent('participant-left', { 
        detail: participantId 
      }));
      
      logger.info('Removed participant', { participantId });
    }
  }

  // Get local stream for UI
  getLocalStream(): MediaStream | undefined {
    return this.localStream;
  }

  // Get participant stream for UI
  getParticipantStream(participantId: string): MediaStream | undefined {
    return this.participants.get(participantId)?.stream;
  }

  // Get all participants
  getParticipants(): CallParticipant[] {
    return Array.from(this.participants.values());
  }

  // End the call
  async endCall(): Promise<void> {
    try {
      // Notify other participants that we're leaving
      await this.realtimeChannel.send({
        type: 'broadcast',
        event: 'user-left',
        payload: {
          userId: this.userId,
          roomId: this.roomId,
          timestamp: Date.now()
        }
      });

      // Clean up all participants
      for (const participantId of this.participants.keys()) {
        this.removeParticipant(participantId);
      }

      // Stop local streams
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
        this.localStream = undefined;
      }

      if (this.screenStream) {
        this.screenStream.getTracks().forEach(track => track.stop());
        this.screenStream = undefined;
      }

      // Unsubscribe from real-time channel
      if (this.realtimeChannel) {
        await supabase.removeChannel(this.realtimeChannel);
        this.realtimeChannel = undefined;
      }

      this.dispatchEvent(new CustomEvent('call-ended'));
      
      logger.info('Call ended', { roomId: this.roomId, userId: this.userId });
    } catch (error) {
      logger.error('Error ending call', error as Error);
    }
  }

  // Check if WebRTC is supported
  static isSupported(): boolean {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return false;
    }
    return !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      window.RTCPeerConnection &&
      window.RTCSessionDescription &&
      window.RTCIceCandidate
    );
  }

  // Get device list
  static async getDevices(): Promise<MediaDeviceInfo[]> {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return [];
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices;
    } catch (error) {
      logger.error('Failed to get devices', error as Error);
      return [];
    }
  }

  // Test camera and microphone access
  static async testMediaAccess(): Promise<{ video: boolean; audio: boolean }> {
    const result = { video: false, audio: false };

    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return result;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      result.video = stream.getVideoTracks().length > 0;
      result.audio = stream.getAudioTracks().length > 0;
      
      // Stop test stream
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      logger.warn('Media access test failed', error as Error);
    }

    return result;
  }
}