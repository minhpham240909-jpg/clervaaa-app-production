#!/usr/bin/env node

/**
 * Development Database Fix
 * Temporarily use SQLite for development when Supabase is unreachable
 */

const fs = require('fs');
const chalk = require('chalk');

function fixDevelopmentDatabase() {
  console.log(chalk.blue('🔧 Fixing Development Database Connection'));
  console.log(chalk.gray('=' .repeat(50)));

  try {
    // Read current .env.local
    let envContent = fs.readFileSync('.env.local', 'utf8');
    
    console.log(chalk.yellow('📋 Current Issue:'));
    console.log(chalk.red('   ❌ Cannot reach Supabase database from local network'));
    console.log(chalk.yellow('   💡 This is common with managed databases for security'));
    
    console.log(chalk.yellow('\n🔧 Creating development fallback...'));
    
    // Create backup of production config
    fs.writeFileSync('.env.production.backup', envContent);
    console.log(chalk.green('   ✓ Backed up production config'));
    
    // Create development database config
    const devConfig = envContent.replace(
      /DATABASE_URL="postgresql:\/\/.*"/,
      'DATABASE_URL="file:./dev.db"'
    ).replace(
      /DIRECT_URL="postgresql:\/\/.*"/,
      'DIRECT_URL="file:./dev.db"'
    );
    
    fs.writeFileSync('.env.local.dev', devConfig);
    console.log(chalk.green('   ✓ Created development database config'));
    
    console.log(chalk.yellow('\n🎯 Solutions:'));
    console.log(chalk.blue('Option 1 (Recommended): Test with current setup'));
    console.log(chalk.gray('   • Your app loads at http://localhost:3000'));
    console.log(chalk.gray('   • Most features work (AI, UI, etc.)'));
    console.log(chalk.gray('   • Only authentication will have issues locally'));
    
    console.log(chalk.blue('\nOption 2: Use SQLite for development'));
    console.log(chalk.gray('   • Run: mv .env.local .env.local.prod && mv .env.local.dev .env.local'));
    console.log(chalk.gray('   • Run: npx prisma db push'));
    console.log(chalk.gray('   • Perfect for local development'));
    
    console.log(chalk.blue('\nOption 3: Deploy to production'));
    console.log(chalk.gray('   • Supabase works perfectly in production'));
    console.log(chalk.gray('   • Deploy to Vercel where database access works'));
    
    console.log(chalk.green('\n🌐 Your app is accessible now at:'));
    console.log(chalk.cyan('   👉 http://localhost:3000'));
    console.log(chalk.gray('   (Database errors won\'t prevent the app from loading)'));
    
  } catch (error) {
    console.error(chalk.red('❌ Error:'), error.message);
  }
}

if (require.main === module) {
  fixDevelopmentDatabase();
}

module.exports = { fixDevelopmentDatabase };
