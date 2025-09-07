import OpenAI from 'openai';
import { getFeatureConfig } from './ai-routing-config';

// AI Service Configuration
const AI_CONFIG = {
  openai: {
    enabled: process.env.OPENAI_API_KEY && 
             !process.env.OPENAI_API_KEY.includes('fake') && 
             !process.env.OPENAI_API_KEY.includes('demo') &&
             process.env.OPENAI_API_KEY.startsWith('sk-'),
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '1500'),
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
  },
  mindgrasp: {
    enabled: !!process.env.MINDGRASP_API_KEY,
  },
  studyfetch: {
    enabled: !!process.env.STUDYFETCH_API_KEY,
  },
  monic: {
    enabled: !!process.env.MONIC_API_KEY,
  }
};

// Initialize OpenAI client
const openai = AI_CONFIG.openai.enabled ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
}) : null;

// Log AI service status (only in development)
if (process.env.NODE_ENV === 'development') {

  if (AI_CONFIG.openai.enabled) {

  }
}

// Helper functions for external API calls
async function callMindgraspAPI(endpoint: string, data: any) {
  if (!AI_CONFIG.mindgrasp.enabled) return null;
  
  try {
    const response = await fetch(`https://api.mindgrasp.ai/v1/${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MINDGRASP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Mindgrasp API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Mindgrasp API error:', error);
    return null;
  }
}

async function callStudyFetchAPI(endpoint: string, data: any) {
  if (!AI_CONFIG.studyfetch.enabled) return null;
  
  try {
    const response = await fetch(`https://api.studyfetch.com/v1/${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STUDYFETCH_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`StudyFetch API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('StudyFetch API error:', error);
    return null;
  }
}

async function callMonicAPI(endpoint: string, data: any) {
  if (!AI_CONFIG.monic.enabled) return null;
  
  try {
    const response = await fetch(`https://api.monic.ai/v1/${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MONIC_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Monic API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Monic API error:', error);
    return null;
  }
}

export interface SummaryRequest {
  content: string;
  maxLength?: number;
  style?: 'bullet' | 'paragraph' | 'outline';
}

export interface FlashcardRequest {
  content: string;
  count?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty: string;
}

export interface ProgressAnalysis {
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  overallScore: number;
  trends: {
    studyTime: number;
    completion: number;
    performance: number;
  };
}

export interface QuizRequest {
  content: string;
  questionCount?: number;
  questionTypes?: ('multiple-choice' | 'true-false' | 'short-answer')[];
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export interface PartnerMatchRequest {
  userId: string;
  preferences: {
    subjects: string[];
    learningStyle: string;
    studyTime: string;
    goals: string[];
  };
}

export class AIService {
  static async generateSummary(request: SummaryRequest): Promise<string> {
    // Try Mindgrasp.ai first
    if (AI_CONFIG.mindgrasp.enabled) {
      try {
        const mindgraspResult = await callMindgraspAPI('summarize', {
          content: request.content,
          maxLength: request.maxLength || 200,
          style: request.style || 'paragraph',
        });

        if (mindgraspResult?.summary) {
          return mindgraspResult.summary;
        }
      } catch (error) {
        console.error('Mindgrasp summary error:', error);
      }
    }

    // Fallback to OpenAI if Mindgrasp fails or is not available
    if (AI_CONFIG.openai.enabled && openai) {
      try {
        const prompt = `
          Create a ${request.style || 'paragraph'} style summary of the following content.
          Keep it under ${request.maxLength || 200} words.
          Focus on key concepts and main points.
          
          Content: ${request.content}
        `;

        const featureConfig = getFeatureConfig('summary');
        const completion = await openai.chat.completions.create({
          model: featureConfig.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: request.maxLength || featureConfig.maxTokens,
          temperature: featureConfig.temperature,
        });

        return completion.choices[0]?.message?.content || '';
      } catch (error) {
        console.error('OpenAI summary error:', error);
      }
    }

    // Demo mode fallback
    const demoSummaries = [
      "This content covers key concepts in the specified subject area. The main topics include fundamental principles, practical applications, and important methodologies. Key takeaways focus on understanding core relationships and applying knowledge effectively.",
      "The material presents essential information structured around central themes. Important concepts are organized to facilitate learning and comprehension. The content emphasizes practical understanding and real-world application of theoretical knowledge.",
      "This summary captures the primary learning objectives and key points. The content is designed to build foundational understanding while introducing advanced concepts progressively. Focus areas include critical thinking and practical problem-solving approaches."
    ];
    return demoSummaries[Math.floor(Math.random() * demoSummaries.length)];
  }

  static async generateFlashcards(request: FlashcardRequest): Promise<Flashcard[]> {
    // Try Mindgrasp.ai first
    if (AI_CONFIG.mindgrasp.enabled) {
      try {
        const mindgraspResult = await callMindgraspAPI('flashcards', {
          content: request.content,
          count: request.count || 10,
          difficulty: request.difficulty || 'medium',
        });

        if (mindgraspResult?.flashcards && Array.isArray(mindgraspResult.flashcards)) {
          return mindgraspResult.flashcards.map((card: any, index: number) => ({
            id: `flashcard-${index + 1}`,
            front: card.front || card.question,
            back: card.back || card.answer,
            difficulty: card.difficulty || request.difficulty || 'medium'
          }));
        }
      } catch (error) {
        console.error('Mindgrasp flashcards error:', error);
      }
    }

    // Fallback to OpenAI if Mindgrasp fails or is not available
    if (AI_CONFIG.openai.enabled && openai) {
      try {
        const prompt = `
          Create ${request.count || 10} flashcards from the following content.
          Format as JSON array with objects containing: front, back, difficulty.
          Make them ${request.difficulty || 'medium'} difficulty level.
          
          Content: ${request.content}
          
          Return only valid JSON array.
        `;

        const featureConfig = getFeatureConfig('flashcards');
        const completion = await openai.chat.completions.create({
          model: featureConfig.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: featureConfig.maxTokens,
          temperature: featureConfig.temperature,
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) return [];

        try {
          const flashcards = JSON.parse(content);
          return flashcards.map((card: any, index: number) => ({
            id: `flashcard-${index + 1}`,
            front: card.front,
            back: card.back,
            difficulty: card.difficulty || request.difficulty || 'medium'
          }));
        } catch {
          return [];
        }
      } catch (error) {
        console.error('OpenAI flashcards error:', error);
      }
    }

    // Demo mode fallback
    const demoCards = [
      { front: "What is the main concept covered?", back: "The fundamental principle that guides the subject matter", difficulty: request.difficulty || 'medium' },
      { front: "Why is this topic important?", back: "It forms the foundation for advanced learning and practical application", difficulty: request.difficulty || 'medium' },
      { front: "How does this connect to real-world scenarios?", back: "Through practical examples and case studies that demonstrate relevance", difficulty: request.difficulty || 'medium' },
      { front: "What are the key takeaways?", back: "Critical thinking, problem-solving, and application of learned concepts", difficulty: request.difficulty || 'medium' },
      { front: "How can this knowledge be applied?", back: "In various contexts requiring analytical thinking and systematic approaches", difficulty: request.difficulty || 'medium' },
    ];
    
    const selectedCards = demoCards.slice(0, request.count || 5);
    return selectedCards.map((card, index) => ({
      id: `flashcard-${index + 1}`,
      ...card
    }));
  }

  static async analyzeProgress(userId: string, studyData: any): Promise<ProgressAnalysis> {
    // Try StudyFetch first
    if (AI_CONFIG.studyfetch.enabled) {
      try {
        const studyFetchResult = await callStudyFetchAPI('progress-analysis', {
          userId,
          studyData,
        });

        if (studyFetchResult?.analysis) {
          return {
            strengths: studyFetchResult.analysis.strengths || [],
            weaknesses: studyFetchResult.analysis.weaknesses || [],
            suggestions: studyFetchResult.analysis.suggestions || [],
            overallScore: studyFetchResult.analysis.overallScore || 75,
            trends: studyFetchResult.analysis.trends || { studyTime: 0, completion: 0, performance: 0 }
          };
        }
      } catch (error) {
        console.error('StudyFetch progress analysis error:', error);
      }
    }

    // Fallback to OpenAI if StudyFetch fails or is not available
    if (AI_CONFIG.openai.enabled && openai) {
      try {
        const prompt = `
          Analyze this study progress data and provide insights:
          ${JSON.stringify(studyData)}
          
          Provide analysis in JSON format with:
          - strengths: array of strength areas
          - weaknesses: array of areas needing improvement  
          - suggestions: array of specific recommendations
          - overallScore: number 0-100
          - trends: object with studyTime, completion, performance percentages
        `;

        const featureConfig = getFeatureConfig('progressAnalysis');
        const completion = await openai.chat.completions.create({
          model: featureConfig.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: featureConfig.maxTokens,
          temperature: featureConfig.temperature,
        });

        const content = completion.choices[0]?.message?.content;
        if (content) {
          try {
            return JSON.parse(content);
          } catch {
            // Fall through to demo mode if parsing fails
          }
        }
      } catch (error) {
        console.error('OpenAI progress analysis error:', error);
      }
    }

    // Demo mode fallback
    return {
      strengths: [
        'Consistent daily study habits',
        'Strong focus on core subjects', 
        'Good progress tracking discipline',
        'Regular engagement with learning materials'
      ],
      weaknesses: [
        'Time management during peak hours',
        'Balancing multiple subjects effectively',
        'Breaking down large topics into manageable chunks'
      ],
      suggestions: [
        'Try the Pomodoro Technique for better time management',
        'Create subject-specific study schedules',
        'Use active recall methods during review sessions',
        'Set smaller, achievable daily goals',
        'Take regular breaks to maintain focus'
      ],
      overallScore: Math.floor(Math.random() * 30) + 70, // 70-100
      trends: {
        studyTime: Math.floor(Math.random() * 20) + 80, // 80-100%
        completion: Math.floor(Math.random() * 25) + 75, // 75-100%
        performance: Math.floor(Math.random() * 30) + 70, // 70-100%
      }
    };
  }

  static async generateQuiz(request: QuizRequest): Promise<QuizQuestion[]> {

    // Try Monic.ai first
    if (AI_CONFIG.monic.enabled) {
      try {
        const monicResult = await callMonicAPI('quiz', {
          content: request.content,
          questionCount: request.questionCount || 5,
          questionTypes: request.questionTypes || ['multiple-choice', 'true-false'],
          difficulty: request.difficulty || 'medium',
        });

        if (monicResult?.questions && Array.isArray(monicResult.questions)) {
          return monicResult.questions.map((q: any, index: number) => ({
            id: `question-${index + 1}`,
            type: q.type,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer || q.correct_answer,
            explanation: q.explanation
          }));
        }
      } catch (error) {
        console.error('Monic.ai quiz error:', error);
      }
    }

    // Fallback to OpenAI if Monic fails or is not available

    if (AI_CONFIG.openai.enabled && openai) {
      try {
        const prompt = `
          Generate ${request.questionCount || 5} quiz questions from this content.
          Question types: ${request.questionTypes?.join(', ') || 'multiple-choice, true-false'}
          Difficulty: ${request.difficulty || 'medium'}
          
          Content: ${request.content}
          
          Return JSON array with objects containing:
          - type: question type
          - question: the question text
          - options: array of options (for multiple choice)
          - correctAnswer: the correct answer
          - explanation: why this is correct
        `;

        const featureConfig = getFeatureConfig('quiz');

        const completion = await openai.chat.completions.create({
          model: featureConfig.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: featureConfig.maxTokens,
          temperature: featureConfig.temperature,
        });

        const content = completion.choices[0]?.message?.content;
        console.log('✅ OpenAI response received:', {
          hasContent: !!content,
          contentLength: content?.length,
          contentPreview: content?.slice(0, 200) + '...'
        });
        
        if (!content) {
          console.error('❌ No content received from OpenAI');
          return [];
        }

        try {

          // Strip markdown code blocks if present
          let cleanContent = content.trim();
          if (cleanContent.startsWith('```json')) {
            cleanContent = cleanContent.replace(/^```json\s*/, '');
          }
          if (cleanContent.startsWith('```')) {
            cleanContent = cleanContent.replace(/^```\s*/, '');
          }
          if (cleanContent.endsWith('```')) {
            cleanContent = cleanContent.replace(/\s*```$/, '');
          }
          
          console.log('🧹 Cleaned content for parsing:', cleanContent.slice(0, 200) + '...');
          
          const questions = JSON.parse(cleanContent);

          if (!Array.isArray(questions)) {
            console.error('❌ Response is not an array:', typeof questions);
            return [];
          }
          
          const mappedQuestions = questions.map((q: any, index: number) => ({
            id: `question-${index + 1}`,
            ...q
          }));

          return mappedQuestions;
        } catch (parseError) {
          console.error('❌ JSON parse failed:', parseError);
          console.error('❌ Raw content that failed to parse:', content);
          return [];
        }
      } catch (error) {
        console.error('OpenAI quiz error:', error);
      }
    }

    // Demo mode fallback

    const demoQuestions = [
      {
        type: 'multiple-choice' as const,
        question: 'What is the main focus of this study material?',
        options: ['Theoretical concepts', 'Practical applications', 'Historical context', 'All of the above'],
        correctAnswer: 'All of the above',
        explanation: 'Comprehensive study material typically covers theory, practice, and context.'
      },
      {
        type: 'true-false' as const,
        question: 'Understanding fundamental principles is crucial for advanced learning.',
        correctAnswer: 'True',
        explanation: 'Strong foundations enable better comprehension of complex topics.'
      },
      {
        type: 'short-answer' as const,
        question: 'Explain one key benefit of active learning.',
        correctAnswer: 'Improved retention and understanding through engagement',
        explanation: 'Active learning promotes deeper understanding and better retention.'
      },
      {
        type: 'multiple-choice' as const,
        question: 'Which study technique is most effective for long-term retention?',
        options: ['Cramming', 'Spaced repetition', 'Passive reading', 'Single sessions'],
        correctAnswer: 'Spaced repetition',
        explanation: 'Spaced repetition helps transfer information to long-term memory.'
      },
      {
        type: 'true-false' as const,
        question: 'Regular practice is more important than understanding theory.',
        correctAnswer: 'False',
        explanation: 'Both theory and practice are important for comprehensive learning.'
      }
    ];

    const selectedQuestions = demoQuestions.slice(0, request.questionCount || 5);
    return selectedQuestions.map((q, index) => ({
      id: `question-${index + 1}`,
      ...q
    }));
  }

  static async findPartnerMatches(request: PartnerMatchRequest): Promise<any[]> {
    // Use GPT-4 with custom advanced prompts for partner matching
    if (AI_CONFIG.openai.enabled && openai) {
      try {
        const customPrompt = `
        You are an advanced study buddy matching AI with expertise in educational psychology, learning theory, and peer collaboration dynamics. 

        Analyze the following user profile and preferences to generate sophisticated partner matching criteria:

        User Profile:
        - Subjects: ${request.preferences.subjects.join(', ')}
        - Learning Style: ${request.preferences.learningStyle}
        - Preferred Study Time: ${request.preferences.studyTime}
        - Goals: ${request.preferences.goals.join(', ')}

        Based on educational research and proven collaborative learning principles, provide a comprehensive analysis in JSON format with:

        1. compatibleLearningStyles: Array of learning styles that would complement this user (consider both similar and complementary styles)
        2. sharedSubjects: Array of subjects for optimal overlap and mutual benefit
        3. complementarySkills: Array of skills that would create synergistic learning partnerships
        4. studyTimeCompatibility: Detailed time preferences and scheduling flexibility
        5. personalityTraits: Array of personality characteristics that would foster productive collaboration
        6. motivationAlignment: Array of motivational factors that should align between partners
        7. experienceLevel: Recommended experience levels (similar, mixed, complementary)
        8. communicationStyle: Preferred communication methods and frequencies
        9. studyMethodPreferences: Array of study techniques that work well together
        10. availabilityFactors: Time zone, schedule flexibility, and commitment level considerations

        Consider psychological factors like:
        - Cognitive load theory for optimal challenge levels
        - Social learning theory for peer interaction benefits  
        - Motivation theory for sustained engagement
        - Diversity benefits vs similarity comfort zones

        Return detailed, research-backed matching criteria that will lead to successful long-term study partnerships.
        `;

        const featureConfig = getFeatureConfig('partnerMatching');
        const completion = await openai.chat.completions.create({
          model: featureConfig.model,
          messages: [
            { 
              role: 'system', 
              content: 'You are an expert educational psychologist and study buddy matching specialist with deep knowledge of collaborative learning research.' 
            },
            { role: 'user', content: customPrompt }
          ],
          max_tokens: featureConfig.maxTokens,
          temperature: featureConfig.temperature,
        });

        const content = completion.choices[0]?.message?.content;
        if (content) {
          try {
            return [JSON.parse(content)];
          } catch (parseError) {
            console.error('Error parsing GPT-4 response:', parseError);
            // Fall through to demo mode if parsing fails
          }
        }
      } catch (error) {
        console.error('GPT-4 partner matching error:', error);
      }
    }

    // Demo mode fallback
    return [
      {
        compatibleLearningStyles: ['visual', 'auditory'],
        sharedSubjects: request.preferences.subjects.slice(0, 2),
        complementarySkills: ['problem-solving', 'research', 'note-taking'],
        studyTimeCompatibility: request.preferences.studyTime,
        personalityTraits: ['collaborative', 'motivated', 'patient'],
        motivationAlignment: ['academic excellence', 'skill development'],
        experienceLevel: 'mixed',
        communicationStyle: ['video calls', 'text messaging'],
        studyMethodPreferences: ['active recall', 'spaced repetition'],
        availabilityFactors: ['flexible scheduling', 'regular commitment']
      }
    ];
  }

  // Added missing methods for compatibility
  static async generateStudyHelp(request: { question: string; context?: string }): Promise<any> {
    if (AI_CONFIG.openai.enabled && openai) {
      try {
        const prompt = `
          You are a helpful study assistant. Provide guidance for the following question:
          
          Question: ${request.question}
          Context: ${request.context || 'general study assistance'}
          
          Provide clear, actionable advice to help the student learn effectively.
        `;

        const completion = await openai.chat.completions.create({
          model: AI_CONFIG.openai.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: AI_CONFIG.openai.maxTokens,
          temperature: AI_CONFIG.openai.temperature,
        });

        return {
          content: completion.choices[0]?.message?.content || 'Unable to generate study help at this time.',
          type: 'study-help',
          metadata: { context: request.context }
        };
      } catch (error) {
        console.error('OpenAI study help error:', error);
      }
    }

    // Fallback response
    return {
      content: `Here are some general study tips for your question about "${request.question}":

1. Break down complex topics into smaller, manageable parts
2. Use active learning techniques like summarizing and teaching others
3. Practice regularly with spaced repetition
4. Connect new information to what you already know
5. Seek additional resources if needed

For more specific help, try rephrasing your question or providing more context.`,
      type: 'study-help',
      metadata: { fallback: true, context: request.context }
    };
  }

  static async chat(request: { message: string; context?: string }): Promise<any> {
    if (AI_CONFIG.openai.enabled && openai) {
      try {
        const prompt = `
          You are a friendly and helpful study assistant. Respond to the user's message in a conversational way.
          
          Context: ${request.context || 'study platform assistant'}
          User message: ${request.message}
          
          Provide a helpful, encouraging response.
        `;

        const completion = await openai.chat.completions.create({
          model: AI_CONFIG.openai.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: AI_CONFIG.openai.maxTokens,
          temperature: AI_CONFIG.openai.temperature,
        });

        return {
          content: completion.choices[0]?.message?.content || 'I apologize, but I\'m having trouble responding right now.',
          type: 'text',
          metadata: { context: request.context }
        };
      } catch (error) {
        console.error('OpenAI chat error:', error);
      }
    }

    // Fallback response
    return {
      content: `I'm here to help with your studies! While I'm running in limited mode right now, I can still provide general guidance and support. 

How can I assist you with your learning today? Feel free to ask about:
- Study strategies and techniques
- Time management tips
- Learning resources
- Academic motivation

What specific topic would you like help with?`,
      type: 'text',
      metadata: { fallback: true, context: request.context }
    };
  }
}

export default AIService;