'use client'

import { useState, useRef } from 'react'
import { FileText, CreditCard, Loader2, Copy, Download, RefreshCw, Upload, Image, File } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Flashcard {
  id: string
  front: string
  back: string
  difficulty: string
}

export default function SummariesFlashcards() {
  const [content, setContent] = useState('')
  const [summary, setSummary] = useState('')
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [activeTab, setActiveTab] = useState<'summaries' | 'flashcards'>('summaries')
  const [isLoading, setIsLoading] = useState(false)
  const [flashcardIndex, setFlashcardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Summary settings
  const [summaryStyle, setSummaryStyle] = useState<'paragraph' | 'bullet' | 'outline'>('paragraph')
  const [maxLength, setMaxLength] = useState(200)

  // Flashcard settings
  const [flashcardCount, setFlashcardCount] = useState(10)
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')

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

  const generateSummary = async () => {
    if (!content.trim()) {
      toast.error('Please enter some content to summarize')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/ai/summaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          maxLength,
          style: summaryStyle,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate summary')
      }

      const data = await response.json()
      setSummary(data.summary)
      toast.success('Summary generated successfully!')
    } catch (error) {
      toast.error('Failed to generate summary')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateFlashcards = async () => {
    if (!content.trim()) {
      toast.error('Please enter some content to create flashcards')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/ai/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          count: flashcardCount,
          difficulty,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate flashcards')
      }

      const data = await response.json()
      setFlashcards(data.flashcards)
      setFlashcardIndex(0)
      setShowAnswer(false)
      toast.success(`Generated ${data.flashcards.length} flashcards!`)
    } catch (error) {
      toast.error('Failed to generate flashcards')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const copySummary = () => {
    navigator.clipboard.writeText(summary)
    toast.success('Summary copied to clipboard!')
  }

  const nextFlashcard = () => {
    if (flashcardIndex < flashcards.length - 1) {
      setFlashcardIndex(flashcardIndex + 1)
      setShowAnswer(false)
    }
  }

  const previousFlashcard = () => {
    if (flashcardIndex > 0) {
      setFlashcardIndex(flashcardIndex - 1)
      setShowAnswer(false)
    }
  }

  const currentCard = flashcards[flashcardIndex]

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          AI Summaries & Flashcards
        </h1>
        <p className="text-neutral-600">
          Generate study summaries and flashcards from your content using AI
        </p>
      </div>

      {/* Input Section */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Enter Your Content
        </h2>
        
        {/* File Upload Section */}
        <div className="mb-4 p-4 border-2 border-dashed border-neutral-300 rounded-lg bg-neutral-50">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-neutral-400 mb-2" />
            <p className="text-sm text-neutral-600 mb-2">
              Upload files for better AI analysis
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
          placeholder="Paste your study material, notes, or any content you want to summarize or create flashcards from..."
          className="w-full h-32 p-4 border border-neutral-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="text-sm text-neutral-500 mt-2">
          {content.length}/10,000 characters
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-neutral-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('summaries')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'summaries'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <FileText className="h-4 w-4 inline mr-2" />
          Summaries
        </button>
        <button
          onClick={() => setActiveTab('flashcards')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'flashcards'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <CreditCard className="h-4 w-4 inline mr-2" />
          Flashcards
        </button>
      </div>

      {/* Summaries Tab */}
      {activeTab === 'summaries' && (
        <div className="space-y-6">
          {/* Summary Settings */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Summary Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Style</label>
                <select
                  value={summaryStyle}
                  onChange={(e: any) => setSummaryStyle(e.target.value as any)}
                  className="w-full p-3 border border-neutral-300 rounded-lg"
                >
                  <option value="paragraph">Paragraph</option>
                  <option value="bullet">Bullet Points</option>
                  <option value="outline">Outline</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Max Length: {maxLength} words
                </label>
                <input
                  type="range"
                  min="50"
                  max="500"
                  value={maxLength}
                  onChange={(e: any) => setMaxLength(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
            <button
              onClick={generateSummary}
              disabled={isLoading || !content.trim()}
              className="mt-4 btn-primary flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              Generate Summary
            </button>
          </div>

          {/* Summary Result */}
          {summary && (
            <div className="card p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Generated Summary</h3>
                <div className="flex gap-2">
                  <button
                    onClick={copySummary}
                    className="p-2 text-neutral-600 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="prose max-w-none">
                <div className="bg-neutral-50 p-4 rounded-lg whitespace-pre-wrap">
                  {summary}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Flashcards Tab */}
      {activeTab === 'flashcards' && (
        <div className="space-y-6">
          {/* Flashcard Settings */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Flashcard Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Number of Cards: {flashcardCount}
                </label>
                <input
                  type="range"
                  min="5"
                  max="20"
                  value={flashcardCount}
                  onChange={(e: any) => setFlashcardCount(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
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
              onClick={generateFlashcards}
              disabled={isLoading || !content.trim()}
              className="mt-4 btn-primary flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="h-4 w-4" />
              )}
              Generate Flashcards
            </button>
          </div>

          {/* Flashcard Viewer */}
          {flashcards.length > 0 && (
            <div className="card p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">
                  Flashcard {flashcardIndex + 1} of {flashcards.length}
                </h3>
                <div className="text-sm text-neutral-600">
                  Difficulty: <span className="capitalize">{currentCard?.difficulty}</span>
                </div>
              </div>

              {/* Flashcard */}
              <div
                className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-8 min-h-[200px] flex items-center justify-center cursor-pointer transition-all hover:shadow-lg"
                onClick={() => setShowAnswer(!showAnswer)}
              >
                <div className="text-center">
                  <div className="text-lg font-medium mb-4">
                    {showAnswer ? 'Answer:' : 'Question:'}
                  </div>
                  <div className="text-xl">
                    {showAnswer ? currentCard?.back : currentCard?.front}
                  </div>
                  <div className="text-sm text-neutral-600 mt-4">
                    Click to {showAnswer ? 'hide' : 'reveal'} answer
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={previousFlashcard}
                  disabled={flashcardIndex === 0}
                  className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <div className="flex gap-2">
                  {flashcards.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === flashcardIndex ? 'bg-blue-600' : 'bg-neutral-300'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={nextFlashcard}
                  disabled={flashcardIndex === flashcards.length - 1}
                  className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}