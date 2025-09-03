"use client"

import { useState, useCallback, useEffect } from "react"

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctOption: number
  explanation?: string
}

export interface Quiz {
  id: string
  title: string
  questions: QuizQuestion[]
  timeLimit?: number // in seconds
  passingScore?: number // percentage
}

interface UseQuizParams {
  quiz: Quiz
  onComplete?: (score: number, isPassed: boolean) => void
  autoAdvance?: boolean
}

interface UseQuizReturn {
  currentQuestionIndex: number
  currentQuestion: QuizQuestion | null
  selectedAnswers: Record<string, number>
  isCompleted: boolean
  isCorrect: Record<string, boolean>
  score: number
  percentage: number
  isPassed: boolean
  timeRemaining: number | null
  isTimerRunning: boolean
  
  selectAnswer: (questionId: string, optionIndex: number) => void
  goToNextQuestion: () => void
  goToPreviousQuestion: () => void
  jumpToQuestion: (index: number) => void
  completeQuiz: () => void
  startTimer: () => void
  pauseTimer: () => void
  resetQuiz: () => void
}

export function useQuiz({
  quiz,
  onComplete,
  autoAdvance = false,
}: UseQuizParams): UseQuizReturn {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({})
  const [isCompleted, setIsCompleted] = useState(false)
  const [isCorrect, setIsCorrect] = useState<Record<string, boolean>>({})
  const [score, setScore] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    quiz.timeLimit ? quiz.timeLimit : null
  )
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  // Tự động bắt đầu bộ đếm thời gian nếu có thời hạn
  useEffect(() => {
    if (quiz.timeLimit && !isCompleted) {
      startTimer()
    }
    return () => {
      // Cleanup timer
      setIsTimerRunning(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz.timeLimit])

  // Xử lý bộ đếm thời gian
  useEffect(() => {
    let timerId: NodeJS.Timeout | undefined

    if (isTimerRunning && timeRemaining !== null && timeRemaining > 0) {
      timerId = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timerId)
            setIsTimerRunning(false)
            completeQuiz()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerId) clearInterval(timerId)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTimerRunning, timeRemaining])

  const currentQuestion = quiz.questions[currentQuestionIndex] || null

  const selectAnswer = useCallback((questionId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }))

    // Nếu chọn chế độ tự động chuyển câu hỏi
    if (autoAdvance && currentQuestionIndex < quiz.questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1)
      }, 500)
    }
  }, [autoAdvance, currentQuestionIndex, quiz.questions.length])

  const goToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }, [currentQuestionIndex, quiz.questions.length])

  const goToPreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }, [currentQuestionIndex])

  const jumpToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < quiz.questions.length) {
      setCurrentQuestionIndex(index)
    }
  }, [quiz.questions.length])

  const calculateScore = useCallback(() => {
    let correctCount = 0
    const correctMap: Record<string, boolean> = {}

    quiz.questions.forEach((question) => {
      const selectedAnswer = selectedAnswers[question.id]
      const isAnswerCorrect = selectedAnswer === question.correctOption
      correctMap[question.id] = isAnswerCorrect

      if (isAnswerCorrect) {
        correctCount++
      }
    })

    const calculatedScore = correctCount
    const percentage = Math.round((correctCount / quiz.questions.length) * 100)
    const isPassed = quiz.passingScore ? percentage >= quiz.passingScore : true

    setIsCorrect(correctMap)
    setScore(calculatedScore)

    return { score: calculatedScore, percentage, isPassed }
  }, [quiz.questions, quiz.passingScore, selectedAnswers])

  const completeQuiz = useCallback(() => {
    if (isCompleted) return

    const result = calculateScore()
    setIsCompleted(true)
    setIsTimerRunning(false)

    if (onComplete) {
      onComplete(result.score, result.isPassed)
    }
  }, [calculateScore, isCompleted, onComplete])

  const startTimer = useCallback(() => {
    if (timeRemaining !== null && timeRemaining > 0) {
      setIsTimerRunning(true)
    }
  }, [timeRemaining])

  const pauseTimer = useCallback(() => {
    setIsTimerRunning(false)
  }, [])

  const resetQuiz = useCallback(() => {
    setCurrentQuestionIndex(0)
    setSelectedAnswers({})
    setIsCompleted(false)
    setIsCorrect({})
    setScore(0)
    setTimeRemaining(quiz.timeLimit || null)
    setIsTimerRunning(false)
  }, [quiz.timeLimit])

  const { percentage, isPassed } = calculateScore()

  return {
    currentQuestionIndex,
    currentQuestion,
    selectedAnswers,
    isCompleted,
    isCorrect,
    score,
    percentage,
    isPassed,
    timeRemaining,
    isTimerRunning,
    
    selectAnswer,
    goToNextQuestion,
    goToPreviousQuestion,
    jumpToQuestion,
    completeQuiz,
    startTimer,
    pauseTimer,
    resetQuiz,
  }
}