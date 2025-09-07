#!/usr/bin/env node

/**
 * Post-Deployment Setup Script
 * 
 * This script helps you complete the final setup steps after deploying to Vercel:
 * 1. Initialize production database schema
 * 2. Update Google OAuth settings
 * 3. Test deployment functionality
 * 4. Provide final verification steps
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorLog(color, message) {
  console.log(color + message + colors.reset);
}

function showHeader() {
  console.clear();
  colorLog(colors.cyan + colors.bright, '🚀 MindSpring - Post-Deployment Setup');
  colorLog(colors.cyan, '='.repeat(50));
  console.log();
}

function showStep(stepNumber, title, description) {
  colorLog(colors.yellow + colors.bright, `📋 Step ${stepNumber}: ${title}`);
  colorLog(colors.blue, description);
  console.log();
}

function showSuccess(message) {
  colorLog(colors.green + colors.bright, '✅ ' + message);
}

function showWarning(message) {
  colorLog(colors.yellow + colors.bright, '⚠️  ' + message);
}

function showError(message) {
  colorLog(colors.red + colors.bright, '❌ ' + message);
}

function showInfo(message) {
  colorLog(colors.blue, 'ℹ️  ' + message);
}

async function getUserInput(prompt) {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    readline.question(prompt, (answer) => {
      readline.close();
      resolve(answer.trim());
    });
  });
}

async function checkEnvironmentVariables() {
  showStep(1, 'Verify Environment Variables', 'Checking if all required variables are configured...');
  
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    const envContent = await fs.readFile(envPath, 'utf8');
    
    const requiredVars = [
      'DATABASE_URL',
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXTAUTH_URL',
      'OPENAI_API_KEY'
    ];
    
    const missingVars = [];
    
    for (const varName of requiredVars) {
      if (!envContent.includes(varName + '=')) {
        missingVars.push(varName);
      }
    }
    
    if (missingVars.length === 0) {
      showSuccess('All required environment variables are configured locally');
      showInfo('Make sure you\'ve added these same variables to Vercel');
    } else {
      showWarning(`Missing variables: ${missingVars.join(', ')}`);
    }
    
    return missingVars.length === 0;
  } catch (error) {
    showError('Could not read .env.local file');
    return false;
  }
}

async function initializeProductionDatabase() {
  showStep(2, 'Initialize Production Database', 'Setting up database schema and initial data...');
  
  try {
    showInfo('Pushing database schema to Supabase...');
    execSync('npx prisma db push', { stdio: 'inherit' });
    showSuccess('Database schema updated successfully');
    
    showInfo('Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    showSuccess('Prisma client generated successfully');
    
    // Optional: Seed database
    const shouldSeed = await getUserInput('Do you want to seed the database with initial data? (y/n): ');
    if (shouldSeed.toLowerCase() === 'y' || shouldSeed.toLowerCase() === 'yes') {
      try {
        showInfo('Seeding database...');
        execSync('npx prisma db seed', { stdio: 'inherit' });
        showSuccess('Database seeded successfully');
      } catch (error) {
        showWarning('Database seeding failed, but this is optional');
        showInfo('You can seed manually later if needed');
      }
    }
    
    return true;
  } catch (error) {
    showError('Database initialization failed');
    showInfo('Make sure your DATABASE_URL is correct and Supabase project is running');
    return false;
  }
}

async function updateGoogleOAuth() {
  showStep(3, 'Update Google OAuth Settings', 'Configure OAuth redirect URLs for your deployed app...');
  
  const vercelUrl = await getUserInput('Enter your Vercel deployment URL (e.g., https://your-app.vercel.app): ');
  
  if (!vercelUrl || !vercelUrl.startsWith('https://')) {
    showError('Please provide a valid HTTPS URL');
    return false;
  }
  
  console.log();
  colorLog(colors.yellow + colors.bright, '📝 Google OAuth Configuration Steps:');
  console.log();
  
  colorLog(colors.blue, '1. Go to Google Cloud Console:');
  colorLog(colors.cyan, '   https://console.cloud.google.com');
  console.log();
  
  colorLog(colors.blue, '2. Navigate to: APIs & Services → Credentials');
  console.log();
  
  colorLog(colors.blue, '3. Find your OAuth 2.0 Client ID and click "Edit"');
  console.log();
  
  colorLog(colors.blue, '4. Add this URL to "Authorized redirect URIs":');
  colorLog(colors.green + colors.bright, `   ${vercelUrl}/api/auth/callback/google`);
  console.log();
  
  colorLog(colors.blue, '5. Save the changes');
  console.log();
  
  const completed = await getUserInput('Have you completed the Google OAuth setup? (y/n): ');
  
  if (completed.toLowerCase() === 'y' || completed.toLowerCase() === 'yes') {
    showSuccess('Google OAuth configured successfully');
    
    // Update NEXTAUTH_URL in local env for reference
    try {
      const envPath = path.join(process.cwd(), '.env.local');
      let envContent = await fs.readFile(envPath, 'utf8');
      
      if (envContent.includes('NEXTAUTH_URL=')) {
        envContent = envContent.replace(/NEXTAUTH_URL=.*/, `NEXTAUTH_URL=${vercelUrl}`);
      } else {
        envContent += `\nNEXTAUTH_URL=${vercelUrl}`;
      }
      
      await fs.writeFile(envPath, envContent);
      showInfo('Updated NEXTAUTH_URL in .env.local for reference');
    } catch (error) {
      showWarning('Could not update local .env.local file');
    }
    
    return true;
  } else {
    showWarning('Please complete Google OAuth setup before proceeding');
    return false;
  }
}

