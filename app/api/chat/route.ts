import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AIService from '@/lib/ai'
import AIFallbackService from '@/lib/ai-fallback'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { message, chatId, type = 'general' } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    let aiResponse: any

    try {
      // Check if we should use fallback mode
      if (AIFallbackService.shouldUseFallback()) {
        aiResponse = AIFallbackService.generateChatResponse(message)
      } else {
        // Try to use AI service
        switch (type) {
          case 'study-help':
            aiResponse = await AIService.generateStudyHelp({
              question: message,
              context: 'general study assistance'
            })
            break
          case 'quiz':
            aiResponse = await AIService.generateQuiz({
              content: message,
              questionCount: 5
            })
            break
          case 'summary':
            aiResponse = await AIService.generateSummary({
              content: message
            })
            break
          case 'flashcards':
            aiResponse = await AIService.generateFlashcards({
              content: message
            })
            break
          default:
            aiResponse = await AIService.chat({
              message,
              context: 'study platform assistant'
            })
        }
      }
    } catch (error) {
      console.error('AI service error, falling back:', error)
      aiResponse = AIFallbackService.generateChatResponse(message)
    }

    // Store the interaction in database
    try {
      await prisma.aIInteraction.create({
        data: {
          userId: user.id,
          interactionType: type,
          inputData: JSON.stringify({ message, chatId }),
          outputData: JSON.stringify(aiResponse),
          responseTime: 1000, // placeholder
          tokensUsed: message.length + (aiResponse.content?.length || 0),
          cost: 0.001 // placeholder
        }
      })
    } catch (dbError) {
      console.error('Failed to store AI interaction:', dbError)
      // Continue without storing - don't fail the request
    }

    // Store chatbot message if it's a general chat
    if (type === 'general') {
      try {
        await prisma.chatbotMessage.create({
          data: {
            userId: user.id,
            message,
            response: aiResponse.content || 'No response generated',
            context: JSON.stringify({ type, chatId })
          }
        })
      } catch (dbError) {
        console.error('Failed to store chatbot message:', dbError)
      }
    }

    return NextResponse.json({
      response: aiResponse.content || 'I apologize, but I encountered an issue generating a response.',
      type: aiResponse.type || 'text',
      metadata: {
        ...aiResponse.metadata,
        interactionType: type,
        userId: user.id,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Chat API error:', error)
    
    // Return fallback response on any error
    const fallback = AIFallbackService.generateChatResponse('Error occurred')
    
    return NextResponse.json({
      response: fallback.content,
      type: 'text',
      metadata: {
        ...fallback.metadata,
        error: 'Service temporarily unavailable'
      }
    }, { status: 200 }) // Return 200 to avoid breaking the UI
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get recent chat history
    const recentChats = await prisma.chatbotMessage.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Get AI interaction stats
    const interactionStats = await prisma.aIInteraction.aggregate({
      where: { userId: user.id },
      _count: { id: true },
      _sum: { tokensUsed: true, cost: true }
    })

    return NextResponse.json({
      recentChats,
      stats: {
        totalInteractions: interactionStats._count.id || 0,
        totalTokens: interactionStats._sum.tokensUsed || 0,
        totalCost: interactionStats._sum.cost || 0
      },
      fallbackStatus: AIFallbackService.getFallbackStatus()
    })
  } catch (error) {
    console.error('Chat history API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    )
  }
}
