import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().url().optional(),
  
  // NextAuth
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  
  // OAuth Providers
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GITHUB_ID: z.string().optional().default('dummy-github-id'),
  GITHUB_SECRET: z.string().optional().default('dummy-github-secret'),
  
  // Admin/Founder Configuration
  FOUNDER_EMAILS: z.string().optional().default(''),
  ADMIN_EMAILS: z.string().optional().default(''),
  
  // AI Services
  OPENAI_API_KEY: z.string().optional().default('sk-dummy-openai-key'),
  AI_MODEL: z.string().default('gpt-3.5-turbo'),
  
  // Supabase (if using)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  
  // Push Notifications
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().optional(),
  
  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Development Features
  ENABLE_TEST_MODE: z.string().optional().default('false'),
});

function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Environment validation failed:', error);
    console.error('📋 Required environment variables missing. Please check your .env.local file.');
    
    if (error instanceof z.ZodError) {
      console.error('Missing or invalid variables:');
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    }
    
    console.error('💡 Tip: Copy .env.local from .env.example and fill in your values');
    process.exit(1);
  }
}

export const env = validateEnv();
