import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api-utils';

export const runtime = 'nodejs'

export const GET = withErrorHandling(async (request: NextRequest) => {
  const apiDocs = {
    title: 'Clerva API Documentation',
    version: '1.0.0',
    description: 'Complete API documentation for the Clerva study matching platform',
    baseUrl: process.env.NEXTAUTH_URL || 'http://localhost:3001',
    endpoints: {
      // Authentication & User Management
      auth: {
        '/api/auth/[...nextauth]': {
          methods: ['GET', 'POST'],
          description: 'NextAuth.js authentication endpoints',
          auth: false,
        },
        '/api/user/profile': {
          methods: ['GET', 'PUT'],
          description: 'Get or update user profile information',
          auth: true,
          params: {
            GET: {
              query: {},
              response: {
                profile: 'User profile object',
                subjects: 'Array of user subjects',
                achievements: 'Array of earned achievements',
                goals: 'Array of active goals',
                partnerships: 'Array of study partnerships',
                stats: 'User statistics',
              },
            },
            PUT: {
              body: {
                name: 'string (optional)',
                bio: 'string (optional, max 500 chars)',
                university: 'string (optional)',
                major: 'string (optional)',
                studyLevel: 'enum: BEGINNER|INTERMEDIATE|ADVANCED|EXPERT',
                learningStyle: 'enum: visual|auditory|kinesthetic|reading',
                focusTime: 'number (5-120 minutes)',
                dailyGoalHours: 'number (0.5-24 hours)',
              },
              response: {
                profile: 'Updated profile object',
                message: 'Success message',
              },
            },
          },
        },
      },

      // Study Groups
      groups: {
        '/api/study-groups': {
          methods: ['GET', 'POST'],
          description: 'Manage study groups',
          auth: true,
          params: {
            GET: {
              query: {
                page: 'number (default: 1)',
                limit: 'number (default: 20, max: 50)',
                subjectId: 'string (optional)',
                search: 'string (optional)',
                myGroups: 'boolean (optional)',
              },
              response: {
                groups: 'Array of study group objects',
                pagination: 'Pagination metadata',
                filters: 'Applied filters',
              },
            },
            POST: {
              body: {
                name: 'string (required, max 100 chars)',
                description: 'string (optional, max 500 chars)',
                subjectId: 'string (optional)',
                maxMembers: 'number (2-50, default: 10)',
                isPrivate: 'boolean (default: false)',
                location: 'string (optional)',
                schedule: 'object (optional JSON)',
                tags: 'array of strings (optional)',
              },
              response: {
                group: 'Created group object',
                message: 'Success message with points earned',
              },
            },
          },
        },
        '/api/study-groups/[id]/join': {
          methods: ['POST', 'DELETE'],
          description: 'Join or leave a study group',
          auth: true,
          params: {
            POST: {
              body: {
                message: 'string (optional, max 300 chars)',
              },
              response: {
                success: 'boolean',
                message: 'Success message',
              },
            },
            DELETE: {
              response: {
                success: 'boolean',
                message: 'Success message',
              },
            },
          },
        },
      },

      // Goals Management
      goals: {
        '/api/goals': {
          methods: ['GET', 'POST', 'PATCH'],
          description: 'Manage personal study goals',
          auth: true,
          params: {
            GET: {
              query: {
                status: 'enum: ACTIVE|COMPLETED|PAUSED (optional)',
                category: 'enum: STUDY_TIME|SESSIONS|SUBJECTS|SKILLS|CUSTOM (optional)',
                limit: 'number (default: 50, max: 100)',
              },
              response: {
                goals: 'Array of goal objects with progress',
                stats: 'Goal statistics',
                filters: 'Applied filters',
              },
            },
            POST: {
              body: {
                title: 'string (required, max 200 chars)',
                description: 'string (optional, max 1000 chars)',
                targetValue: 'number (required, positive)',
                unit: 'string (e.g., hours, sessions, max 50 chars)',
                category: 'enum (default: CUSTOM)',
                priority: 'enum: LOW|MEDIUM|HIGH|CRITICAL (default: MEDIUM)',
                deadline: 'ISO datetime string (optional)',
                isPublic: 'boolean (default: false)',
              },
              response: {
                goal: 'Created goal object',
                message: 'Success message with points earned',
              },
            },
            PATCH: {
              query: {
                id: 'string (required - goal ID)',
              },
              body: {
                value: 'number (required, min: 0)',
                note: 'string (optional, max 300 chars)',
              },
              response: {
                goal: 'Updated goal object',
                pointsAwarded: 'number',
                message: 'Success message',
              },
            },
          },
        },
      },

      // Subjects
      subjects: {
        '/api/subjects': {
          methods: ['GET', 'POST', 'DELETE'],
          description: 'Manage subjects and user subject relationships',
          auth: true,
          params: {
            GET: {
              query: {
                category: 'string (optional)',
                userSubjects: 'boolean (optional - get user subjects only)',
              },
              response: {
                subjects: 'Array of subject objects',
                categories: 'Array of category objects (if userSubjects=false)',
                totalSubjects: 'number',
              },
            },
            POST: {
              body: {
                subjectId: 'string (required)',
                skillLevel: 'enum: BEGINNER|INTERMEDIATE|ADVANCED|EXPERT (default: BEGINNER)',
              },
              response: {
                userSubject: 'Added subject object',
                message: 'Success message with points earned',
              },
            },
            DELETE: {
              query: {
                subjectId: 'string (required)',
              },
              response: {
                success: 'boolean',
                message: 'Success message',
              },
            },
          },
        },
      },

      // Chat & AI
      chat: {
        '/api/chat': {
          methods: ['GET', 'POST'],
          description: 'AI chatbot interaction and conversation history',
          auth: true,
          rateLimit: 'Chat-specific rate limiting applied',
          params: {
            GET: {
              query: {
                limit: 'number (default: 20)',
                offset: 'number (default: 0)',
              },
              response: {
                conversations: 'Array of conversation objects',
                pagination: 'Pagination metadata',
              },
            },
            POST: {
              body: {
                message: 'string (required)',
                context: 'object (optional - conversation context)',
              },
              response: {
                response: 'AI-generated response string',
                timestamp: 'ISO datetime string',
                context: 'string - conversation type',
              },
            },
          },
        },
        '/api/chat/feedback': {
          methods: ['POST'],
          description: 'Submit feedback on AI responses',
          auth: true,
          params: {
            POST: {
              body: {
                messageId: 'string (required)',
                helpful: 'boolean (required)',
                feedback: 'string (optional)',
              },
              response: {
                success: 'boolean',
                message: 'Success message',
              },
            },
          },
        },
      },

      // Partner Matching
      partners: {
        '/api/partners/matching': {
          methods: ['GET', 'POST'],
          description: 'Find compatible study partners with AI scoring',
          auth: true,
          params: {
            GET: {
              description: 'Get matching algorithm information and available filters',
              response: {
                filters: 'Available filter options',
                algorithm: 'Algorithm details and scoring factors',
              },
            },
            POST: {
              body: {
                preferences: 'object (optional - matching preferences)',
                limit: 'number (optional - max matches to return)',
                includeAIScoring: 'boolean (optional - enable AI-enhanced scoring)',
              },
              response: {
                matches: 'Array of compatible partner objects with scores',
                metadata: 'Matching metadata and statistics',
                tips: 'Array of helpful tips for users',
              },
            },
          },
        },
      },

      // AI Services
      ai: {
        '/api/ai/study-plan': {
          methods: ['POST'],
          description: 'Generate personalized study plans using AI',
          auth: true,
          params: {
            POST: {
              body: {
                subjects: 'array of strings (required)',
                timeAvailable: 'number (hours per week)',
                goals: 'array of strings (optional)',
                preferences: 'object (optional)',
              },
              response: {
                studyPlan: 'Generated study plan object',
                recommendations: 'Array of study recommendations',
                timeline: 'Suggested timeline object',
              },
            },
          },
        },
        '/api/ai/progress-analysis': {
          methods: ['POST'],
          description: 'Analyze study progress and provide insights',
          auth: true,
          params: {
            POST: {
              body: {
                timeframe: 'string (e.g., week, month, quarter)',
                includeGoals: 'boolean (optional)',
              },
              response: {
                analysis: 'Progress analysis object',
                insights: 'Array of AI-generated insights',
                recommendations: 'Array of improvement suggestions',
              },
            },
          },
        },
      },

      // System
      system: {
        '/api/health': {
          methods: ['GET'],
          description: 'System health check with comprehensive metrics',
          auth: false,
          cache: 'Cached for 30 seconds',
          response: {
            status: 'overall system status',
            timestamp: 'ISO datetime string',
            uptime: 'system uptime in seconds',
            environment: 'current environment',
            version: 'application version',
            services: 'status of all services',
            metrics: 'performance and system metrics',
            alerts: 'recent system alerts',
            cached: 'boolean - whether response is cached',
          },
        },
        '/api/privacy': {
          methods: ['GET'],
          description: 'Privacy policy and data handling information',
          auth: false,
          response: {
            policy: 'privacy policy object',
            lastUpdated: 'ISO datetime string',
            version: 'policy version',
          },
        },
      },
    },

    // Common response formats
    commonResponses: {
      success: {
        success: true,
        data: 'Response data object',
        message: 'Optional success message',
        timestamp: 'ISO datetime string',
      },
      error: {
        success: false,
        error: 'Error message',
        code: 'Error code (e.g., VALIDATION_ERROR)',
        timestamp: 'ISO datetime string',
        details: 'Optional error details object',
      },
      pagination: {
        page: 'Current page number',
        limit: 'Items per page',
        total: 'Total number of items',
        totalPages: 'Total number of pages',
        hasNext: 'boolean - has next page',
        hasPrev: 'boolean - has previous page',
        hasMore: 'boolean - has more items',
      },
    },

    // Authentication
    authentication: {
      method: 'NextAuth.js with OAuth providers',
      providers: ['Google', 'GitHub'],
      session: 'Server-side sessions with database storage',
      headers: {
        'Cookie': 'Session cookie automatically handled by browser',
      },
    },

    // Rate Limiting
    rateLimiting: {
      general: '100 requests per 15 minutes per IP',
      chat: '20 messages per minute per user',
      matching: '10 requests per minute per user',
      headers: {
        'X-RateLimit-Limit': 'Request limit',
        'X-RateLimit-Remaining': 'Requests remaining',
        'X-RateLimit-Reset': 'Reset timestamp',
        'Retry-After': 'Seconds to wait when rate limited',
      },
    },

    // Error Codes
    errorCodes: {
      AUTH_REQUIRED: 'Authentication required (401)',
      USER_NOT_FOUND: 'User not found (404)',
      ACCOUNT_INACTIVE: 'Account inactive (403)',
      PROFILE_INCOMPLETE: 'Profile incomplete (428)',
      VALIDATION_ERROR: 'Request validation failed (400)',
      RATE_LIMIT_EXCEEDED: 'Rate limit exceeded (429)',
      REQUEST_TOO_LARGE: 'Request too large (413)',
      MALICIOUS_REQUEST: 'Malicious request detected (400)',
      INTERNAL_ERROR: 'Internal server error (500)',
    },

    // Security
    security: {
      headers: [
        'X-Content-Type-Options: nosniff',
        'X-Frame-Options: DENY',
        'X-XSS-Protection: 1; mode=block',
        'Referrer-Policy: strict-origin-when-cross-origin',
        'Content-Security-Policy: (configured)',
      ],
      validation: [
        'Request size limits',
        'Input sanitization',
        'SQL injection prevention',
        'XSS prevention',
        'Path traversal prevention',
      ],
    },
  };

  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format');

  if (format === 'json') {
    return NextResponse.json(apiDocs);
  }

  // Return HTML documentation
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${apiDocs.title}</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6; 
          color: #333; 
          max-width: 1200px; 
          margin: 0 auto; 
          padding: 20px;
          background: #f8fafc;
        }
        .container { 
          background: white; 
          border-radius: 8px; 
          padding: 32px; 
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        h1 { color: #1e40af; margin-bottom: 8px; }
        h2 { color: #1e40af; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; }
        h3 { color: #374151; margin-top: 24px; }
        .endpoint { 
          background: #f8fafc; 
          border-left: 4px solid #3b82f6; 
          padding: 16px; 
          margin: 16px 0; 
          border-radius: 4px;
        }
        .method { 
          display: inline-block; 
          padding: 4px 8px; 
          border-radius: 4px; 
          font-weight: bold; 
          font-size: 12px;
          margin-right: 8px;
        }
        .get { background: #10b981; color: white; }
        .post { background: #3b82f6; color: white; }
        .put { background: #f59e0b; color: white; }
        .delete { background: #ef4444; color: white; }
        .patch { background: #8b5cf6; color: white; }
        .auth-required { 
          background: #fef3c7; 
          color: #92400e; 
          padding: 4px 8px; 
          border-radius: 4px; 
          font-size: 12px;
          margin-left: 8px;
        }
        .auth-optional { 
          background: #d1fae5; 
          color: #065f46; 
          padding: 4px 8px; 
          border-radius: 4px; 
          font-size: 12px;
          margin-left: 8px;
        }
        pre { 
          background: #1f2937; 
          color: #f9fafb; 
          padding: 16px; 
          border-radius: 6px; 
          overflow-x: auto;
          font-size: 14px;
        }
        .params { 
          background: #f3f4f6; 
          padding: 12px; 
          border-radius: 4px; 
          margin: 12px 0;
        }
        .toc { 
          background: #eff6ff; 
          padding: 20px; 
          border-radius: 6px; 
          margin-bottom: 32px;
        }
        .toc a { 
          color: #1e40af; 
          text-decoration: none; 
          display: block; 
          padding: 4px 0;
        }
        .toc a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>${apiDocs.title}</h1>
        <p><strong>Version:</strong> ${apiDocs.version}</p>
        <p><strong>Base URL:</strong> <code>${apiDocs.baseUrl}</code></p>
        <p>${apiDocs.description}</p>
        
        <div class="toc">
          <h3>Table of Contents</h3>
          <a href="#authentication">Authentication & User Management</a>
          <a href="#study-groups">Study Groups</a>
          <a href="#goals">Goals Management</a>
          <a href="#subjects">Subjects</a>
          <a href="#chat">Chat & AI</a>
          <a href="#partners">Partner Matching</a>
          <a href="#ai">AI Services</a>
          <a href="#system">System</a>
          <a href="#common-responses">Common Response Formats</a>
          <a href="#rate-limiting">Rate Limiting</a>
          <a href="#error-codes">Error Codes</a>
          <a href="#security">Security</a>
        </div>

        <p><strong>Quick Links:</strong></p>
        <p>
          <a href="/api/docs?format=json" target="_blank">JSON Format</a> | 
          <a href="/api/health" target="_blank">Health Check</a>
        </p>

        <div id="authentication">
          <h2>Authentication & User Management</h2>
          ${Object.entries(apiDocs.endpoints.auth).map(([path, info]: [string, any]) => `
            <div class="endpoint">
              <h3>${path}</h3>
              ${info.methods.map((method: string) => `<span class="method ${method.toLowerCase()}">${method}</span>`).join('')}
              ${info.auth ? '<span class="auth-required">🔐 Auth Required</span>' : '<span class="auth-optional">🔓 No Auth</span>'}
              <p>${info.description}</p>
              ${info.params ? Object.entries(info.params).map(([method, params]: [string, any]) => `
                <div class="params">
                  <strong>${method}:</strong>
                  <pre>${JSON.stringify(params, null, 2)}</pre>
                </div>
              `).join('') : ''}
            </div>
          `).join('')}
        </div>

        <p style="text-align: center; margin-top: 40px; color: #6b7280;">
          <em>This is a living document. For the most up-to-date API information, please refer to the JSON format.</em>
        </p>
      </div>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  });
});