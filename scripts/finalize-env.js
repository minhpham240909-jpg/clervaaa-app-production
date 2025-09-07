#!/usr/bin/env node

/**
 * Finalize Environment Setup
 * Complete the setup with provided database password and Vercel URL
 */

const fs = require('fs');
const chalk = require('chalk');

function finalizeEnvironment() {
  console.log(chalk.blue('🔧 Finalizing Environment Setup'));
  console.log(chalk.gray('=' .repeat(50)));

  try {
    const projectId = 'mejswwhcywdrprqnitzl';
    const dbPassword = 'Dupsep-tyrzys-3fynxu';
    const productionUrl = 'https://studybuddy.vercel.app'; // Default Vercel URL, user can change later

    // Build database URLs
    const databaseUrl = `postgresql://postgres:${dbPassword}@db.${projectId}.supabase.co:5432/postgres`;

    console.log(chalk.yellow('🔄 Updating remaining environment variables...'));

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

    return true;
  } catch (error) {
    console.error(chalk.red('❌ Error finalizing setup:'), error.message);
    return false;
  }
}

if (require.main === module) {
  finalizeEnvironment();
}

module.exports = { finalizeEnvironment };
