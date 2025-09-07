#!/usr/bin/env node

/**
 * Environment Setup Script for StudyBuddy App
 * 
 * This script helps set up the .env.local file with sensible defaults
 * for development and testing purposes.
 */

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const ENV_TEMPLATE = `# StudyBuddy App Environment Configuration
# Generated automatically - modify as needed

# =================================
# CORE DATABASE & AUTH
# =================================

# Database - SQLite for development
DATABASE_URL="file:./dev.db"

# NextAuth.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="${crypto.randomBytes(32).toString('hex')}"

# =================================
# OAUTH PROVIDERS (Optional)
# =================================

# Google OAuth (Optional - leave empty if not using)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# =================================
# AI SERVICES (Optional)
# =================================

# AI Fallback Mode - Set to 'false' when you have AI keys
AI_FALLBACK_MODE="true"

# OpenAI (Add your key when available)
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-3.5-turbo"
OPENAI_MAX_TOKENS="1500"
OPENAI_TEMPERATURE="0.7"

# Alternative AI Services (Optional)
ANTHROPIC_API_KEY=""
GEMINI_API_KEY=""

# =================================
# FOUNDER ACCESS
# =================================

# Your email for admin access
FOUNDER_EMAILS="admin@example.com"

# =================================
# DEVELOPMENT SETTINGS
# =================================

NODE_ENV="development"
LOG_LEVEL="info"
DETAILED_ERRORS="true"

# =================================
# OPTIONAL FEATURES
# =================================

# Supabase (Optional - for real-time features)
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""

# Push Notifications (Optional)
VAPID_PUBLIC_KEY=""
VAPID_PRIVATE_KEY=""
VAPID_SUBJECT="mailto:admin@example.com"
`

function setupEnvironment() {
  const projectRoot = path.join(__dirname, '..')
  const envPath = path.join(projectRoot, '.env.local')
  
  console.log('🚀 Setting up StudyBuddy environment...')
  
  // Check if .env.local already exists
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env.local already exists!')
    console.log('   If you want to regenerate it, delete the existing file first.')
    console.log('   Current file location:', envPath)
    return
  }
  
  try {
    // Write the environment file
    fs.writeFileSync(envPath, ENV_TEMPLATE)
    
    console.log('✅ Successfully created .env.local!')
    console.log('📝 Location:', envPath)
    console.log('')
    console.log('🔧 Next steps:')
    console.log('   1. Review and update the .env.local file with your actual values')
    console.log('   2. Add your email to FOUNDER_EMAILS for admin access')
    console.log('   3. Add AI API keys when available (or keep AI_FALLBACK_MODE="true")')
    console.log('   4. Run: npm run dev')
    console.log('')
    console.log('💡 The app will work without AI keys - fallback mode provides demo responses.')
    
  } catch (error) {
    console.error('❌ Error creating .env.local:', error.message)
    console.log('')
    console.log('🔧 Manual setup:')
    console.log('   1. Create a file named .env.local in the project root')
    console.log('   2. Copy the contents from env.example')
    console.log('   3. Update the values as needed')
  }
}

function checkEnvironment() {
  const projectRoot = path.join(__dirname, '..')
  const envPath = path.join(projectRoot, '.env.local')
  
  console.log('🔍 Checking environment configuration...')
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env.local not found')
    return false
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8')
  const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'))
  
  console.log(`✅ Found .env.local with ${lines.length} configuration lines`)
  
  // Check for critical variables
  const hasDatabase = envContent.includes('DATABASE_URL=')
  const hasAuth = envContent.includes('NEXTAUTH_SECRET=')
  const hasFallback = envContent.includes('AI_FALLBACK_MODE=')
  
  console.log('📋 Configuration status:')
  console.log(`   Database: ${hasDatabase ? '✅' : '❌'}`)
  console.log(`   Auth: ${hasAuth ? '✅' : '❌'}`)
  console.log(`   AI Fallback: ${hasFallback ? '✅' : '❌'}`)
  
  if (hasDatabase && hasAuth) {
    console.log('🎉 Environment looks ready!')
    return true
  } else {
    console.log('⚠️  Some required configuration is missing')
    return false
  }
}

// Main execution
const command = process.argv[2]

switch (command) {
  case 'check':
    checkEnvironment()
    break
  case 'setup':
  default:
    setupEnvironment()
    break
}
