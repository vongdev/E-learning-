"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, Volume2, Maximize } from "lucide-react"

interface VideoPlayerProps {
  videoSrc?: string
  videoTitle?: string
  videoDescription?: string
  thumbnailSrc?: string
  onTimeUpdate?: (currentTime: number, duration: number) => void
  onVideoEnd?: () => void
  markers?: Array<{
    id: string
    time: number
    type: 'quiz' | 'note' | 'important'
    content: string
    quizId?: string
  }>
}

export function VideoPlayer({
  videoSrc = "/professor-teaching-in-classroom.png",
  videoTitle = "Bài 5: Nguyên lý Marketing Cơ bản",
  videoDescription = "Tìm hiểu về các nguyên lý cơ bản của marketing và cách áp dụng trong thực tế",
  thumbnailSrc,
  onTimeUpdate,
  onVideoEnd,
  markers = []
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(34)
  const [currentTime, setCurrentTime] = useState("15:30")
  const [duration, setDuration] = useState("45:00")
  
  // Giả lập video đang chạy
  useEffect(() => {
    if (!isPlaying) return
    
    const timer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 0.5;
        if (newProgress >= 100) {
          setIsPlaying(false)
          clearInterval(timer)
          onVideoEnd?.()
          return 100
        }
        return newProgress
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [isPlaying, onVideoEnd])

  // Giả lập cập nhật thời gian video
  useEffect(() => {
    if (!isPlaying) return
    
    const timer = setInterval(() => {
      // Lấy số giây hiện tại từ progress
      const totalSeconds = Math.floor((progress / 100) * (45 * 60))
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = totalSeconds % 60
      setCurrentTime(`${minutes}:${seconds.toString().padStart(2, '0')}`)
      
      onTimeUpdate?.(totalSeconds, 45 * 60)
    }, 1000)
    
    return () => clearInterval(timer)
  }, [progress, isPlaying, onTimeUpdate])

  return (
    <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-blue-900 rounded-lg overflow-hidden">
      <img
        src={videoSrc}
        alt="Video bài giảng"
        className="w-full h-full object-cover"
      />

      {/* Video Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-white hover:bg-white/20 bg-blue-500/30 rounded-full h-8 w-8 p-0"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Volume2 className="h-4 w-4" />
            <span className="text-xs font-medium">{currentTime} / {duration}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 bg-purple-500/30 rounded-full h-8 w-8 p-0"
          >
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 relative">
          <Progress value={progress} className="h-1.5 bg-white/20" />
          
          {/* Video Timeline Markers */}
          {markers.map(marker => (
            <div 
              key={marker.id}
              className={`absolute w-2 h-2 rounded-full cursor-pointer -mt-1 transform -translate-y-1/2
                ${marker.type === 'quiz' ? 'bg-red-500' : marker.type === 'important' ? 'bg-yellow-500' : 'bg-blue-500'}`}
              style={{ left: `${(marker.time / (45 * 60)) * 100}%`, top: '50%' }}
              title={marker.content}
            />
          ))}
        </div>
      </div>

      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 to-transparent p-4">
        <h3 className="text-lg font-bold text-white drop-shadow-md">
          {videoTitle}
        </h3>
      </div>
    </div>
  )
}