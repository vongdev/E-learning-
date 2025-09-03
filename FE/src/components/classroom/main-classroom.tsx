"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { QuizPopup } from "@/components/classroom/quiz-popup"
import { Play, Pause, Volume2, Maximize, Trophy, Users, Target, Zap, Award } from "lucide-react"

// Định nghĩa kiểu dữ liệu cho thông tin khóa học
interface Course {
  id: number
  code: string
  name: string
  instructor: string
  description: string
}

interface MainClassroomProps {
  onJoinBreakout?: () => void
  userAssignedRoom?: number | null
  courseData?: Course
}

export function MainClassroom({ onJoinBreakout, userAssignedRoom = 1, courseData }: MainClassroomProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(35)
  const [showQuiz, setShowQuiz] = useState(false)
  const [points, setPoints] = useState(150)
  const [badges, setBadges] = useState(["🏆 Quiz Master", "⚡ Active Learner", "🎯 Focus Champion"])
  const [streak, setStreak] = useState(7)
  const [level, setLevel] = useState(3)
  const [nextLevelPoints, setNextLevelPoints] = useState(200)

  // Simulate quiz popup after 5-10 minutes
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowQuiz(true)
    }, 8000) // 8 seconds for demo

    return () => clearTimeout(timer)
  }, [])

  const handleQuizComplete = (earnedPoints: number) => {
    setPoints((prev) => prev + earnedPoints)
    setProgress((prev) => Math.min(prev + 10, 100))
    setShowQuiz(false)
    if (earnedPoints > 0) {
      setStreak((prev) => prev + 1)
      if (points + earnedPoints >= nextLevelPoints) {
        setLevel((prev) => prev + 1)
        setNextLevelPoints((prev) => prev + 100)
      }
    }
  }

  const handleJoinBreakout = () => {
    if (onJoinBreakout) {
      onJoinBreakout()
    }
  }

  // Lấy tiêu đề và mô tả khóa học từ courseData hoặc sử dụng giá trị mặc định
  const courseTitle = courseData ? `${courseData.code}: ${courseData.name}` : "Bài 5: Nguyên lý Marketing Cơ bản"
  const courseDescription = courseData?.description || "Tìm hiểu về các nguyên lý cơ bản của marketing và cách áp dụng trong thực tế"

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      {/* Video Player */}
      <div className="xl:col-span-2">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-xl">
          <CardContent className="p-0">
            <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-blue-900 rounded-t-lg overflow-hidden">
              <img
                src="/professor-teaching-in-classroom.png"
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
                    <span className="text-xs font-medium">15:30 / 45:00</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 bg-purple-500/30 rounded-full h-8 w-8 p-0"
                  >
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-2">
                  <Progress value={34} className="h-1.5 bg-white/20" />
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-white to-blue-50">
              <h3 className="text-lg font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {courseTitle}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {courseDescription}
              </p>
              {courseData?.instructor && (
                <p className="text-sm text-gray-500 mt-1">
                  <span className="font-medium">Giảng viên:</span> {courseData.instructor}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        {/* Progress & Points */}
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-t-lg p-3">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <Trophy className="h-5 w-5" />
              Tiến độ học tập
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            <div className="bg-white/70 p-3 rounded-xl border border-yellow-200">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-700 text-sm">Hoàn thành khóa học</span>
                <span className="font-bold text-lg text-orange-600">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2 bg-yellow-100" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-3 rounded-lg border border-purple-200 text-center">
                <Target className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                <p className="text-xs text-purple-600 font-medium">Level</p>
                <p className="text-xl font-bold text-purple-700">{level}</p>
              </div>
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-3 rounded-lg border border-green-200 text-center">
                <Zap className="h-5 w-5 text-green-500 mx-auto mb-1" />
                <p className="text-xs text-green-600 font-medium">Streak</p>
                <p className="text-xl font-bold text-green-700">{streak}</p>
                <p className="text-xs text-green-500 font-medium">ngày</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-100 to-cyan-100 p-3 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="font-bold text-base text-blue-700">{points} điểm</span>
                </div>
              </div>
              <div className="text-xs text-blue-600 font-medium">
                Còn {nextLevelPoints - points} điểm để lên Level {level + 1}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-500" />
                Huy hiệu đạt được
              </p>
              <div className="flex flex-wrap gap-1">
                {badges.map((badge, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs bg-gradient-to-r from-yellow-200 to-orange-200 text-orange-800 border border-orange-300 font-medium px-2 py-1"
                  >
                    {badge}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Breakout Group */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg p-3">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <Users className="h-5 w-5" />
              Nhóm thảo luận
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="bg-white/70 p-3 rounded-lg border border-green-200 mb-3">
              <p className="text-sm font-medium text-green-800 mb-1 leading-relaxed">
                Tham gia thảo luận nhóm để trao đổi ý kiến về bài học
              </p>
              <p className="text-xs text-green-600 font-medium">12 sinh viên đang online</p>
            </div>
            <Button
              onClick={handleJoinBreakout}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-2 shadow-lg text-sm"
            >
              Tham gia Breakout Group
            </Button>
          </CardContent>
        </Card>

        {/* Assignments */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg p-3">
            <CardTitle className="text-base font-bold">Bài tập áp dụng</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="bg-white/70 p-3 rounded-lg border border-purple-200">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-sm text-purple-800 leading-tight">Case Study: Chiến lược Marketing</h4>
                  <Badge className="bg-red-100 text-red-700 border-red-300 text-xs font-medium">Hạn: 3 ngày</Badge>
                </div>
                <p className="text-xs text-purple-600 mb-2 leading-relaxed">
                  Phân tích chiến lược marketing của một thương hiệu nổi tiếng
                </p>
                <div className="flex items-center gap-1 text-xs text-purple-500 font-medium">
                  <Trophy className="h-3 w-3" />
                  <span>Thưởng: 50 điểm</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 bg-gradient-to-r from-purple-100 to-pink-100 border-purple-300 text-purple-700 hover:from-purple-200 hover:to-pink-200 font-semibold text-sm py-2"
                >
                  Xem chi tiết
                </Button>
                <Button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold text-sm py-2">
                  Nộp bài
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quiz Popup */}
      {showQuiz && <QuizPopup onComplete={handleQuizComplete} onClose={() => setShowQuiz(false)} />}
    </div>
  )
}