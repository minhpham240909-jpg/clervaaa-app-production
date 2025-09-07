#!/usr/bin/env node

/**
 * AI Model Configuration Manager
 * Easy way to configure different OpenAI models for each feature
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Available OpenAI models
const MODELS = {
  'gpt-3.5-turbo': { cost: 0.002, description: 'Cost-effective, fast, good for simple tasks' },
  'gpt-4o-mini': { cost: 0.008, description: 'Balanced cost/quality, good for most tasks' },
  'gpt-4o': { cost: 0.025, description: 'High quality, best for complex reasoning' },
  'gpt-4-turbo': { cost: 0.020, description: 'Legacy high-quality model' },
  'gpt-4': { cost: 0.030, description: 'Legacy premium model' }
};

// Feature descriptions
const FEATURES = {
  summary: 'Study content summarization',
  flashcards: 'Flashcard generation from content',
  chatbot: 'AI study assistant chat',
  quiz: 'Quiz and test generation',
  partnerMatching: 'AI-powered partner matching',
  progressAnalysis: 'Study progress analysis and insights'
};

// Recommended configurations
const PRESETS = {
  budget: {
    name: 'Budget (GPT-3.5 only)',
    cost: '$5-10/month',
    models: {
      summary: 'gpt-3.5-turbo',
      flashcards: 'gpt-3.5-turbo',
      chatbot: 'gpt-3.5-turbo',
      quiz: 'gpt-3.5-turbo',
      partnerMatching: 'gpt-3.5-turbo',
      progressAnalysis: 'gpt-3.5-turbo'
    }
  },
  balanced: {
    name: 'Balanced (Mixed models)',
    cost: '$15-30/month',
    models: {
      summary: 'gpt-3.5-turbo',
      flashcards: 'gpt-3.5-turbo',
      chatbot: 'gpt-3.5-turbo',
      quiz: 'gpt-4o-mini',
      partnerMatching: 'gpt-4o-mini',
      progressAnalysis: 'gpt-4o-mini'
    }
  },
  premium: {
    name: 'Premium (GPT-4o for complex features)',
    cost: '$30-60/month',
    models: {
      summary: 'gpt-3.5-turbo',
      flashcards: 'gpt-4o-mini',
      chatbot: 'gpt-4o-mini',
      quiz: 'gpt-4o',
      partnerMatching: 'gpt-4o',
      progressAnalysis: 'gpt-4o'
    }
  }
};

function showCurrentConfiguration() {
  console.log(chalk.blue('\n🤖 Current AI Model Configuration\n'));
  
  require('dotenv').config({ path: '.env.local' });
  
  Object.entries(FEATURES).forEach(([feature, description]) => {
    const envVar = `OPENAI_MODEL_${feature.toUpperCase()}`;
    const currentModel = process.env[envVar] || 'gpt-3.5-turbo (default)';
    const modelInfo = MODELS[currentModel] || { cost: 0.002, description: 'Default model' };
    
    console.log(chalk.green(`📝 ${feature}:`));
    console.log(chalk.gray(`   ${description}`));
    console.log(chalk.white(`   Model: ${currentModel}`));
    console.log(chalk.yellow(`   Cost: ~$${modelInfo.cost.toFixed(3)} per request`));
    console.log('');
  });
}

function showPresets() {
  console.log(chalk.blue('\n🎛️  Available Presets\n'));
  
  Object.entries(PRESETS).forEach(([key, preset]) => {
    console.log(chalk.green(`${key}: ${preset.name}`));
    console.log(chalk.gray(`   Estimated cost: ${preset.cost}`));
    console.log('   Features:');
    Object.entries(preset.models).forEach(([feature, model]) => {
      console.log(chalk.white(`     ${feature}: ${model}`));
    });
    console.log('');
  });
}

function applyPreset(presetName) {
  const preset = PRESETS[presetName];
  if (!preset) {
    console.log(chalk.red(`❌ Preset "${presetName}" not found`));
    console.log(chalk.yellow('Available presets: budget, balanced, premium'));
    return;
  }

  console.log(chalk.blue(`\n🔧 Applying "${preset.name}" configuration...\n`));

  // Generate environment variables
  const envVars = [];
  Object.entries(preset.models).forEach(([feature, model]) => {
    const envVar = `OPENAI_MODEL_${feature.toUpperCase()}`;
    envVars.push(`${envVar}="${model}"`);
  });

  // Add to .env.local
  const envPath = '.env.local';
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  // Remove existing AI model configurations
  envContent = envContent.replace(/^OPENAI_MODEL_.*$/gm, '');
  
  // Add new configuration
  envContent += '\n\n# AI Model Configuration (Generated)\n';
  envContent += envVars.join('\n');
  envContent += '\n';

  fs.writeFileSync(envPath, envContent);

  console.log(chalk.green('✅ Configuration applied successfully!'));
  console.log(chalk.yellow('🔄 Restart your development server to apply changes'));
  
  // Show what was applied
  Object.entries(preset.models).forEach(([feature, model]) => {
    const modelInfo = MODELS[model];
    console.log(chalk.white(`   ${feature}: ${model} (~$${modelInfo.cost.toFixed(3)}/request)`));
  });
}

function calculateCost() {
  console.log(chalk.blue('\n💰 Monthly Cost Calculator\n'));
  
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const usage = {};
  const features = Object.keys(FEATURES);
  let currentFeature = 0;

  function askUsage() {
    if (currentFeature >= features.length) {
      // Calculate costs
      console.log(chalk.blue('\n📊 Cost Estimation:\n'));
      
      let totalCost = 0;
      Object.entries(usage).forEach(([feature, requests]) => {
        const envVar = `OPENAI_MODEL_${feature.toUpperCase()}`;
        const model = process.env[envVar] || 'gpt-3.5-turbo';
        const costPerRequest = MODELS[model]?.cost || 0.002;
        const featureCost = requests * costPerRequest;
        totalCost += featureCost;
        
        console.log(chalk.white(`${feature}: ${requests} requests/month × $${costPerRequest.toFixed(3)} = $${featureCost.toFixed(2)}`));
      });
      
      console.log(chalk.green(`\nTotal estimated monthly cost: $${totalCost.toFixed(2)}`));
      readline.close();
      return;
    }

    const feature = features[currentFeature];
    readline.question(
      chalk.yellow(`How many ${feature} requests per month? (default: 100): `),
      (answer) => {
        usage[feature] = parseInt(answer) || 100;
        currentFeature++;
        askUsage();
      }
    );
  }

  require('dotenv').config({ path: '.env.local' });
  askUsage();
}

function showHelp() {
  console.log(chalk.blue('\n🤖 AI Model Configuration Manager\n'));
  console.log('Usage: npm run configure-ai [command]\n');
  console.log('Commands:');
  console.log(chalk.green('  show') + '                 Show current configuration');
  console.log(chalk.green('  presets') + '              List available presets');
  console.log(chalk.green('  apply <preset>') + '       Apply a preset (budget/balanced/premium)');
  console.log(chalk.green('  cost') + '                 Calculate monthly costs');
  console.log(chalk.green('  help') + '                 Show this help\n');
  console.log('Examples:');
  console.log(chalk.gray('  npm run configure-ai show'));
  console.log(chalk.gray('  npm run configure-ai apply balanced'));
  console.log(chalk.gray('  npm run configure-ai cost'));
}

// Main execution
const command = process.argv[2];
const arg = process.argv[3];

switch (command) {
  case 'show':
    showCurrentConfiguration();
    break;
  case 'presets':
    showPresets();
    break;
  case 'apply':
    if (!arg) {
      console.log(chalk.red('❌ Please specify a preset: budget, balanced, or premium'));
    } else {
      applyPreset(arg);
    }
    break;
  case 'cost':
    calculateCost();
    break;
  case 'help':
  default:
    showHelp();
    break;
}
