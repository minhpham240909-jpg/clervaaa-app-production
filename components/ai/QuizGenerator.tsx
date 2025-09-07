'use client'

import { useState, useRef } from 'react'
import { HelpCircle, CheckCircle, XCircle, RotateCcw, Trophy, Timer, Upload, File, Image, Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface QuizQuestion {
  id: string
  type: 'multiple-choice' | 'true-false' | 'short-answer'
  question: string
  options?: string[]
  correctAnswer: string
  explanation: string
}

interface UserAnswer {
  questionId: string
  answer: string
  isCorrect: boolean
}

export default function QuizGenerator() {
  const [content, setContent] = useState('')
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null)
  const [quizEndTime, setQuizEndTime] = useState<Date | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Quiz settings
  const [questionCount, setQuestionCount] = useState(5)
  const [questionTypes, setQuestionTypes] = useState<string[]>(['multiple-choice', 'true-false'])
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')

  const generateQuiz = async () => {
    if (!content.trim()) {
      toast.error('Please enter some content to create a quiz')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          questionCount,
          questionTypes: questionTypes as ('multiple-choice' | 'true-false' | 'short-answer')[],
          difficulty,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate quiz')
      }

      const data = await response.json()
      setQuestions(data.questions)
      setCurrentQuestionIndex(0)
      setUserAnswers([])
      setSelectedAnswer('')
      setShowResults(false)
      setQuizStartTime(new Date())
      setQuizEndTime(null)
      toast.success(`Generated ${data.questions.length} quiz questions!`)
    } catch (error) {
      toast.error('Failed to generate quiz')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswerSubmit = () => {
    if (!selectedAnswer.trim()) {
      toast.error('Please select an answer')
      return
    }

    const currentQuestion = questions[currentQuestionIndex]
    const isCorrect = selectedAnswer.toLowerCase() === currentQuestion.correctAnswer.toLowerCase()
    
    setUserAnswers([
      ...userAnswers,
      {
        questionId: currentQuestion.id,
        answer: selectedAnswer,
        isCorrect,
      }
    ])

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer('')
    } else {
      setShowResults(true)
      setQuizEndTime(new Date())
    }
  }

  const restartQuiz = () => {
    setCurrentQuestionIndex(0)
    setUserAnswers([])
    setSelectedAnswer('')
    setShowResults(false)
    setQuizStartTime(new Date())
    setQuizEndTime(null)
  }

  const toggleQuestionType = (type: string) => {
    if (questionTypes.includes(type)) {
      setQuestionTypes(questionTypes.filter((t: any) => t !== type))
    } else {
      setQuestionTypes([...questionTypes, type])
    }
  }

  // File upload functions
  const handleFileUpload = async (files: FileList) => {
    const validFiles: File[] = []
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'image/jpeg', 
      'image/png',
      'image/jpg',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    Array.from(files).forEach(file => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name}: File type not supported`)
        return
      }
      if (file.size > maxSize) {
        toast.error(`${file.name}: File too large (max 10MB)`)
        return
      }
      validFiles.push(file)
    })

    if (validFiles.length === 0) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      validFiles.forEach((file, index) => {
        formData.append(`file${index}`, file)
      })

      const response = await fetch('/api/ai/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setContent(prev => prev + '\n\n' + data.extractedText)
      setUploadedFiles(prev => [...prev, ...validFiles])
      toast.success(`Successfully uploaded ${validFiles.length} file(s)`)
    } catch (error) {
      toast.error('Failed to upload files')
      console.error(error)
    } finally {
      setIsUploading(false)
    }
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const calculateScore = () => {
    const correct = userAnswers.filter((answer: any) => answer.isCorrect).length
    return Math.round((correct / questions.length) * 100)
  }

  const getTimeTaken = () => {
    if (!quizStartTime || !quizEndTime) return 0
    return Math.round((quizEndTime.getTime() - quizStartTime.getTime()) / 1000)
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          AI Quiz Generator
        </h1>
        <p className="text-neutral-600">
          Generate personalized quizzes from your study material using AI
        </p>
      </div>

      {!questions.length && (
        <>
          {/* Input Section */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-blue-600" />
              Enter Study Material
            </h2>
            
            {/* File Upload Section */}
            <div className="mb-4 p-4 border-2 border-dashed border-neutral-300 rounded-lg bg-neutral-50">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-neutral-400 mb-2" />
                <p className="text-sm text-neutral-600 mb-2">
                  Upload files for better quiz generation
                </p>
                <p className="text-xs text-neutral-500 mb-3">
                  Supports PDF, Word, Images (JPG, PNG) • Max 10MB per file
                </p>
                <button
                  onClick={triggerFileUpload}
                  disabled={isUploading}
                  className="btn-secondary flex items-center gap-2 mx-auto"
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {isUploading ? 'Uploading...' : 'Choose Files'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  onChange={(e: any) => e.target.files && handleFileUpload(e.target.files)}
                  className="hidden"
                />
              </div>

              {/* Uploaded Files Display */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-neutral-700">Uploaded Files:</p>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                      <div className="flex items-center gap-2">
                        {file.type.includes('image') ? (
                          <Image className="h-4 w-4 text-blue-500" />
                        ) : (
                          <File className="h-4 w-4 text-neutral-500" />
                        )}
                        <span className="text-sm text-neutral-700 truncate max-w-48">
                          {file.name}
                        </span>
                        <span className="text-xs text-neutral-500">
                          ({(file.size / 1024 / 1024).toFixed(1)}MB)
                        </span>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <RefreshCw className="h-3 w-3 rotate-45" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <textarea
              value={content}
              onChange={(e: any) => setContent(e.target.value)}
              placeholder="Paste your study material, textbook chapter, notes, or any content you want to create a quiz from..."
              className="w-full h-32 p-4 border border-neutral-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="text-sm text-neutral-500 mt-2">
              {content.length}/10,000 characters
            </div>
          </div>

          {/* Quiz Settings */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Quiz Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Question Count */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Number of Questions: {questionCount}
                </label>
                <input
                  type="range"
                  min="3"
                  max="15"
                  value={questionCount}
                  onChange={(e: any) => setQuestionCount(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Question Types */}
              <div>
                <label className="block text-sm font-medium mb-2">Question Types</label>
                <div className="space-y-2">
                  {[
                    { key: 'multiple-choice', label: 'Multiple Choice' },
                    { key: 'true-false', label: 'True/False' },
                    { key: 'short-answer', label: 'Short Answer' },
                  ].map((type: any) => (
                    <label key={type.key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={questionTypes.includes(type.key)}
                        onChange={() => toggleQuestionType(type.key)}
                        className="mr-2"
                      />
                      <span className="text-sm">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium mb-2">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e: any) => setDifficulty(e.target.value as any)}
                  className="w-full p-3 border border-neutral-300 rounded-lg"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <button
              onClick={generateQuiz}
              disabled={isLoading || !content.trim() || questionTypes.length === 0}
              className="mt-6 btn-primary flex items-center gap-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <HelpCircle className="h-4 w-4" />
              )}
              Generate Quiz
            </button>
          </div>
        </>
      )}

      {/* Quiz Results */}
      {showResults && (
        <div className="card p-6">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <Trophy className="h-10 w-10 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
            <div className="text-lg text-neutral-600 mb-4">
              Your Score: <span className="font-bold text-green-600">{calculateScore()}%</span>
            </div>
            <div className="flex items-center justify-center gap-4 text-sm text-neutral-600">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                {userAnswers.filter((a: any) => a.isCorrect).length} Correct
              </div>
              <div className="flex items-center gap-1">
                <XCircle className="h-4 w-4 text-red-600" />
                {userAnswers.filter((a: any) => !a.isCorrect).length} Incorrect
              </div>
              <div className="flex items-center gap-1">
                <Timer className="h-4 w-4 text-blue-600" />
                {getTimeTaken()}s
              </div>
            </div>
          </div>

          {/* Question Review */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {questions.map((question, index) => {
              const userAnswer = userAnswers.find(a => a.questionId === question.id)
              return (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-medium">Question {index + 1}</div>
                    <div className={`flex items-center gap-1 text-sm ${
                      userAnswer?.isCorrect ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {userAnswer?.isCorrect ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      {userAnswer?.isCorrect ? 'Correct' : 'Incorrect'}
                    </div>
                  </div>
                  <div className="text-neutral-700 mb-2">{question.question}</div>
                  <div className="text-sm text-neutral-600">
                    <div>Your answer: <span className="font-medium">{userAnswer?.answer}</span></div>
                    <div>Correct answer: <span className="font-medium text-green-600">{question.correctAnswer}</span></div>
                    <div className="mt-2 p-2 bg-blue-50 rounded text-blue-800">{question.explanation}</div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={restartQuiz}
              className="btn-outline flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Retake Quiz
            </button>
            <button
              onClick={() => {
                setQuestions([])
                setUserAnswers([])
                setShowResults(false)
              }}
              className="btn-primary"
            >
              Generate New Quiz
            </button>
          </div>
        </div>
      )}

      {/* Quiz Taking Interface */}
      {questions.length > 0 && !showResults && (
        <div className="card p-6">
          {/* Progress */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-neutral-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
            <div className="flex gap-2">
              {questions.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index < currentQuestionIndex 
                      ? 'bg-green-500' 
                      : index === currentQuestionIndex 
                      ? 'bg-blue-500' 
                      : 'bg-neutral-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Question */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">{currentQuestion.question}</h3>
            
            {/* Multiple Choice Options */}
            {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <label key={index} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-neutral-50">
                    <input
                      type="radio"
                      name="answer"
                      value={option}
                      checked={selectedAnswer === option}
                      onChange={(e: any) => setSelectedAnswer(e.target.value)}
                      className="mr-3"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}

            {/* True/False */}
            {currentQuestion.type === 'true-false' && (
              <div className="space-y-3">
                {['True', 'False'].map((option: any) => (
                  <label key={option} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-neutral-50">
                    <input
                      type="radio"
                      name="answer"
                      value={option}
                      checked={selectedAnswer === option}
                      onChange={(e: any) => setSelectedAnswer(e.target.value)}
                      className="mr-3"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Short Answer */}
            {currentQuestion.type === 'short-answer' && (
              <input
                type="text"
                value={selectedAnswer}
                onChange={(e: any) => setSelectedAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full p-3 border border-neutral-300 rounded-lg"
              />
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              onClick={handleAnswerSubmit}
              disabled={!selectedAnswer.trim()}
              className="btn-primary"
            >
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}