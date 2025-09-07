#!/usr/bin/env node

/**
 * AI API Setup Script for StudyMatch
 * Helps configure AI providers quickly
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(`${colors.cyan}${prompt}${colors.reset}`, resolve);
  });
}

async function setupAIProviders() {
  log('\n🤖 StudyMatch AI API Setup', 'bold');
  log('='.repeat(50), 'blue');
  
  log('\nThis script will help you configure AI providers for better study suggestions.', 'yellow');
  log('You can choose one or more providers. The app will fallback to offline mode if none are configured.\n');

  const config = {
    gemini: null,
    openai: null,
    claude: null,
    preferred: 'gemini'
  };

  // Gemini Setup
  log('📊 Google Gemini (RECOMMENDED - Free tier available)', 'green');
  log('   • Free: 60 requests/minute');
  log('   • Paid: $0.50/1M tokens');
  log('   • Get key: https://makersuite.google.com/app/apikey\n');
  
  const setupGemini = await question('Do you want to setup Gemini? (y/n): ');
  if (setupGemini.toLowerCase() === 'y') {
    config.gemini = await question('Enter your Gemini API key: ');
  }

  // OpenAI Setup
  log('\n🧠 OpenAI GPT (Most Popular)', 'blue');
  log('   • GPT-3.5-turbo: $0.50/1M input tokens');
  log('   • GPT-4: $10/1M input tokens');
  log('   • Get key: https://platform.openai.com/api-keys\n');
  
  const setupOpenAI = await question('Do you want to setup OpenAI? (y/n): ');
  if (setupOpenAI.toLowerCase() === 'y') {
    config.openai = await question('Enter your OpenAI API key: ');
  }

  // Claude Setup
  log('\n🎭 Anthropic Claude (High Quality)', 'cyan');
  log('   • Claude Haiku: $0.25/1M input tokens');
  log('   • Claude Sonnet: $3/1M input tokens');
  log('   • Get key: https://console.anthropic.com/\n');
  
  const setupClaude = await question('Do you want to setup Claude? (y/n): ');
  if (setupClaude.toLowerCase() === 'y') {
    config.claude = await question('Enter your Claude API key: ');
  }

  // Preferred Provider
  if (config.gemini || config.openai || config.claude) {
    const providers = [];
    if (config.gemini) providers.push('gemini');
    if (config.openai) providers.push('openai');
    if (config.claude) providers.push('claude');

    if (providers.length > 1) {
      log(`\n🎯 Choose preferred provider (others will be used as fallback):`);
      providers.forEach((provider, index) => {
        log(`   ${index + 1}. ${provider}`);
      });
      
      const choice = await question('Enter choice (1-' + providers.length + '): ');
      const choiceIndex = parseInt(choice) - 1;
      if (choiceIndex >= 0 && choiceIndex < providers.length) {
        config.preferred = providers[choiceIndex];
      }
    } else {
      config.preferred = providers[0];
    }
  }

  rl.close();

  // Update environment file
  await updateEnvironmentFile(config);
  
  // Show results
  displaySetupResults(config);
}

async function updateEnvironmentFile(config) {
  const envPath = path.join(process.cwd(), '.env.local');
  let envContent = '';

  // Read existing env file
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  // Remove existing AI keys
  envContent = envContent.replace(/^GEMINI_API_KEY=.*$/gm, '');
  envContent = envContent.replace(/^OPENAI_API_KEY=.*$/gm, '');
  envContent = envContent.replace(/^ANTHROPIC_API_KEY=.*$/gm, '');
  envContent = envContent.replace(/^PREFERRED_AI_PROVIDER=.*$/gm, '');

  // Add AI configuration section
  envContent += '\n\n# AI API Configuration\n';
  
  if (config.gemini) {
    envContent += `GEMINI_API_KEY=${config.gemini}\n`;
  }
  if (config.openai) {
    envContent += `OPENAI_API_KEY=${config.openai}\n`;
  }
  if (config.claude) {
    envContent += `ANTHROPIC_API_KEY=${config.claude}\n`;
  }
  
  if (config.gemini || config.openai || config.claude) {
    envContent += `PREFERRED_AI_PROVIDER=${config.preferred}\n`;
  }

  // Clean up extra newlines
  envContent = envContent.replace(/\n\n+/g, '\n\n').trim() + '\n';

  // Write updated env file
  fs.writeFileSync(envPath, envContent);
  
  log(`\n✅ Updated ${envPath}`, 'green');
}

function displaySetupResults(config) {
  log('\n🎉 AI Setup Complete!', 'bold');
  log('='.repeat(30), 'green');
  
  const configuredProviders = [];
  if (config.gemini) configuredProviders.push('Gemini');
  if (config.openai) configuredProviders.push('OpenAI');
  if (config.claude) configuredProviders.push('Claude');

  if (configuredProviders.length > 0) {
    log(`\n✅ Configured Providers: ${configuredProviders.join(', ')}`, 'green');
    log(`🎯 Preferred Provider: ${config.preferred}`, 'blue');
    log(`🔄 Fallback: Offline intelligence if APIs fail`, 'yellow');
    
    log('\n📋 Next Steps:', 'bold');
    log('1. Restart your development server: npm run dev');
    log('2. Test at: http://localhost:3000/test-ai-chat');
    log('3. Check browser console for AI provider logs');
    log('4. Monitor API usage in provider dashboards');
    
    log('\n💰 Cost Estimation (per 1000 users/month):', 'cyan');
    if (config.gemini) log('   • Gemini: ~$5');
    if (config.openai) log('   • OpenAI GPT-3.5: ~$15');
    if (config.claude) log('   • Claude Haiku: ~$10');
    
  } else {
    log('\n⚠️  No AI providers configured', 'yellow');
    log('   Your app will use offline intelligence only');
    log('   This is perfectly fine for development and testing!');
    log('\n   To add AI later, run this script again or manually edit .env.local');
  }

  log('\n📖 For more details, see: AI_API_SETUP_GUIDE.md', 'blue');
  log('\n🚀 Your StudyMatch app now has enterprise-grade AI capabilities!', 'bold');
}

// Handle errors gracefully
process.on('SIGINT', () => {
  log('\n\n👋 Setup cancelled. No changes made.', 'yellow');
  rl.close();
  process.exit(0);
});

process.on('unhandledRejection', (error) => {
  log('\n❌ Setup failed:', 'red');
  console.error(error);
  rl.close();
  process.exit(1);
});

// Run setup
setupAIProviders().catch((error) => {
  log('\n❌ Setup failed:', 'red');
  console.error(error);
  process.exit(1);
});
