#!/usr/bin/env node

/**
 * Update Supabase Environment Variables
 * Safely updates .env.local with real Supabase credentials
 */

const fs = require('fs');
const chalk = require('chalk');

function updateSupabaseEnvironment() {
  console.log(chalk.blue('🔧 Updating Supabase Environment Variables'));
  console.log(chalk.gray('=' .repeat(50)));

  try {
    // Real Supabase credentials from user
    const projectId = 'mejswwhcywdrprqnitzl';
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lanN3d2hjeXdkcnBycW5pdHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4ODA4NTEsImV4cCI6MjA3MDQ1Njg1MX0.1TrsvnQNuZpaTVE5SsErXsgVNTnE13hesPiTPXZsFRI';
    const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lanN3d2hjeXdkcnBycW5pdHpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg4MDg1MSwiZXhwIjoyMDcwNDU2ODUxfQ.rCCiRxaODM3HvSKIPZgZMkALC3a0eBROa91Y-3LgwHE';
    
    // Derived values
    const supabaseUrl = `https://${projectId}.supabase.co`;
    
    console.log(chalk.yellow('📝 Reading current .env.local file...'));
    
    // Read current .env.local
    let envContent = '';
    try {
      envContent = fs.readFileSync('.env.local', 'utf8');
      console.log(chalk.green('✅ Found existing .env.local file'));
    } catch (error) {
      console.log(chalk.yellow('⚠️  .env.local not found, will create new one'));
      // Read from .env.example as template
      try {
        envContent = fs.readFileSync('.env.example', 'utf8');
        console.log(chalk.green('✅ Using .env.example as template'));
      } catch (e) {
        console.log(chalk.yellow('⚠️  Creating minimal .env.local'));
        envContent = '# MindSpring Environment Variables\n';
      }
    }

    // Variables to update
    const updates = {
      'NEXT_PUBLIC_SUPABASE_URL': supabaseUrl,
      'NEXT_PUBLIC_SUPABASE_ANON_KEY': anonKey,
      'SUPABASE_SERVICE_ROLE_KEY': serviceRoleKey,
    };

    console.log(chalk.yellow('\n🔄 Updating environment variables...'));

    // Update each variable
    let updatedContent = envContent;
    
    for (const [key, value] of Object.entries(updates)) {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      const newLine = `${key}="${value}"`;
      
      if (regex.test(updatedContent)) {
        updatedContent = updatedContent.replace(regex, newLine);
        console.log(chalk.green(`   ✓ Updated ${key}`));
      } else {
        updatedContent += `\n${newLine}`;
        console.log(chalk.green(`   ✓ Added ${key}`));
      }
    }

    // Write the updated file
    fs.writeFileSync('.env.local', updatedContent);
    console.log(chalk.green('\n✅ Successfully updated .env.local with Supabase credentials!'));

    console.log(chalk.yellow('\n📋 Updated variables:'));
    console.log(chalk.gray(`   • NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl}`));
    console.log(chalk.gray(`   • NEXT_PUBLIC_SUPABASE_ANON_KEY: ${anonKey.substring(0, 20)}...`));
    console.log(chalk.gray(`   • SUPABASE_SERVICE_ROLE_KEY: ${serviceRoleKey.substring(0, 20)}...`));

    console.log(chalk.yellow('\n🔍 Next steps:'));
    console.log(chalk.gray('   1. Update DATABASE_URL with your database password'));
    console.log(chalk.gray('   2. Set NEXTAUTH_URL to your production domain'));
    console.log(chalk.gray('   3. Run verification script to test'));

    return true;
  } catch (error) {
    console.error(chalk.red('❌ Error updating environment:'), error.message);
    return false;
  }
}

if (require.main === module) {
  updateSupabaseEnvironment();
}

module.exports = { updateSupabaseEnvironment };
