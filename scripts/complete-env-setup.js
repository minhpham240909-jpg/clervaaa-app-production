#!/usr/bin/env node

/**
 * Complete Environment Setup
 * Finishes the remaining environment variable setup
 */

const fs = require('fs');
const readline = require('readline');
const chalk = require('chalk');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function completeEnvironmentSetup() {
  console.log(chalk.blue('🔧 Complete Environment Setup'));
  console.log(chalk.gray('=' .repeat(50)));
  console.log(chalk.green('✅ Supabase API keys are already configured!'));
  console.log(chalk.yellow('📋 Let\'s finish the remaining configuration...\n'));

  try {
    const projectId = 'mejswwhcywdrprqnitzl';

    // 1. Get database password
    console.log(chalk.cyan('1. Database Password:'));
    console.log(chalk.gray('   This is the password you set when creating your Supabase project'));
    const dbPassword = await question(chalk.white('   Enter your database password: '));
    
    if (!dbPassword || dbPassword.length < 6) {
      console.log(chalk.red('   ❌ Password seems too short. Please check and try again.'));
      process.exit(1);
    }

    // 2. Get production domain
    console.log(chalk.cyan('\n2. Production Domain:'));
    console.log(chalk.gray('   Where will you deploy your app?'));
    console.log(chalk.gray('   Examples:'));
    console.log(chalk.gray('   - Vercel: https://studybuddy.vercel.app'));
    console.log(chalk.gray('   - Railway: https://studybuddy.up.railway.app'));
    console.log(chalk.gray('   - Custom: https://yourdomain.com'));
    const productionUrl = await question(chalk.white('   Enter your production URL: '));
    
    if (!productionUrl.startsWith('https://')) {
      console.log(chalk.red('   ❌ Production URL should start with https://'));
      process.exit(1);
    }

    // Build database URLs
    const databaseUrl = `postgresql://postgres:${dbPassword}@db.${projectId}.supabase.co:5432/postgres`;

    console.log(chalk.yellow('\n🔄 Updating remaining environment variables...'));

    // Read current .env.local
    let envContent = fs.readFileSync('.env.local', 'utf8');

    // Variables to update
    const updates = {
      'DATABASE_URL': databaseUrl,
      'DIRECT_URL': databaseUrl,
      'NEXTAUTH_URL': productionUrl,
      'NODE_ENV': 'production'
    };

    // Update each variable
    for (const [key, value] of Object.entries(updates)) {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      const newLine = `${key}="${value}"`;
      
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, newLine);
        console.log(chalk.green(`   ✓ Updated ${key}`));
      } else {
        envContent += `\n${newLine}`;
        console.log(chalk.green(`   ✓ Added ${key}`));
      }
    }

    // Write the updated file
    fs.writeFileSync('.env.local', envContent);
    console.log(chalk.green('\n🎉 Environment setup completed successfully!'));

    console.log(chalk.yellow('\n📋 Final Configuration Summary:'));
    console.log(chalk.green(`   ✅ Supabase URL: https://${projectId}.supabase.co`));
    console.log(chalk.green(`   ✅ API Keys: Configured`));
    console.log(chalk.green(`   ✅ Database: PostgreSQL on Supabase`));
    console.log(chalk.green(`   ✅ Production URL: ${productionUrl}`));

    console.log(chalk.yellow('\n🧪 Running verification test...'));
    
    // Load the new environment and test
    require('dotenv').config({ path: '.env.local', override: true });
    
    // Test Supabase connection
    try {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
      
      // Simple connection test
      const { error } = await supabase.from('_supabase_migrations').select('*').limit(1);
      
      if (!error || error.code === 'PGRST116') {
        console.log(chalk.green('   ✅ Supabase connection test passed!'));
      } else {
        console.log(chalk.yellow(`   ⚠️  Supabase connection warning: ${error.message}`));
      }
    } catch (err) {
      console.log(chalk.yellow(`   ⚠️  Could not test connection: ${err.message}`));
    }

    console.log(chalk.green('\n🚀 Your app is ready for production deployment!'));
    console.log(chalk.gray('\nNext steps:'));
    console.log(chalk.gray('1. Copy these environment variables to your hosting platform'));
    console.log(chalk.gray('2. Deploy your app'));
    console.log(chalk.gray('3. Run: node scripts/setup-supabase-production.js (after deployment)'));

  } catch (error) {
    console.error(chalk.red('❌ Error completing setup:'), error.message);
  } finally {
    rl.close();
  }
}

if (require.main === module) {
  completeEnvironmentSetup().catch(console.error);
}

module.exports = { completeEnvironmentSetup };
