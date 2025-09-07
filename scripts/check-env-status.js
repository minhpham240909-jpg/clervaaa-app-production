#!/usr/bin/env node

/**
 * Safe Environment Status Checker
 * Shows which variables are set without exposing sensitive values
 */

const chalk = require('chalk');

// Load environment variables
try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {
  // dotenv might not be available
}

function checkEnvStatus() {
  console.log(chalk.blue('🔍 Current Environment Status (Safe Check)'));
  console.log(chalk.gray('=' .repeat(50)));

  const supabaseVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
    'SUPABASE_SERVICE_ROLE_KEY',
    'DATABASE_URL'
  ];

  const authVars = [
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET'
  ];

  console.log(chalk.yellow('\n📍 Supabase Configuration:'));
  supabaseVars.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      console.log(chalk.red(`   ❌ ${varName}: NOT SET`));
    } else {
      // Check if it's a placeholder value
      const isPlaceholder = value.includes('your-') || 
                           value.includes('YOUR_') || 
                           value === 'your-supabase-url' ||
                           value === 'your-supabase-anon-key' ||
                           value.startsWith('file:');
      
      if (isPlaceholder) {
        console.log(chalk.yellow(`   ⚠️  ${varName}: PLACEHOLDER VALUE`));
        console.log(chalk.gray(`       Current: ${value.substring(0, 30)}...`));
      } else {
        // Show first few characters for verification
        const preview = varName.includes('KEY') || varName.includes('SECRET') 
          ? `${value.substring(0, 10)}...` 
          : value.length > 40 
            ? `${value.substring(0, 40)}...` 
            : value;
        console.log(chalk.green(`   ✅ ${varName}: SET`));
        console.log(chalk.gray(`       Preview: ${preview}`));
      }
    }
  });

  console.log(chalk.yellow('\n🔐 Authentication Configuration:'));
  authVars.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      console.log(chalk.red(`   ❌ ${varName}: NOT SET`));
    } else {
      const isPlaceholder = value.includes('your-') || 
                           value.includes('localhost') ||
                           value.includes('YOUR_');
      
      if (isPlaceholder && varName === 'NEXTAUTH_URL') {
        console.log(chalk.yellow(`   ⚠️  ${varName}: DEVELOPMENT VALUE`));
        console.log(chalk.gray(`       Current: ${value}`));
      } else {
        const preview = varName.includes('SECRET') 
          ? `${value.substring(0, 10)}...` 
          : value;
        console.log(chalk.green(`   ✅ ${varName}: SET`));
        console.log(chalk.gray(`       Preview: ${preview}`));
      }
    }
  });

  // Recommendations
  console.log(chalk.yellow('\n💡 Next Steps:'));
  
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log(chalk.gray('   1. Get SUPABASE_SERVICE_ROLE_KEY from Supabase Dashboard → Settings → API'));
  }
  
  if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.includes('your-')) {
    console.log(chalk.gray('   2. Get real SUPABASE_ANON_KEY from Supabase Dashboard → Settings → API'));
  }
  
  if (process.env.NEXTAUTH_URL?.includes('localhost')) {
    console.log(chalk.gray('   3. Set NEXTAUTH_URL to your production domain'));
  }
  
  if (process.env.DATABASE_URL?.startsWith('file:')) {
    console.log(chalk.gray('   4. Set DATABASE_URL to your Supabase PostgreSQL connection string'));
  }
}

if (require.main === module) {
  checkEnvStatus();
}

module.exports = { checkEnvStatus };
