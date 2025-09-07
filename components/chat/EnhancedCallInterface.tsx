'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Monitor, 
  Settings, Users, MessageSquare, BookOpen, Brain, Pause, 
  Play, RotateCcw, Save, FileText, Camera, Volume2, VolumeX,
  Maximize, Minimize, Grid3x3, User
} from 'lucide-react'
import toast from 'react-hot-toast'
import { logger } from '@/lib/logger'

interface EnhancedCallInterfaceProps {
  call: {
    id: string
    type: 'AUDIO' | 'VIDEO'
    participants: Array<{
      user: {
        id: string
        name: string
        image?: string | null
      }
    }>
    chatRoomId: string
  }
  userId: string
  onEndCall: () => void
  onError?: (error: Error) => void
}

interface StudyTools {
  whiteboard: boolean
  screenShare: boolean
  recording: boolean
  notes: string
  timer: {
    active: boolean
    duration: number
    remaining: number
  }
  breakTimer: {
    active: boolean
    remaining: number
  }
}

interface CallStats {
  duration: number
  quality: 'excellent' | 'good' | 'poor'
  participants: number
  studyFocus: number // 0-100 engagement score
}

export default function EnhancedCallInterface({ 
  call, 
  userId, 
  onEndCall, 
  onError 
}: EnhancedCallInterfaceProps) {
  // Call state
  const [isConnected, setIsConnected] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(call.type === 'VIDEO')
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [callStats, setCallStats] = useState<CallStats>({
    duration: 0,
    quality: 'good',
    participants: call.participants.length + 1,
    studyFocus: 85
  })

  // Study tools state
  const [studyTools, setStudyTools] = useState<StudyTools>({
    whiteboard: false,
    screenShare: false,
    recording: false,
    notes: '',
    timer: {
      active: false,
      duration: 1500, // 25 minutes default (Pomodoro)
      remaining: 1500
    },
    breakTimer: {
      active: false,
      remaining: 300 // 5 minutes break
    }
  })

  // UI state
  const [showControls, setShowControls] = useState(true)
  const [showStudyTools, setShowStudyTools] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [viewMode, setViewMode] = useState<'gallery' | 'speaker' | 'presentation'>('gallery')
  const [volume, setVolume] = useState(80)

  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const timerIntervalRef = useRef<NodeJS.Timeout>()
  const durationIntervalRef = useRef<NodeJS.Timeout>()

  // Initialize call
  useEffect(() => {
    initializeCall()
    startDurationTimer()
    
    return () => {
      cleanup()
    }
  }, [])

  // Auto-hide controls
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowControls(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [showControls])

  const initializeCall = async () => {
    try {
      // Simulate WebRTC initialization
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsConnected(true)
      toast.success('Connected to call')
      logger.info('Call connected', { callId: call.id, type: call.type })
    } catch (error) {
      const err = error as Error
      onError?.(err)
      toast.error('Failed to connect to call')
      logger.error('Call connection failed', err)
    }
  }

  const startDurationTimer = () => {
    durationIntervalRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1)
      setCallStats(prev => ({
        ...prev,
        duration: prev.duration + 1
      }))
    }, 1000)
  }

  const cleanup = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current)
    }
  }

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled)
    toast.success(isVideoEnabled ? 'Camera turned off' : 'Camera turned on')
  }

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled)
    toast.success(isAudioEnabled ? 'Microphone muted' : 'Microphone unmuted')
  }

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        // Start screen sharing
        setIsScreenSharing(true)
        setStudyTools(prev => ({ ...prev, screenShare: true }))
        toast.success('Screen sharing started')
      } else {
        // Stop screen sharing
        setIsScreenSharing(false)
        setStudyTools(prev => ({ ...prev, screenShare: false }))
        toast.success('Screen sharing stopped')
      }
    } catch (error) {
      toast.error('Failed to toggle screen sharing')
    }
  }

  const startRecording = () => {
    if (!studyTools.recording) {
      setStudyTools(prev => ({ ...prev, recording: true }))
      toast.success('Recording started')
    } else {
      setStudyTools(prev => ({ ...prev, recording: false }))
      toast.success('Recording saved')
    }
  }

  const startStudyTimer = () => {
    if (!studyTools.timer.active) {
      setStudyTools(prev => ({
        ...prev,
        timer: { ...prev.timer, active: true }
      }))
      
      timerIntervalRef.current = setInterval(() => {
        setStudyTools(prev => {
          if (prev.timer.remaining <= 1) {
            // Timer finished
            toast.success('Study session complete! Time for a break.')
            return {
              ...prev,
              timer: { ...prev.timer, active: false, remaining: prev.timer.duration },
              breakTimer: { active: true, remaining: 300 }
            }
          }
          return {
            ...prev,
            timer: { ...prev.timer, remaining: prev.timer.remaining - 1 }
          }
        })
      }, 1000)
    } else {
      // Pause timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
      setStudyTools(prev => ({
        ...prev,
        timer: { ...prev.timer, active: false }
      }))
    }
  }

  const resetStudyTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
    }
    setStudyTools(prev => ({
      ...prev,
      timer: {
        ...prev.timer,
        active: false,
        remaining: prev.timer.duration
      }
    }))
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const saveStudyNotes = () => {
    if (studyTools.notes.trim()) {
      toast.success('Study notes saved')
      logger.info('Study notes saved', { callId: call.id, notesLength: studyTools.notes.length })
    }
  }

  const endCall = () => {
    cleanup()
    onEndCall()
    toast.success(`Call ended after ${formatDuration(callDuration)}`)
  }

  if (!isConnected) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold mb-2">Connecting to call...</h3>
          <p className="text-gray-300">Please wait while we establish the connection</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="fixed inset-0 bg-black z-50 flex flex-col"
      onMouseMove={() => setShowControls(true)}
    >
      {/* Header */}
      <div className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4 z-10 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">
                Study Call • {formatDuration(callDuration)}
              </span>
            </div>
            <div className="flex items-center space-x-1 text-sm text-gray-300">
              <Users className="h-4 w-4" />
              <span>{callStats.participants} participants</span>
            </div>
            <div className="flex items-center space-x-1 text-sm text-gray-300">
              <Brain className="h-4 w-4" />
              <span>Focus: {callStats.studyFocus}%</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {studyTools.recording && (
              <div className="flex items-center space-x-1 text-red-400">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Recording</span>
              </div>
            )}
            <button
              onClick={() => setViewMode(viewMode === 'gallery' ? 'speaker' : 'gallery')}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Toggle view mode"
            >
              {viewMode === 'gallery' ? <User className="h-5 w-5" /> : <Grid3x3 className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative">
        {call.type === 'VIDEO' && isVideoEnabled ? (
          <div className={`h-full ${viewMode === 'gallery' ? 'grid grid-cols-2 gap-2 p-2' : 'relative'}`}>
            {/* Remote Video */}
            <div className="relative bg-gray-900 rounded-lg overflow-hidden">
              <video
                ref={remoteVideoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
              />
              <div className="absolute bottom-4 left-4 text-white text-sm font-medium bg-black/50 px-2 py-1 rounded">
                {call.participants[0]?.user.name || 'Study Partner'}
              </div>
            </div>
            
            {/* Local Video */}
            <div className={`relative bg-gray-800 rounded-lg overflow-hidden ${viewMode === 'speaker' ? 'absolute bottom-4 right-4 w-48 h-36' : ''}`}>
              <video
                ref={localVideoRef}
                className="w-full h-full object-cover scale-x-[-1]"
                autoPlay
                playsInline
                muted
              />
              <div className="absolute bottom-2 left-2 text-white text-xs font-medium bg-black/50 px-2 py-1 rounded">
                You
              </div>
            </div>
          </div>
        ) : (
          // Audio-only mode
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-white">
              <div className="grid grid-cols-2 gap-8 mb-8">
                {/* Current User */}
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                    <span className="text-3xl font-bold text-white">You</span>
                  </div>
                  <h3 className="text-xl font-semibold">You</h3>
                  <div className="flex items-center mt-2 space-x-2">
                    {isAudioEnabled ? (
                      <div className="flex items-center text-green-400">
                        <Mic className="h-4 w-4 mr-1" />
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className="w-1 h-4 bg-green-400 rounded animate-pulse"
                              style={{ animationDelay: `${i * 0.1}s` }}
                            ></div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-red-400 flex items-center">
                        <MicOff className="h-4 w-4 mr-1" />
                        <span className="text-sm">Muted</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Partner */}
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mb-4">
                    <span className="text-3xl font-bold text-white">
                      {call.participants[0]?.user.name?.[0]?.toUpperCase() || 'P'}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold">
                    {call.participants[0]?.user.name || 'Study Partner'}
                  </h3>
                  <div className="flex items-center mt-2 text-green-400">
                    <Volume2 className="h-4 w-4 mr-1" />
                    <div className="flex space-x-1">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 h-3 bg-green-400 rounded animate-pulse"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Study Timer Display */}
              {studyTools.timer.active && (
                <div className="bg-blue-900/50 rounded-lg p-6 mb-6">
                  <h4 className="text-lg font-semibold mb-2">Study Session</h4>
                  <div className="text-4xl font-mono font-bold text-blue-400">
                    {formatTime(studyTools.timer.remaining)}
                  </div>
                  <div className="w-64 bg-gray-700 rounded-full h-2 mt-4">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                      style={{
                        width: `${((studyTools.timer.duration - studyTools.timer.remaining) / studyTools.timer.duration) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Study Tools Sidebar */}
      {showStudyTools && (
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gray-900 text-white p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Study Tools
            </h3>
            <button
              onClick={() => setShowStudyTools(false)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>

          {/* Pomodoro Timer */}
          <div className="mb-6 p-4 bg-gray-800 rounded-lg">
            <h4 className="font-medium mb-3">Pomodoro Timer</h4>
            <div className="text-center mb-4">
              <div className="text-2xl font-mono font-bold text-blue-400">
                {formatTime(studyTools.timer.remaining)}
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${((studyTools.timer.duration - studyTools.timer.remaining) / studyTools.timer.duration) * 100}%`
                  }}
                ></div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={startStudyTimer}
                className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
              >
                {studyTools.timer.active ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                {studyTools.timer.active ? 'Pause' : 'Start'}
              </button>
              <button
                onClick={resetStudyTimer}
                className="px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded text-sm"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Study Notes */}
          <div className="mb-6 p-4 bg-gray-800 rounded-lg">
            <h4 className="font-medium mb-3">Study Notes</h4>
            <textarea
              value={studyTools.notes}
              onChange={(e) => setStudyTools(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Take notes during your study session..."
              className="w-full h-32 p-3 bg-gray-700 border border-gray-600 rounded resize-none text-sm"
            />
            <button
              onClick={saveStudyNotes}
              className="mt-2 w-full flex items-center justify-center px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm"
            >
              <Save className="h-4 w-4 mr-1" />
              Save Notes
            </button>
          </div>

          {/* Recording */}
          <div className="p-4 bg-gray-800 rounded-lg">
            <h4 className="font-medium mb-3">Session Recording</h4>
            <button
              onClick={startRecording}
              className={`w-full flex items-center justify-center px-3 py-2 rounded text-sm ${
                studyTools.recording
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              <Camera className="h-4 w-4 mr-1" />
              {studyTools.recording ? 'Stop Recording' : 'Start Recording'}
            </button>
          </div>
        </div>
      )}

      {/* Control Bar */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center justify-center space-x-4">
          {/* Audio Control */}
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full transition-colors ${
              isAudioEnabled 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
            title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
          >
            {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
          </button>

          {/* Video Control */}
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-colors ${
              isVideoEnabled 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
            title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
          </button>

          {/* Screen Share */}
          <button
            onClick={toggleScreenShare}
            className={`p-4 rounded-full transition-colors ${
              isScreenSharing 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
            title={isScreenSharing ? 'Stop screen sharing' : 'Start screen sharing'}
          >
            <Monitor className="h-6 w-6" />
          </button>

          {/* Study Tools */}
          <button
            onClick={() => setShowStudyTools(!showStudyTools)}
            className={`p-4 rounded-full transition-colors ${
              showStudyTools 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
            title="Study tools"
          >
            <BookOpen className="h-6 w-6" />
          </button>

          {/* Chat */}
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors"
            title="Open chat"
          >
            <MessageSquare className="h-6 w-6" />
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors"
            title="Settings"
          >
            <Settings className="h-6 w-6" />
          </button>

          {/* End Call */}
          <button
            onClick={endCall}
            className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
            title="End call"
          >
            <PhoneOff className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute bottom-20 right-6 w-72 bg-gray-900 rounded-lg p-4 text-white">
          <h4 className="font-medium mb-4">Call Settings</h4>
          
          {/* Volume Control */}
          <div className="mb-4">
            <label className="block text-sm text-gray-300 mb-2">Volume</label>
            <div className="flex items-center space-x-2">
              <VolumeX className="h-4 w-4" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="flex-1"
              />
              <Volume2 className="h-4 w-4" />
            </div>
          </div>

          {/* Call Quality */}
          <div className="mb-4">
            <label className="block text-sm text-gray-300 mb-2">Call Quality</label>
            <div className="text-sm">
              <div className={`inline-block px-2 py-1 rounded text-xs ${
                callStats.quality === 'excellent' ? 'bg-green-600' :
                callStats.quality === 'good' ? 'bg-yellow-600' : 'bg-red-600'
              }`}>
                {callStats.quality.toUpperCase()}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowSettings(false)}
            className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}
