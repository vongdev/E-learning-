"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useCourse } from "@/contexts/course-context"

interface UseVideoProgressParams {
  courseId: string
  contentId: string
  videoRef?: React.RefObject<HTMLVideoElement>
  autoSync?: boolean
  syncInterval?: number // in milliseconds
  requiredWatchPercentage?: number // percentage required to mark as completed
}

interface UseVideoProgressReturn {
  progress: number
  duration: number
  currentTime: number
  isPlaying: boolean
  isMuted: boolean
  volume: number
  isLoading: boolean
  error: string | null
  
  // Methods
  play: () => void
  pause: () => void
  togglePlay: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  markAsCompleted: () => Promise<void>
  reset: () => void
}

export function useVideoProgress({
  courseId,
  contentId,
  videoRef,
  autoSync = true,
  syncInterval = 10000, // 10 seconds
  requiredWatchPercentage = 85
}: UseVideoProgressParams): UseVideoProgressReturn {
  // Refs
  const internalVideoRef = useRef<HTMLVideoElement | null>(null)
  
  // States
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolumeState] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [watchedSections, setWatchedSections] = useState<Record<string, boolean>>({})
  
  // Get course context
  const course = useCourse()
  
  // Get video element
  const getVideoElement = useCallback(() => {
    return videoRef?.current || internalVideoRef.current
  }, [videoRef])
  
  // Initialize video event listeners
  useEffect(() => {
    const video = getVideoElement()
    if (!video) return
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      
      // Track progress
      if (video.duration) {
        const newProgress = Math.floor((video.currentTime / video.duration) * 100)
        setProgress(newProgress)
        
        // Track watched sections (divide video into 10 sections)
        const sectionLength = video.duration / 10
        const currentSection = Math.floor(video.currentTime / sectionLength)
        
        if (currentSection >= 0 && currentSection < 10) {
          setWatchedSections(prev => ({
            ...prev,
            [currentSection]: true
          }))
        }
      }
    }
    
    const handleDurationChange = () => {
      setDuration(video.duration)
    }
    
    const handlePlay = () => {
      setIsPlaying(true)
    }
    
    const handlePause = () => {
      setIsPlaying(false)
    }
    
    const handleVolumeChange = () => {
      setVolumeState(video.volume)
      setIsMuted(video.muted)
    }
    
    const handleError = (e: ErrorEvent) => {
      setError("Lỗi khi phát video: " + (e.message || "Không xác định"))
      setIsLoading(false)
    }
    
    // Add event listeners
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('durationchange', handleDurationChange)
    video.addEventListener('play', handlePlay)
    video.addEventListener('playing', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('volumechange', handleVolumeChange)
    video.addEventListener('error', handleError as EventListener)
    
    // Initialize state
    if (video.duration) {
      setDuration(video.duration)
    }
    setIsPlaying(!video.paused)
    setVolumeState(video.volume)
    setIsMuted(video.muted)
    
    // Clean up event listeners
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('durationchange', handleDurationChange)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('playing', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('volumechange', handleVolumeChange)
      video.removeEventListener('error', handleError as EventListener)
    }
  }, [getVideoElement])
  
  // Auto sync progress with server
  useEffect(() => {
    if (!autoSync) return
    
    let intervalId: NodeJS.Timeout
    
    const syncProgress = async () => {
      try {
        if (progress > 0 && course) {
          await course.updateContentProgress(courseId, contentId, progress)
        }
      } catch (err) {
        console.error("Failed to sync video progress:", err)
      }
    }
    
    // Initial sync
    syncProgress()
    
    // Set up interval for periodic sync
    intervalId = setInterval(syncProgress, syncInterval)
    
    // Clean up interval
    return () => {
      clearInterval(intervalId)
      // Final sync when unmounting
      syncProgress()
    }
  }, [autoSync, courseId, contentId, progress, course, syncInterval])
  
  // Auto mark as completed when required percentage is watched
  useEffect(() => {
    const checkCompletion = async () => {
      if (!course) return
      
      // Count watched sections
      const watchedSectionsCount = Object.values(watchedSections).filter(Boolean).length
      
      // Calculate watched percentage (consider 10 total sections)
      const watchedPercentage = (watchedSectionsCount / 10) * 100
      
      // If watched enough and progress is high enough, mark as completed
      if (watchedPercentage >= requiredWatchPercentage && progress >= requiredWatchPercentage) {
        try {
          await course.markContentAsCompleted(courseId, contentId)
        } catch (err) {
          console.error("Failed to mark content as completed:", err)
        }
      }
    }
    
    checkCompletion()
  }, [progress, courseId, contentId, course, watchedSections, requiredWatchPercentage])
  
  // Methods
  const play = useCallback(() => {
    const video = getVideoElement()
    if (video) {
      video.play().catch(err => {
        setError("Không thể phát video: " + (err.message || "Lỗi không xác định"))
      })
    }
  }, [getVideoElement])
  
  const pause = useCallback(() => {
    const video = getVideoElement()
    if (video) {
      video.pause()
    }
  }, [getVideoElement])
  
  const togglePlay = useCallback(() => {
    const video = getVideoElement()
    if (!video) return
    
    if (video.paused) {
      play()
    } else {
      pause()
    }
  }, [getVideoElement, play, pause])
  
  const seek = useCallback((time: number) => {
    const video = getVideoElement()
    if (video) {
      // Ensure time is within valid range
      const safeTime = Math.max(0, Math.min(time, video.duration || 0))
      video.currentTime = safeTime
      setCurrentTime(safeTime)
    }
  }, [getVideoElement])
  
  const setVolume = useCallback((newVolume: number) => {
    const video = getVideoElement()
    if (video) {
      // Ensure volume is within valid range (0-1)
      const safeVolume = Math.max(0, Math.min(newVolume, 1))
      video.volume = safeVolume
      setVolumeState(safeVolume)
      
      // If setting volume to 0, mute the video
      // If setting volume > 0 while muted, unmute the video
      if (safeVolume === 0 && !video.muted) {
        video.muted = true
        setIsMuted(true)
      } else if (safeVolume > 0 && video.muted) {
        video.muted = false
        setIsMuted(false)
      }
    }
  }, [getVideoElement])
  
  const toggleMute = useCallback(() => {
    const video = getVideoElement()
    if (video) {
      video.muted = !video.muted
      setIsMuted(video.muted)
    }
  }, [getVideoElement])
  
  const markAsCompleted = useCallback(async () => {
    if (!course) return Promise.reject("Course context not available")
    
    setIsLoading(true)
    try {
      await course.markContentAsCompleted(courseId, contentId)
      setIsLoading(false)
      return Promise.resolve()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      setError("Failed to mark as completed: " + errorMessage)
      setIsLoading(false)
      return Promise.reject(err)
    }
  }, [courseId, contentId, course])
  
  const reset = useCallback(() => {
    const video = getVideoElement()
    if (video) {
      video.currentTime = 0
      setCurrentTime(0)
      setProgress(0)
      setWatchedSections({})
    }
  }, [getVideoElement])
  
  return {
    progress,
    duration,
    currentTime,
    isPlaying,
    isMuted,
    volume,
    isLoading,
    error,
    
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    markAsCompleted,
    reset
  }
}