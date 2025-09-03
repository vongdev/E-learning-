"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { X, CheckCircle, XCircle, Clock, BookOpen, Trophy, Star } from "lucide-react"

interface QuizPopupProps {
  onComplete: (points: number) => void
  onClose: () => void
}

export function QuizPopup({ onComplete, onClose }: QuizPopupProps) {
  const [selectedAnswer, setSelectedAnswer] = useState("")
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [showCountdown, setShowCountdown] = useState(true)
  const [countdown, setCountdown] = useState(5)
  const [canRetake, setCanRetake] = useState(false)

  useEffect(() => {
    if (showCountdown && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0) {
      setShowCountdown(false)
    }
  }, [countdown, showCountdown])

  const question = {
    text: "Trong 4P của Marketing Mix, P nào đại diện cho 'Sản phẩm'?",
    options: [
      { id: "a", text: "Price (Giá cả)", correct: false },
      { id: "b", text: "Product (Sản phẩm)", correct: true },
      { id: "c", text: "Place (Phân phối)", correct: false },
      { id: "d", text: "Promotion (Khuyến mãi)", correct: false },
    ],
    studyTips: [
      "📚 Tài liệu: Marketing Mix - 4P Framework",
      "🎥 Video: Chiến lược sản phẩm trong Marketing",
      "📖 Đọc thêm: Phân tích case study Coca-Cola",
    ],
  }

  const handleSubmit = () => {
    const correct = question.options.find((opt) => opt.id === selectedAnswer)?.correct || false
    setIsCorrect(correct)
    setShowResult(true)
    if (!correct) {
      setCanRetake(true)
    }

    setTimeout(() => {
      onComplete(correct ? 10 : 0)
    }, 3000)
  }

  const handleRetake = () => {
    setSelectedAnswer("")
    setShowResult(false)
    setCanRetake(false)
  }

  if (showCountdown) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
          <CardContent className="text-center space-y-4 pt-8">
            <div className="relative">
              <Clock className="h-16 w-16 text-blue-500 mx-auto animate-pulse" />
              <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg animate-bounce">
                {countdown}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-blue-700 mb-2">🎯 Quiz sắp xuất hiện!</h3>
              <p className="text-blue-600">Chuẩn bị sẵn sàng trong {countdown} giây...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-t-lg">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Quiz nhanh ⚡
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          {!showResult ? (
            <>
              <div className="bg-white p-4 rounded-lg border-l-4 border-blue-400">
                <p className="font-medium text-gray-800">{question.text}</p>
              </div>
              <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer} className="space-y-3">
                {question.options.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/50 transition-colors"
                  >
                    <RadioGroupItem value={option.id} id={option.id} className="text-blue-500" />
                    <Label htmlFor={option.id} className="flex-1 cursor-pointer font-medium">
                      {option.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <Button
                onClick={handleSubmit}
                disabled={!selectedAnswer}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3"
              >
                🚀 Trả lời ngay!
              </Button>
            </>
          ) : (
            <div className="text-center space-y-6">
              {isCorrect ? (
                <>
                  <div className="relative">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto animate-bounce" />
                    <Star className="h-6 w-6 text-yellow-400 absolute -top-1 -right-1 animate-spin" />
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="font-bold text-green-700 text-xl">🎉 Xuất sắc!</p>
                    <p className="text-green-600 font-semibold">Bạn được +10 điểm</p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-600">Huy hiệu: Quiz Master!</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="h-16 w-16 text-red-500 mx-auto animate-pulse" />
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <p className="font-bold text-red-700 text-xl">💪 Cố gắng thêm!</p>
                    <p className="text-red-600 mb-3">
                      Đáp án đúng là: <strong>Product (Sản phẩm)</strong>
                    </p>
                    {canRetake && (
                      <Button
                        onClick={handleRetake}
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                      >
                        🔄 Làm lại quiz
                      </Button>
                    )}
                  </div>
                </>
              )}

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  <h4 className="font-semibold text-blue-700">💡 Gợi ý học thêm</h4>
                </div>
                <div className="space-y-2 text-left">
                  {question.studyTips.map((tip, index) => (
                    <p
                      key={index}
                      className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer transition-colors"
                    >
                      {tip}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
