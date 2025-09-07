import { logger } from '@/lib/logger'

export interface WebRTCConfig {
  iceServers: RTCIceServer[]
  audio: boolean
  video: boolean | MediaTrackConstraints
}

export interface CallParticipant {
  id: string
  name: string
  stream?: MediaStream
  connection?: RTCPeerConnection
}

export interface CallStats {
  duration: number
  quality: 'excellent' | 'good' | 'poor'
  bitrate: number
  packetsLost: number
  jitter: number
}

export class EnhancedWebRTCService {
  private localStream: MediaStream | null = null
  private participants: Map<string, CallParticipant> = new Map()
  private config: WebRTCConfig
  private isInitialized = false
  private statsInterval: NodeJS.Timeout | null = null
  private onRemoteStreamCallback?: (participantId: string, stream: MediaStream) => void
  private onStatsUpdateCallback?: (stats: CallStats) => void
  private onConnectionStateCallback?: (participantId: string, state: RTCPeerConnectionState) => void

  constructor(config: Partial<WebRTCConfig> = {}) {
    this.config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ],
      audio: true,
      video: true,
      ...config
    }
  }

  /**
   * Initialize WebRTC service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      await this.getUserMedia()
      this.isInitialized = true
      logger.info('WebRTC service initialized')
    } catch (error) {
      logger.error('Failed to initialize WebRTC service', error as Error)
      throw error
    }
  }

  /**
   * Get user media (camera and microphone)
   */
  private async getUserMedia(): Promise<void> {
    try {
      const constraints: MediaStreamConstraints = {
        audio: this.config.audio,
        video: this.config.video
      }

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints)
      logger.info('Local media stream acquired', {
        audioTracks: this.localStream.getAudioTracks().length,
        videoTracks: this.localStream.getVideoTracks().length
      })
    } catch (error) {
      logger.error('Failed to get user media', error as Error)
      throw new Error('Camera/microphone access denied')
    }
  }

  /**
   * Create peer connection for a participant
   */
  async createPeerConnection(participantId: string, participantName: string): Promise<RTCPeerConnection> {
    const participant: CallParticipant = {
      id: participantId,
      name: participantName
    }

    const peerConnection = new RTCPeerConnection({
      iceServers: this.config.iceServers
    })

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream!)
      })
    }

    // Handle incoming remote stream
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams
      participant.stream = remoteStream
      this.onRemoteStreamCallback?.(participantId, remoteStream)
      logger.info('Remote stream received', { participantId })
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // In a real implementation, send this to the signaling server
        logger.info('ICE candidate generated', { participantId })
      }
    }

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      const state = peerConnection.connectionState
      logger.info('Connection state changed', { participantId, state })
      this.onConnectionStateCallback?.(participantId, state)
      
      if (state === 'connected') {
        this.startStatsCollection(peerConnection)
      } else if (state === 'disconnected' || state === 'failed') {
        this.stopStatsCollection()
      }
    }

    participant.connection = peerConnection
    this.participants.set(participantId, participant)

    return peerConnection
  }

  /**
   * Create and send offer
   */
  async createOffer(participantId: string): Promise<RTCSessionDescriptionInit> {
    const participant = this.participants.get(participantId)
    if (!participant?.connection) {
      throw new Error('Peer connection not found')
    }

    try {
      const offer = await participant.connection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: this.config.video !== false
      })

      await participant.connection.setLocalDescription(offer)
      logger.info('Offer created and set', { participantId })
      
      return offer
    } catch (error) {
      logger.error('Failed to create offer', error as Error, { participantId })
      throw error
    }
  }

  /**
   * Handle received offer
   */
  async handleOffer(participantId: string, offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    const participant = this.participants.get(participantId)
    if (!participant?.connection) {
      throw new Error('Peer connection not found')
    }

    try {
      await participant.connection.setRemoteDescription(offer)
      
      const answer = await participant.connection.createAnswer()
      await participant.connection.setLocalDescription(answer)
      
      logger.info('Offer handled and answer created', { participantId })
      return answer
    } catch (error) {
      logger.error('Failed to handle offer', error as Error, { participantId })
      throw error
    }
  }

  /**
   * Handle received answer
   */
  async handleAnswer(participantId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    const participant = this.participants.get(participantId)
    if (!participant?.connection) {
      throw new Error('Peer connection not found')
    }

    try {
      await participant.connection.setRemoteDescription(answer)
      logger.info('Answer handled', { participantId })
    } catch (error) {
      logger.error('Failed to handle answer', error as Error, { participantId })
      throw error
    }
  }

  /**
   * Handle ICE candidate
   */
  async handleIceCandidate(participantId: string, candidate: RTCIceCandidateInit): Promise<void> {
    const participant = this.participants.get(participantId)
    if (!participant?.connection) {
      throw new Error('Peer connection not found')
    }

    try {
      await participant.connection.addIceCandidate(candidate)
      logger.info('ICE candidate added', { participantId })
    } catch (error) {
      logger.error('Failed to add ICE candidate', error as Error, { participantId })
      throw error
    }
  }

  /**
   * Toggle local audio
   */
  toggleAudio(enabled: boolean): void {
    if (!this.localStream) return

    this.localStream.getAudioTracks().forEach(track => {
      track.enabled = enabled
    })

    logger.info('Audio toggled', { enabled })
  }

  /**
   * Toggle local video
   */
  toggleVideo(enabled: boolean): void {
    if (!this.localStream) return

    this.localStream.getVideoTracks().forEach(track => {
      track.enabled = enabled
    })

    logger.info('Video toggled', { enabled })
  }

  /**
   * Start screen sharing
   */
  async startScreenShare(): Promise<void> {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      })

      // Replace video track in all peer connections
      const videoTrack = screenStream.getVideoTracks()[0]
      
      this.participants.forEach(async (participant) => {
        if (participant.connection) {
          const sender = participant.connection.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          )
          
          if (sender) {
            await sender.replaceTrack(videoTrack)
          }
        }
      })

      // Handle screen share end
      videoTrack.onended = () => {
        this.stopScreenShare()
      }

      logger.info('Screen sharing started')
    } catch (error) {
      logger.error('Failed to start screen sharing', error as Error)
      throw error
    }
  }

  /**
   * Stop screen sharing
   */
  async stopScreenShare(): Promise<void> {
    try {
      if (!this.localStream) return

      const videoTrack = this.localStream.getVideoTracks()[0]
      
      this.participants.forEach(async (participant) => {
        if (participant.connection) {
          const sender = participant.connection.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          )
          
          if (sender && videoTrack) {
            await sender.replaceTrack(videoTrack)
          }
        }
      })

      logger.info('Screen sharing stopped')
    } catch (error) {
      logger.error('Failed to stop screen sharing', error as Error)
      throw error
    }
  }

  /**
   * Start collecting call statistics
   */
  private startStatsCollection(peerConnection: RTCPeerConnection): void {
    this.statsInterval = setInterval(async () => {
      try {
        const stats = await peerConnection.getStats()
        const callStats = this.processStats(stats)
        this.onStatsUpdateCallback?.(callStats)
      } catch (error) {
        logger.error('Failed to collect stats', error as Error)
      }
    }, 5000) // Collect stats every 5 seconds
  }

  /**
   * Stop collecting statistics
   */
  private stopStatsCollection(): void {
    if (this.statsInterval) {
      clearInterval(this.statsInterval)
      this.statsInterval = null
    }
  }

  /**
   * Process WebRTC statistics
   */
  private processStats(stats: RTCStatsReport): CallStats {
    let bitrate = 0
    let packetsLost = 0
    let jitter = 0
    let quality: 'excellent' | 'good' | 'poor' = 'good'

    stats.forEach((report) => {
      if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
        bitrate = report.bytesReceived || 0
        packetsLost = report.packetsLost || 0
        jitter = report.jitter || 0
      }
    })

    // Determine quality based on metrics
    if (packetsLost < 10 && jitter < 0.05) {
      quality = 'excellent'
    } else if (packetsLost < 50 && jitter < 0.1) {
      quality = 'good'
    } else {
      quality = 'poor'
    }

    return {
      duration: 0, // This should be calculated elsewhere
      quality,
      bitrate,
      packetsLost,
      jitter
    }
  }

  /**
   * Get local stream
   */
  getLocalStream(): MediaStream | null {
    return this.localStream
  }

  /**
   * Get participant stream
   */
  getParticipantStream(participantId: string): MediaStream | null {
    return this.participants.get(participantId)?.stream || null
  }

  /**
   * Remove participant
   */
  removeParticipant(participantId: string): void {
    const participant = this.participants.get(participantId)
    if (participant) {
      participant.connection?.close()
      this.participants.delete(participantId)
      logger.info('Participant removed', { participantId })
    }
  }

  /**
   * Set callbacks
   */
  setCallbacks(callbacks: {
    onRemoteStream?: (participantId: string, stream: MediaStream) => void
    onStatsUpdate?: (stats: CallStats) => void
    onConnectionState?: (participantId: string, state: RTCPeerConnectionState) => void
  }): void {
    this.onRemoteStreamCallback = callbacks.onRemoteStream
    this.onStatsUpdateCallback = callbacks.onStatsUpdate
    this.onConnectionStateCallback = callbacks.onConnectionState
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    // Close all peer connections
    this.participants.forEach((participant) => {
      participant.connection?.close()
    })
    this.participants.clear()

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop())
      this.localStream = null
    }

    // Stop stats collection
    this.stopStatsCollection()

    this.isInitialized = false
    logger.info('WebRTC service cleaned up')
  }
}

// Singleton instance
export const webrtcService = new EnhancedWebRTCService()
