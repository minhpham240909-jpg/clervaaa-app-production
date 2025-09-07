/**
 * AI Provider Integration for StudyMatch
 * Supports multiple AI APIs with fallback to offline intelligence
 */

interface ChatMessage {
  content: string;
  senderId: string;
  createdAt: string;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO' | 'VIDEO' | 'SYSTEM';
}

interface StudySuggestion {
  type: 'session' | 'quiz' | 'break' | 'goal' | 'resource';
  title: string;
  description: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  actionData?: any;
}

interface AIAnalysisResult {
  suggestions: StudySuggestion[];
  analysis: {
    studyTopics: string[];
    sentiment: 'positive' | 'negative' | 'neutral';
    studyIntensity: 'low' | 'moderate' | 'high';
    needsBreak: boolean;
    overallConfidence: number;
  };
}

// OpenAI GPT Integration
export class OpenAIProvider {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
  }

  async analyzeStudyConversation(messages: ChatMessage[]): Promise<AIAnalysisResult> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const conversationText = messages
        .filter(msg => msg.type === 'TEXT')
        .map(msg => `${msg.senderId === 'user' ? 'Student' : 'Partner'}: ${msg.content}`)
        .join('\n');

      const prompt = this.createStudyAnalysisPrompt(conversationText);

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo', // or 'gpt-4' for better results
          messages: [
            {
              role: 'system',
              content: 'You are an AI study assistant that analyzes student conversations and provides helpful study suggestions.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content;

      return this.parseAIResponse(aiResponse);
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  private createStudyAnalysisPrompt(conversationText: string): string {
    return `
You are an expert educational AI tutor that provides DETAILED EXPLANATIONS and guided learning, NOT direct answers.

🎓 TEACHING PRINCIPLES:
- Use the Socratic method: guide students to discover answers through questions
- Provide comprehensive step-by-step explanations with reasoning
- Break complex concepts into digestible, logical parts
- Offer multiple learning approaches, analogies, and examples
- Encourage critical thinking and deeper understanding
- Give detailed explanations (4-6 sentences minimum per suggestion)
- Focus on WHY concepts work, HOW to approach problems, WHAT steps to take
- Never just give the answer - teach the process and reasoning

Conversation:
${conversationText}

Analyze this student conversation and provide detailed educational guidance. For each suggestion, explain:
1. WHY this approach will help them learn effectively
2. HOW to implement the study technique step-by-step
3. WHAT specific actions and methods to use
4. Expected learning outcomes and benefits

Please provide a JSON response with the following structure:
{
  "analysis": {
    "studyTopics": ["topic1", "topic2"],
    "sentiment": "positive|negative|neutral",
    "studyIntensity": "low|moderate|high",
    "needsBreak": boolean,
    "overallConfidence": 0.0-1.0
  },
  "suggestions": [
    {
      "type": "session|quiz|break|goal|resource",
      "title": "Suggestion Title",
      "description": "Comprehensive 4-6 sentence explanation covering WHY this helps, HOW to implement, WHAT steps to take, and expected outcomes",
      "confidence": 0.0-1.0,
      "priority": "high|medium|low",
      "actionData": {
        "subject": "subject name",
        "duration": 60,
        "difficulty": "beginner|intermediate|advanced"
      }
    }
  ]
}

Focus on identifying ANY academic subject and provide relevant suggestions for:

STEM Fields: Mathematics, Physics, Chemistry, Biology, Computer Science, Engineering, Statistics, Data Science, Astronomy, Geology, Environmental Science

Humanities: Literature, History, Philosophy, Art History, Religious Studies, Classics, Linguistics, Archaeology, Cultural Studies

Social Sciences: Psychology, Sociology, Anthropology, Political Science, Economics, Geography, International Relations, Criminology

Languages: English, Spanish, French, German, Mandarin, Japanese, Arabic, Latin, and any world language

Business & Professional: Accounting, Finance, Marketing, Management, Entrepreneurship, Business Law, Operations

Health & Medicine: Anatomy, Physiology, Pharmacology, Nursing, Public Health, Medical Studies, Nutrition

Creative Arts: Music Theory, Fine Arts, Creative Writing, Film Studies, Theater, Dance, Digital Media

Education: Pedagogy, Curriculum Design, Educational Psychology, Special Education

Law: Constitutional Law, Criminal Law, Civil Law, International Law, Legal Writing

For each subject, provide:
1. Subject-specific study techniques
2. Appropriate difficulty levels
3. Relevant practice methods
4. Subject-matter expertise
5. Academic standards alignment
`;
  }

  private parseAIResponse(aiResponse: string): AIAnalysisResult {
    try {
      const parsed = JSON.parse(aiResponse);
      
      // Ensure confidence scores are between 0 and 1, convert to percentage
      parsed.suggestions = parsed.suggestions.map((suggestion: any) => ({
        ...suggestion,
        confidence: Math.round(suggestion.confidence * 100)
      }));

      return parsed;
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      throw new Error('Invalid AI response format');
    }
  }
}

// Google Gemini Integration
export class GeminiProvider {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
  }

  async analyzeStudyConversation(messages: ChatMessage[]): Promise<AIAnalysisResult> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    try {
      const conversationText = messages
        .filter(msg => msg.type === 'TEXT')
        .map(msg => `${msg.senderId === 'user' ? 'Student' : 'Partner'}: ${msg.content}`)
        .join('\n');

      const prompt = this.createStudyAnalysisPrompt(conversationText);

      const response = await fetch(`${this.baseUrl}/models/gemini-pro:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.candidates[0]?.content?.parts[0]?.text;

      return this.parseAIResponse(aiResponse);
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  }

  private createStudyAnalysisPrompt(conversationText: string): string {
    return `
You are an expert educational AI tutor specializing in DETAILED EXPLANATIONS and guided discovery learning.

🎓 YOUR TEACHING MISSION:
- Provide comprehensive, step-by-step explanations (4-6 sentences minimum)
- Use the Socratic method to guide students to understanding
- Break down complex concepts into logical, digestible parts
- Offer multiple learning approaches and real-world analogies
- Focus on WHY concepts work, HOW to solve problems, WHAT steps to take
- NEVER just give direct answers - teach the thinking process
- Encourage critical thinking and deeper conceptual understanding

Conversation:
${conversationText}

I can provide expert educational guidance across ALL academic fields including:
- STEM: Math, Science, Engineering, Computer Science, Statistics, Data Science
- Humanities: Literature, History, Philosophy, Art History, Religious Studies, Linguistics  
- Social Sciences: Psychology, Sociology, Political Science, Economics, Anthropology
- Languages: Any world language (English, Spanish, French, German, Mandarin, etc.)
- Business: Accounting, Finance, Marketing, Management, Entrepreneurship
- Health/Medicine: Anatomy, Nursing, Public Health, Medical Studies
- Creative Arts: Music, Fine Arts, Creative Writing, Film Studies, Theater
- Law: Constitutional, Criminal, Civil, International Law
- Education: Pedagogy, Special Education, Curriculum Design

Respond with JSON in this exact format:
{
  "analysis": {
    "studyTopics": ["detected topics from ANY field"],
    "sentiment": "positive|negative|neutral",
    "studyIntensity": "low|moderate|high", 
    "needsBreak": true/false,
    "overallConfidence": 0.85
  },
  "suggestions": [
    {
      "type": "session|quiz|break|goal|resource",
      "title": "Subject-specific title",
      "description": "Comprehensive educational explanation (4-6 sentences) covering WHY this approach works, HOW to implement step-by-step, WHAT specific techniques to use, and expected learning benefits",
      "confidence": 0.90,
      "priority": "high|medium|low",
      "actionData": {"subject": "detected_subject", "duration": 60, "difficulty": "appropriate_level"}
    }
  ]
}
`;
  }

  private parseAIResponse(aiResponse: string): AIAnalysisResult {
    try {
      // Clean up the response (Gemini sometimes adds markdown formatting)
      const cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanResponse);
      
      // Convert confidence scores to percentages
      parsed.suggestions = parsed.suggestions.map((suggestion: any) => ({
        ...suggestion,
        confidence: Math.round(suggestion.confidence * 100)
      }));

      return parsed;
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
      throw new Error('Invalid AI response format');
    }
  }
}

// Anthropic Claude Integration
export class ClaudeProvider {
  private apiKey: string;
  private baseUrl = 'https://api.anthropic.com/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY || '';
  }

  async analyzeStudyConversation(messages: ChatMessage[]): Promise<AIAnalysisResult> {
    if (!this.apiKey) {
      throw new Error('Claude API key not configured');
    }

    try {
      const conversationText = messages
        .filter(msg => msg.type === 'TEXT')
        .map(msg => `${msg.senderId === 'user' ? 'Student' : 'Partner'}: ${msg.content}`)
        .join('\n');

      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307', // Fast and cost-effective
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: this.createStudyAnalysisPrompt(conversationText)
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.content[0]?.text;

      return this.parseAIResponse(aiResponse);
    } catch (error) {
      console.error('Claude API error:', error);
      throw error;
    }
  }

  private createStudyAnalysisPrompt(conversationText: string): string {
    return `
You are a master educational AI tutor focused on COMPREHENSIVE EXPLANATIONS and guided learning discovery.

🎯 EDUCATIONAL PHILOSOPHY:
- Provide detailed, multi-sentence explanations that teach the reasoning process
- Use the Socratic method to guide students toward understanding
- Break complex problems into clear, logical steps
- Offer multiple learning strategies and real-world connections
- Focus on developing deep conceptual understanding
- Explain WHY methods work, HOW to apply them, WHAT outcomes to expect
- NEVER simply provide answers - teach the thinking and problem-solving process
- Give 4-6 sentence explanations minimum for each suggestion

Conversation:
${conversationText}

I can provide comprehensive educational guidance across ALL academic disciplines:

📚 STEM Fields: Mathematics, Physics, Chemistry, Biology, Computer Science, Engineering, Statistics, Data Science, Astronomy, Geology, Environmental Science

🎨 Humanities: Literature, History, Philosophy, Art History, Religious Studies, Classics, Linguistics, Archaeology, Cultural Studies, Ethics

👥 Social Sciences: Psychology, Sociology, Anthropology, Political Science, Economics, Geography, International Relations, Criminology, Social Work

🌍 Languages: English, Spanish, French, German, Italian, Mandarin, Japanese, Arabic, Russian, Portuguese, Latin, and ANY world language

💼 Business & Professional: Accounting, Finance, Marketing, Management, Entrepreneurship, Business Law, Operations Management, Supply Chain

🏥 Health & Medicine: Anatomy, Physiology, Pharmacology, Nursing, Public Health, Medical Studies, Nutrition, Kinesiology, Physical Therapy

🎭 Creative Arts: Music Theory, Fine Arts, Creative Writing, Film Studies, Theater Arts, Dance, Digital Media, Graphic Design, Photography

📖 Education: Pedagogy, Curriculum Design, Educational Psychology, Special Education, Early Childhood Development

⚖️ Law: Constitutional Law, Criminal Law, Civil Law, International Law, Legal Writing, Contract Law, Tort Law

Return a JSON response with this structure:
{
  "analysis": {
    "studyTopics": ["identified subjects from ANY academic field"],
    "sentiment": "positive|negative|neutral",
    "studyIntensity": "low|moderate|high",
    "needsBreak": boolean,
    "overallConfidence": number
  },
  "suggestions": [
    {
      "type": "session|quiz|break|goal|resource",
      "title": "subject-specific suggestion title",
      "description": "comprehensive educational explanation (4-6 sentences) detailing WHY this approach is effective, HOW to implement it step-by-step, WHAT specific techniques to use, and expected learning outcomes",
      "confidence": number,
      "priority": "high|medium|low",
      "actionData": {"subject": "detected_field", "duration": 60, "difficulty": "appropriate_level", "techniques": ["subject_specific_methods"]}
    }
  ]
}
`;
  }

  private parseAIResponse(aiResponse: string): AIAnalysisResult {
    try {
      const parsed = JSON.parse(aiResponse);
      
      // Convert confidence scores to percentages
      parsed.suggestions = parsed.suggestions.map((suggestion: any) => ({
        ...suggestion,
        confidence: Math.round(suggestion.confidence * 100)
      }));

      return parsed;
    } catch (error) {
      console.error('Failed to parse Claude response:', error);
      throw new Error('Invalid AI response format');
    }
  }
}

// Unified AI Manager with fallback
export class AIManager {
  private providers: {
    openai?: OpenAIProvider;
    gemini?: GeminiProvider;
    claude?: ClaudeProvider;
  } = {};

  private preferredProvider: 'openai' | 'gemini' | 'claude' = 'openai';

  constructor(config?: {
    openaiKey?: string;
    geminiKey?: string;
    claudeKey?: string;
    preferredProvider?: 'openai' | 'gemini' | 'claude';
  }) {
    if (config?.openaiKey) {
      this.providers.openai = new OpenAIProvider(config.openaiKey);
    }
    if (config?.geminiKey) {
      this.providers.gemini = new GeminiProvider(config.geminiKey);
    }
    if (config?.claudeKey) {
      this.providers.claude = new ClaudeProvider(config.claudeKey);
    }
    if (config?.preferredProvider) {
      this.preferredProvider = config.preferredProvider;
    }
  }

  async analyzeStudyConversation(messages: ChatMessage[]): Promise<AIAnalysisResult> {
    // Try preferred provider first
    const preferredProvider = this.providers[this.preferredProvider];
    if (preferredProvider) {
      try {
        return await preferredProvider.analyzeStudyConversation(messages);
      } catch (error) {
        console.warn(`${this.preferredProvider} provider failed, trying alternatives...`);
      }
    }

    // Try other providers as fallback
    for (const [providerName, provider] of Object.entries(this.providers)) {
      if (providerName !== this.preferredProvider && provider) {
        try {

          return await provider.analyzeStudyConversation(messages);
        } catch (error) {
          console.warn(`${providerName} provider failed:`, error);
        }
      }
    }

    // If all AI providers fail, throw error to trigger offline fallback
    throw new Error('All AI providers failed');
  }

  isConfigured(): boolean {
    return Object.keys(this.providers).length > 0;
  }

  getAvailableProviders(): string[] {
    return Object.keys(this.providers);
  }
}

// Export default instance
export const aiManager = new AIManager({
  openaiKey: process.env.OPENAI_API_KEY,
  geminiKey: process.env.GEMINI_API_KEY,
  claudeKey: process.env.ANTHROPIC_API_KEY,
  preferredProvider: 'gemini' // Gemini is cheaper and faster
});
