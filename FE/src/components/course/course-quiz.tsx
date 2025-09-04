"use client"

import { useState, useEffect } from 'react'
import { 
  FileQuestion, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ChevronRight, 
  ChevronLeft, 
  Loader2, 
  AlertCircle, 
  Timer 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from '@/components/ui/textarea'

interface Option {
  _id: string;
  text: string;
  isCorrect?: boolean;
  explanation?: string;
}

interface Question {
  _id: string;
  type: 'multiple-choice' | 'single-choice' | 'true-false' | 'essay';
  text: string;
  options: Option[];
  explanation?: string;
  points: number;
  order: number;
  userAnswer?: string | string[];
}

interface Quiz {
  _id: string;
  title: string;
  description?: string;
  instructions?: string;
  questions: Question[];
  timeLimit?: number;
  passingScore: number;
  maxAttempts: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showCorrectAnswers: boolean;
  showExplanations: boolean;
  points: number;
}

interface QuizResult {
  score: number;
  maxScore: number;
  percentage: number;
  passedQuestions: number;
  totalQuestions: number;
  answers: {
    questionId: string;
    userAnswer: string | string[];
    isCorrect: boolean;
    points: number;
  }[];
  isPassed: boolean;
  timeTaken: number;
}

interface CourseQuizProps {
  quizId: string;
  onComplete?: (result: QuizResult) => void;
}

export default function CourseQuiz({ quizId, onComplete }: CourseQuizProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<string, string | string[]>>({})
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isStarted, setIsStarted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [result, setResult] = useState<QuizResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false)
  const { toast } = useToast()

  // Fetch quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      if (!quizId) return;
      
      try {
        setLoading(true)
        setError(null)
        
        // Fetch quiz from API
        const response = await fetch(`/api/quizzes/${quizId}`)
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Không thể tải bài kiểm tra')
        }
        
        // Sort questions by order if not shuffled
        let questions = [...data.data.questions]
        if (!data.data.shuffleQuestions) {
          questions = questions.sort((a, b) => a.order - b.order)
        } else {
          // Shuffle questions
          questions = questions.sort(() => Math.random() - 0.5)
        }
        
        // Shuffle options if needed
        if (data.data.shuffleOptions) {
          questions = questions.map(question => ({
            ...question,
            options: question.options.sort(() => Math.random() - 0.5)
          }))
        }
        
        setQuiz({
          ...data.data,
          questions
        })
        
        // Set time limit
        if (data.data.timeLimit) {
          setTimeRemaining(data.data.timeLimit * 60) // Convert to seconds
        }
      } catch (error) {
        console.error('Error fetching quiz:', error)
        setError('Không thể tải bài kiểm tra. Vui lòng thử lại sau.')
        
        // Fallback to demo quiz data if API fails
        const demoQuiz = {
          _id: '1',
          title: 'Bài kiểm tra mẫu',
          description: 'Đây là bài kiểm tra mẫu để thử nghiệm',
          instructions: 'Hãy chọn đáp án đúng cho từng câu hỏi.',
          questions: [
            {
              _id: '1',
              type: 'single-choice',
              text: 'Đâu là ngôn ngữ lập trình phổ biến nhất?',
              options: [
                { _id: '1', text: 'JavaScript', isCorrect: true },
                { _id: '2', text: 'Python', isCorrect: false },
                { _id: '3', text: 'Java', isCorrect: false },
                { _id: '4', text: 'C++', isCorrect: false }
              ],
              explanation: 'JavaScript là ngôn ngữ phổ biến nhất theo Stack Overflow Developer Survey.',
              points: 1,
              order: 1
            },
            {
              _id: '2',
              type: 'multiple-choice',
              text: 'Những công nghệ nào thuộc về MERN stack?',
              options: [
                { _id: '1', text: 'MongoDB', isCorrect: true },
                { _id: '2', text: 'Express.js', isCorrect: true },
                { _id: '3', text: 'React', isCorrect: true },
                { _id: '4', text: 'Node.js', isCorrect: true },
                { _id: '5', text: 'Vue.js', isCorrect: false }
              ],
              explanation: 'MERN stack bao gồm MongoDB, Express.js, React và Node.js.',
              points: 2,
              order: 2
            },
            {
              _id: '3',
              type: 'true-false',
              text: 'HTML là ngôn ngữ lập trình?',
              options: [
                { _id: '1', text: 'Đúng', isCorrect: false },
                { _id: '2', text: 'Sai', isCorrect: true }
              ],
              explanation: 'HTML là ngôn ngữ đánh dấu, không phải ngôn ngữ lập trình.',
              points: 1,
              order: 3
            },
            {
              _id: '4',
              type: 'essay',
              text: 'Giải thích sự khác biệt giữa HTTP và HTTPS.',
              points: 3,
              order: 4
            }
          ],
          timeLimit: 15,
          passingScore: 70,
          maxAttempts: 2,
          shuffleQuestions: false,
          shuffleOptions: false,
          showCorrectAnswers: true,
          showExplanations: true,
          points: 10
        } as Quiz
        
        setQuiz(demoQuiz)
        
        // Set time limit for demo
        if (demoQuiz.timeLimit) {
          setTimeRemaining(demoQuiz.timeLimit * 60) // Convert to seconds
        }
      } finally {
        setLoading(false)
      }
    }
    
    fetchQuiz()
  }, [quizId])

  // Timer logic
  useEffect(() => {
    if (!isStarted || !timeRemaining || timeRemaining <= 0) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer)
          // Auto submit if time runs out
          if (prev === 1) handleSubmitQuiz()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [isStarted, timeRemaining])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`
  }

  const handleStartQuiz = () => {
    setIsStarted(true)
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleRadioChange = (questionId: string, optionId: string) => {
    handleAnswerChange(questionId, optionId)
  }

  const handleCheckboxChange = (questionId: string, optionId: string) => {
    const currentAnswers = userAnswers[questionId] as string[] || []
    
    if (currentAnswers.includes(optionId)) {
      // Remove option if already selected
      handleAnswerChange(
        questionId, 
        currentAnswers.filter(id => id !== optionId)
      )
    } else {
      // Add option
      handleAnswerChange(questionId, [...currentAnswers, optionId])
    }
  }

  const handleTextChange = (questionId: string, text: string) => {
    handleAnswerChange(questionId, text)
  }

  const handleSubmitQuiz = async () => {
    if (!quiz) return;
    
    try {
      setIsSubmitting(true)
      
      // Calculate results locally
      let score = 0
      let passedQuestions = 0
      const answers = quiz.questions.map(question => {
        const userAnswer = userAnswers[question._id] || ''
        let isCorrect = false
        
        if (question.type === 'single-choice' || question.type === 'true-false') {
          const correctOption = question.options.find(option => option.isCorrect)
          isCorrect = userAnswer === correctOption?._id
        } else if (question.type === 'multiple-choice') {
          const correctOptions = question.options
            .filter(option => option.isCorrect)
            .map(option => option._id)
          
          const userSelectedOptions = userAnswer as string[] || []
          
          // All correct options must be selected and no incorrect options
          isCorrect = correctOptions.length === userSelectedOptions.length &&
            correctOptions.every(option => userSelectedOptions.includes(option))
        } else if (question.type === 'essay') {
          // Essay questions are manually graded, so we consider them ungraded for now
          isCorrect = false
        }
        
        if (isCorrect) {
          score += question.points
          passedQuestions++
        }
        
        return {
          questionId: question._id,
          userAnswer,
          isCorrect,
          points: isCorrect ? question.points : 0
        }
      })
      
      // Calculate total possible score
      const maxScore = quiz.questions.reduce((total, q) => total + q.points, 0)
      
      // Calculate percentage
      const percentage = Math.round((score / maxScore) * 100)
      
      // Check if passed
      const isPassed = percentage >= quiz.passingScore
      
      // Create result object
      const result: QuizResult = {
        score,
        maxScore,
        percentage,
        passedQuestions,
        totalQuestions: quiz.questions.length,
        answers,
        isPassed,
        timeTaken: quiz.timeLimit ? (quiz.timeLimit * 60) - (timeRemaining || 0) : 0
      }
      
      // Submit results to API
      // Note: In a real app, you would submit to the server and get results back
      /*
      const response = await fetch(`/api/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: Object.entries(userAnswers).map(([questionId, answer]) => ({
            questionId,
            answer
          })),
          timeTaken: quiz.timeLimit ? (quiz.timeLimit * 60) - (timeRemaining || 0) : 0
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Không thể nộp bài kiểm tra')
      }
      
      const data = await response.json()
      setResult(data.result)
      */
      
      // For demo, use the locally calculated result
      setResult(result)
      setIsCompleted(true)
      
      // Call the onComplete callback if provided
      if (onComplete) {
        onComplete(result)
      }
      
      toast({
        title: isPassed ? "Chúc mừng!" : "Kết quả bài kiểm tra",
        description: isPassed 
          ? `Bạn đã đạt ${percentage}% và đã vượt qua bài kiểm tra.` 
          : `Bạn đạt ${percentage}%. Cần ${quiz.passingScore}% để vượt qua.`,
        variant: isPassed ? "default" : "destructive"
      })
    } catch (error) {
      console.error('Error submitting quiz:', error)
      toast({
        title: "Có lỗi xảy ra",
        description: "Không thể nộp bài kiểm tra. Vui lòng thử lại.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
      setShowConfirmSubmit(false)
    }
  }

  // Get the current question
  const currentQuestion = quiz?.questions[currentQuestionIndex]
  
  // Count answered questions
  const answeredCount = Object.keys(userAnswers).length
  
  // Calculate progress percentage
  const progressPercentage = quiz?.questions.length 
    ? (answeredCount / quiz.questions.length) * 100 
    : 0

  if (loading) {
    return (
      <div className="w-full flex justify-center py-12">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
          <p className="text-gray-500">Đang tải bài kiểm tra...</p>
        </div>
      </div>
    )
  }

  if (error || !quiz) {
    return (
      <div className="w-full py-8">
        <div className="text-center p-6 bg-red-50 rounded-lg">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">Đã xảy ra lỗi</h3>
          <p className="text-red-600">{error || 'Không thể tải bài kiểm tra'}</p>
          <Button 
            onClick={() => setLoading(true)}
            variant="outline" 
            className="mt-4"
          >
            Thử lại
          </Button>
        </div>
      </div>
    )
  }

  // Result view
  if (isCompleted && result) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Kết quả bài kiểm tra</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold">{result.score}/{result.maxScore}</div>
              <div className="text-gray-500">Điểm số</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold">{result.percentage}%</div>
              <div className="text-gray-500">Tỷ lệ đúng</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold">{result.passedQuestions}/{result.totalQuestions}</div>
              <div className="text-gray-500">Câu hỏi đúng</div>
            </div>
          </div>
          
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <div className={`text-lg font-bold ${result.isPassed ? 'text-green-500' : 'text-red-500'}`}>
                {result.isPassed ? 'Đã vượt qua' : 'Chưa vượt qua'}
              </div>
              {result.isPassed ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
            <div className="text-gray-500">
              {result.isPassed 
                ? 'Chúc mừng! Bạn đã hoàn thành bài kiểm tra thành công.' 
                : `Bạn cần đạt ${quiz.passingScore}% để vượt qua bài kiểm tra.`}
            </div>
          </div>
          
          {quiz.showCorrectAnswers && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Đáp án chi tiết</h3>
              {quiz.questions.map((question, index) => {
                const answer = result.answers.find(a => a.questionId === question._id)
                const isCorrect = answer?.isCorrect
                
                return (
                  <div key={question._id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-2">
                        <span className="font-medium">Câu {index + 1}:</span>
                        <span>{question.text}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {isCorrect ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-green-500">Đúng</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-red-500" />
                            <span className="text-red-500">Sai</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {(question.type === 'single-choice' || question.type === 'true-false' || question.type === 'multiple-choice') && (
                      <div className="mt-2 space-y-1">
                        {question.options.map(option => {
                          const isSelected = question.type === 'multiple-choice'
                            ? (answer?.userAnswer as string[] || []).includes(option._id)
                            : answer?.userAnswer === option._id
                          
                          return (
                            <div 
                              key={option._id} 
                              className={`flex items-center gap-2 p-2 rounded-md ${
                                option.isCorrect 
                                  ? 'bg-green-50 border border-green-200' 
                                  : isSelected 
                                    ? 'bg-red-50 border border-red-200' 
                                    : ''
                              }`}
                            >
                              {option.isCorrect ? (
                                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                              ) : isSelected ? (
                                <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                              ) : (
                                <div className="w-4 flex-shrink-0" />
                              )}
                              <span>{option.text}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                    
                    {question.type === 'essay' && (
                      <div className="mt-2 space-y-1">
                        <div className="text-sm font-medium">Câu trả lời của bạn:</div>
                        <div className="p-3 bg-gray-50 rounded-md whitespace-pre-wrap">
                          {answer?.userAnswer || 'Không có câu trả lời'}
                        </div>
                      </div>
                    )}
                    
                    {quiz.showExplanations && question.explanation && (
                      <div className="mt-3 text-sm bg-blue-50 p-3 rounded-md">
                        <span className="font-medium">Giải thích:</span> {question.explanation}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={() => window.location.reload()}>
            Quay lại
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // Quiz intro view (before starting)
  if (!isStarted) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">{quiz.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {quiz.description && (
            <p className="text-gray-700">{quiz.description}</p>
          )}
          
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <h3 className="font-medium">Thông tin bài kiểm tra</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <FileQuestion className="h-4 w-4 text-gray-500" />
                <span>Số câu hỏi: {quiz.questions.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>Thời gian: {quiz.timeLimit ? `${quiz.timeLimit} phút` : 'Không giới hạn'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-gray-500" />
                <span>Điểm đạt: {quiz.passingScore}%</span>
              </div>
              <div className="flex items-center gap-2">
                <FileQuestion className="h-4 w-4 text-gray-500" />
                <span>Tổng điểm: {quiz.points}</span>
              </div>
            </div>
          </div>
          
          {quiz.instructions && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Hướng dẫn</h3>
              <p className="text-gray-700">{quiz.instructions}</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleStartQuiz}>
            Bắt đầu làm bài
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // Quiz taking view
  return (
    <div className="space-y-4">
      {/* Header with progress and timer */}
      <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
        <div className="flex flex-col w-full md:w-1/2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-500">Tiến độ</span>
            <span className="text-sm text-gray-500">{answeredCount}/{quiz.questions.length} câu</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
        {timeRemaining !== null && (
          <div className="flex items-center gap-2 ml-4">
            <Timer className="h-5 w-5 text-gray-500" />
            <span className={`font-medium ${timeRemaining < 60 ? 'text-red-500' : ''}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        )}
      </div>
      
      {/* Current question */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg flex justify-between">
            <div>Câu hỏi {currentQuestionIndex + 1}/{quiz.questions.length}</div>
            <div className="text-gray-500">{currentQuestion.points} điểm</div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-lg font-medium">{currentQuestion.text}</div>
          
          {(currentQuestion.type === 'single-choice' || currentQuestion.type === 'true-false') && (
            <RadioGroup
              value={userAnswers[currentQuestion._id] as string || ''}
              onValueChange={(value) => handleRadioChange(currentQuestion._id, value)}
            >
              {currentQuestion.options.map((option) => (
                <div key={option._id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50">
                  <RadioGroupItem value={option._id} id={option._id} />
                  <Label htmlFor={option._id} className="flex-1 cursor-pointer py-2">
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
          
          {currentQuestion.type === 'multiple-choice' && (
            <div className="space-y-2">
              {currentQuestion.options.map((option) => (
                <div key={option._id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50">
                  <Checkbox 
                    id={option._id} 
                    checked={(userAnswers[currentQuestion._id] as string[] || []).includes(option._id)}
                    onCheckedChange={() => handleCheckboxChange(currentQuestion._id, option._id)}
                  />
                  <Label htmlFor={option._id} className="flex-1 cursor-pointer py-2">
                    {option.text}
                  </Label>
                </div>
              ))}
            </div>
          )}
          
          {currentQuestion.type === 'essay' && (
            <Textarea
              placeholder="Nhập câu trả lời của bạn..."
              value={userAnswers[currentQuestion._id] as string || ''}
              onChange={(e) => handleTextChange(currentQuestion._id, e.target.value)}
              className="min-h-[150px]"
            />
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <div>
            <Button 
              variant="outline" 
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Câu trước
            </Button>
          </div>
          
          <div>
            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <Button onClick={() => setShowConfirmSubmit(true)}>
                Nộp bài
              </Button>
            ) : (
              <Button onClick={handleNextQuestion}>
                Câu tiếp
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
      
      {/* Question navigation */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium mb-3">Chuyển đến câu hỏi:</h3>
        <div className="flex flex-wrap gap-2">
          {quiz.questions.map((question, index) => {
            const isAnswered = !!userAnswers[question._id]
            const isCurrent = index === currentQuestionIndex
            
            return (
              <Button
                key={question._id}
                variant={isCurrent ? 'default' : isAnswered ? 'outline' : 'ghost'}
                size="sm"
                className={`w-10 h-10 ${isAnswered && !isCurrent ? 'bg-gray-100' : ''}`}
                onClick={() => setCurrentQuestionIndex(index)}
              >
                {index + 1}
              </Button>
            )
          })}
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button onClick={() => setShowConfirmSubmit(true)}>
            Nộp bài
          </Button>
        </div>
      </div>
      
      {/* Confirm submit dialog */}
      <Dialog open={showConfirmSubmit} onOpenChange={setShowConfirmSubmit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận nộp bài?</DialogTitle>
            <DialogDescription>
              Bạn đã trả lời {answeredCount} trên {quiz.questions.length} câu hỏi.
              {answeredCount < quiz.questions.length && (
                <span className="text-red-500 block mt-1">
                  Còn {quiz.questions.length - answeredCount} câu hỏi chưa được trả lời.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmSubmit(false)}>
              Tiếp tục làm bài
            </Button>
            <Button onClick={handleSubmitQuiz} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Nộp bài'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}