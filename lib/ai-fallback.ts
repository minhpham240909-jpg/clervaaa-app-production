/**
 * AI Fallback Service
 * 
 * Provides fallback responses when AI services are unavailable
 * or when running in environments without AI API access
 */

export interface AIFallbackResponse {
  content: string
  type: 'text' | 'json' | 'error'
  metadata?: Record<string, any>
}

export class AIFallbackService {
  /**
   * Generate fallback response for chat interactions
   */
  static generateChatResponse(userMessage: string): AIFallbackResponse {
    const fallbackResponses = [
      "I'm currently running in fallback mode. While I can't provide AI-powered responses right now, I'm here to help with basic functionality.",
      "AI services are temporarily unavailable, but you can still use all the core features of the study platform.",
      "I'm in offline mode at the moment. You can continue using the app for partner matching, messaging, and study sessions.",
      "AI features are currently limited, but all your study tools and partner connections are still available."
    ]

    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]

    return {
      content: randomResponse,
      type: 'text',
      metadata: {
        isFallback: true,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Generate fallback response for study summaries
   */
  static generateStudySummary(content: string): AIFallbackResponse {
    return {
      content: JSON.stringify({
        summary: "AI summary generation is currently unavailable. Please review your study materials manually.",
        keyPoints: [
          "AI services are temporarily offline",
          "Manual review recommended",
          "Core study features remain available"
        ],
        confidence: 0,
        isFallback: true
      }),
      type: 'json',
      metadata: {
        isFallback: true,
        originalContentLength: content.length
      }
    }
  }

  /**
   * Generate fallback response for flashcard creation
   */
  static generateFlashcards(content: string): AIFallbackResponse {
    return {
      content: JSON.stringify({
        flashcards: [
          {
            front: "AI Flashcard Generation",
            back: "Currently unavailable - please create flashcards manually",
            difficulty: "basic"
          }
        ],
        totalGenerated: 1,
        isFallback: true
      }),
      type: 'json',
      metadata: {
        isFallback: true,
        originalContentLength: content.length
      }
    }
  }

  /**
   * Generate fallback response for quiz generation
   */
  static generateQuiz(content: string, questionCount: number = 5): AIFallbackResponse {
    const questions = Array.from({ length: Math.min(questionCount, 3) }, (_, i) => ({
      id: `fallback_${i + 1}`,
      question: `AI quiz generation is currently unavailable. Question ${i + 1} placeholder.`,
      options: [
        "AI services offline",
        "Manual quiz creation recommended",
        "Core features still available",
        "Try again later"
      ],
      correctAnswer: 0,
      explanation: "This is a fallback response while AI services are unavailable."
    }))

    return {
      content: JSON.stringify({
        questions,
        totalQuestions: questions.length,
        isFallback: true,
        message: "AI quiz generation is temporarily unavailable"
      }),
      type: 'json',
      metadata: {
        isFallback: true,
        requestedQuestions: questionCount,
        originalContentLength: content.length
      }
    }
  }

  /**
   * Generate fallback response for partner matching
   */
  static generatePartnerMatches(preferences: any): AIFallbackResponse {
    return {
      content: JSON.stringify({
        matches: [
          {
            id: 'fallback_partner_1',
            name: 'Study Partner (Demo)',
            compatibility: 75,
            subjects: preferences.subjects?.slice(0, 2) || ['General Studies'],
            learningStyle: preferences.learningStyle || 'mixed',
            matchReasons: [
              'Similar study interests',
              'Compatible schedule',
              'Active community member'
            ],
            isFallback: true
          }
        ],
        totalFound: 1,
        isFallback: true,
        message: "AI partner matching is running in demo mode"
      }),
      type: 'json',
      metadata: {
        isFallback: true,
        preferences
      }
    }
  }

  /**
   * Generate fallback response for progress analysis
   */
  static generateProgressAnalysis(studyData: any): AIFallbackResponse {
    return {
      content: JSON.stringify({
        analysis: {
          overallProgress: "AI analysis temporarily unavailable",
          strengths: ["Consistent study habits", "Regular platform usage"],
          improvements: ["Continue current study patterns", "Explore manual tracking tools"],
          recommendations: [
            "AI insights are temporarily offline",
            "Manual progress tracking recommended",
            "Continue using core study features"
          ]
        },
        score: 75,
        isFallback: true
      }),
      type: 'json',
      metadata: {
        isFallback: true,
        studyDataLength: JSON.stringify(studyData).length
      }
    }
  }

  /**
   * Check if AI services should use fallback mode
   */
  static shouldUseFallback(): boolean {
    // Check for missing environment variables
    const hasOpenAI = !!process.env.OPENAI_API_KEY
    const hasGemini = !!process.env.GEMINI_API_KEY
    const hasClaude = !!process.env.ANTHROPIC_API_KEY
    
    // If no AI keys are available, use fallback
    if (!hasOpenAI && !hasGemini && !hasClaude) {
      return true
    }

    // Check for explicit fallback mode
    if (process.env.AI_FALLBACK_MODE === 'true') {
      return true
    }

    return false
  }

  /**
   * Get fallback status information
   */
  static getFallbackStatus() {
    return {
      isActive: this.shouldUseFallback(),
      reason: this.shouldUseFallback() ? 'AI services unavailable or disabled' : null,
      availableServices: {
        openai: !!process.env.OPENAI_API_KEY,
        gemini: !!process.env.GEMINI_API_KEY,
        claude: !!process.env.ANTHROPIC_API_KEY
      }
    }
  }
}

export default AIFallbackService