async function verifyDeployment(vercelUrl) {
  showStep(4, 'Test Deployment', 'Verifying your deployed app functionality...');
  
  if (!vercelUrl) {
    vercelUrl = await getUserInput('Enter your Vercel deployment URL: ');
  }
  
  console.log();
  colorLog(colors.yellow + colors.bright, '🧪 Testing Checklist:');
  console.log();
  
  const tests = [
    'Homepage loads correctly',
    'Sign in with Google works',
    'Dashboard is accessible after login',
    'AI features respond (try generating a summary)',
    'Database operations work (create a goal)',
    'No console errors in browser'
  ];
  
  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    const result = await getUserInput(`${i + 1}. ${test} - Working? (y/n): `);
    
    if (result.toLowerCase() === 'y' || result.toLowerCase() === 'yes') {
      showSuccess(`${test} ✓`);
    } else {
      showError(`${test} ✗`);
      showInfo('Check browser console and Vercel function logs for errors');
    }
  }
  
  console.log();
  const allWorking = await getUserInput('Is everything working correctly? (y/n): ');
  
  if (allWorking.toLowerCase() === 'y' || allWorking.toLowerCase() === 'yes') {
    showSuccess('🎉 Your MindSpring app is live and working!');
    return true;
  } else {
    showWarning('Some issues detected. Check the troubleshooting guide.');
    return false;
  }
}

function showTroubleshootingGuide() {
  console.log();
  colorLog(colors.red + colors.bright, '🔧 Troubleshooting Common Issues:');
  console.log();
  
  colorLog(colors.yellow, '❌ Authentication not working:');
  colorLog(colors.blue, '   • Check Google OAuth redirect URLs');
  colorLog(colors.blue, '   • Verify NEXTAUTH_URL in Vercel environment');
  colorLog(colors.blue, '   • Ensure NEXTAUTH_SECRET is set');
  console.log();
  
  colorLog(colors.yellow, '❌ Database errors:');
  colorLog(colors.blue, '   • Verify DATABASE_URL is correct');
  colorLog(colors.blue, '   • Check Supabase project status');
  colorLog(colors.blue, '   • Run: npx prisma db push');
  console.log();
  
  colorLog(colors.yellow, '❌ AI features not working:');
  colorLog(colors.blue, '   • Verify OpenAI API key is valid');
  colorLog(colors.blue, '   • Check OpenAI account has credits');
  colorLog(colors.blue, '   • Ensure OPENAI_API_KEY is in Vercel env');
  console.log();
  
  colorLog(colors.yellow, '❌ Build/deployment failures:');
  colorLog(colors.blue, '   • Check Vercel build logs');
  colorLog(colors.blue, '   • Verify all environment variables are set');
  colorLog(colors.blue, '   • Try redeploying from Vercel dashboard');
  console.log();
}

function showFinalSuccess() {
  console.log();
  colorLog(colors.green + colors.bright, '🎉 CONGRATULATIONS!');
  colorLog(colors.green, '='.repeat(50));
  console.log();
  
  colorLog(colors.cyan + colors.bright, '🚀 Your MindSpring app is now LIVE!');
  console.log();
  
  colorLog(colors.yellow, '✅ What you\'ve accomplished:');
  colorLog(colors.blue, '   • Deployed a full-stack AI-powered study platform');
  colorLog(colors.blue, '   • Configured secure authentication with Google');
  colorLog(colors.blue, '   • Set up a production PostgreSQL database');
  colorLog(colors.blue, '   • Integrated OpenAI for intelligent features');
  colorLog(colors.blue, '   • Created a responsive, modern web application');
  console.log();
  
  colorLog(colors.magenta + colors.bright, '🌟 Key Features Live:');
  colorLog(colors.blue, '   📝 AI Study Summaries');
  colorLog(colors.blue, '   🎯 Smart Flashcard Generation');
  colorLog(colors.blue, '   📊 Interactive Quiz Creation');
  colorLog(colors.blue, '   🤝 AI-Powered Partner Matching');
  colorLog(colors.blue, '   📈 Progress Analysis & Insights');
  colorLog(colors.blue, '   💬 Real-time Chat & Collaboration');
  colorLog(colors.blue, '   📱 Mobile-Responsive Design');
  console.log();
  
  colorLog(colors.cyan, '🎯 Next Steps:');
  colorLog(colors.blue, '   • Share your app with friends and get feedback');
  colorLog(colors.blue, '   • Monitor usage in Vercel and Supabase dashboards');
  colorLog(colors.blue, '   • Keep an eye on OpenAI usage and costs');
  colorLog(colors.blue, '   • Consider upgrading plans as you grow');
  console.log();
  
  colorLog(colors.yellow + colors.bright, '💰 Cost Monitoring:');
  colorLog(colors.blue, '   • Vercel: Free tier → $20/month Pro');
  colorLog(colors.blue, '   • Supabase: Free tier → $25/month Pro');
  colorLog(colors.blue, '   • OpenAI: Pay-per-use (~$15-40/month)');
  console.log();
}

async function main() {
  showHeader();
  
  colorLog(colors.green + colors.bright, '🎯 This script will help you complete your deployment setup!');
  console.log();
  
  try {
    // Step 1: Check environment variables
    const envOk = await checkEnvironmentVariables();
    if (!envOk) {
      showWarning('Please fix environment variable issues first');
      process.exit(1);
    }
    
    console.log();
    
    // Step 2: Initialize database
    const dbOk = await initializeProductionDatabase();
    if (!dbOk) {
      showError('Database setup failed. Please check your configuration.');
      showTroubleshootingGuide();
      process.exit(1);
    }
    
    console.log();
    
    // Step 3: Update Google OAuth
    const oauthOk = await updateGoogleOAuth();
    if (!oauthOk) {
      showError('OAuth setup incomplete. Please complete this step.');
      process.exit(1);
    }
    
    console.log();
    
    // Step 4: Test deployment
    const deployOk = await verifyDeployment();
    
    if (deployOk) {
      showFinalSuccess();
    } else {
      showTroubleshootingGuide();
    }
    
  } catch (error) {
    showError('Setup failed: ' + error.message);
    showTroubleshootingGuide();
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  checkEnvironmentVariables,
  initializeProductionDatabase,
  updateGoogleOAuth,
  verifyDeployment
};
