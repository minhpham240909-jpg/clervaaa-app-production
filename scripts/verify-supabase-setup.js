#!/usr/bin/env node

/**
 * MindSpring Supabase Setup Verification Script
 * 
 * This script verifies your Supabase configuration is correct before deployment.
 * Run this to double-check everything is set up properly.
 */

const chalk = require('chalk');
const { createClient } = require('@supabase/supabase-js');

async function verifySupabaseSetup() {
  console.log(chalk.blue('🔍 Clerva Supabase Setup Verification'));
  console.log(chalk.gray('=' .repeat(50)));

  let allChecksPass = true;
  const issues = [];

  try {
    // 1. Check Environment Variables
    console.log(chalk.yellow('\n📋 Step 1: Checking Environment Variables...'));
    
    const requiredVars = [
      'DATABASE_URL',
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'NEXTAUTH_URL',
      'NEXTAUTH_SECRET',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET'
    ];

    const missingVars = [];
    const presentVars = [];

    for (const varName of requiredVars) {
      if (!process.env[varName] || process.env[varName] === 'your-value-here' || process.env[varName].includes('YOUR_')) {
        missingVars.push(varName);
        allChecksPass = false;
      } else {
        presentVars.push(varName);
      }
    }

    if (presentVars.length > 0) {
      console.log(chalk.green(`✅ Found ${presentVars.length} environment variables:`));
      presentVars.forEach(varName => {
        const value = process.env[varName];
        const displayValue = varName.includes('SECRET') || varName.includes('KEY') 
          ? `${value.substring(0, 10)}...` 
          : value.length > 50 
            ? `${value.substring(0, 50)}...` 
            : value;
        console.log(chalk.green(`   ✓ ${varName}: ${displayValue}`));
      });
    }

    if (missingVars.length > 0) {
      console.log(chalk.red(`❌ Missing ${missingVars.length} environment variables:`));
      missingVars.forEach(varName => {
        console.log(chalk.red(`   ✗ ${varName}`));
      });
      issues.push(`Missing environment variables: ${missingVars.join(', ')}`);
    }

    // 2. Validate Environment Variable Formats
    console.log(chalk.yellow('\n🔧 Step 2: Validating Environment Variable Formats...'));

    // Check Supabase URL format
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      if (supabaseUrl.includes('supabase.co') && supabaseUrl.startsWith('https://')) {
        console.log(chalk.green(`   ✓ SUPABASE_URL format looks correct`));
      } else {
        console.log(chalk.red(`   ✗ SUPABASE_URL format incorrect: ${supabaseUrl}`));
        issues.push('SUPABASE_URL should be https://your-project-id.supabase.co');
        allChecksPass = false;
      }
    }

    // Check Database URL format
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
      if (dbUrl.includes('supabase.co') && dbUrl.startsWith('postgresql://')) {
        if (dbUrl.includes('[YOUR-PASSWORD]') || dbUrl.includes('YOUR_PASSWORD')) {
          console.log(chalk.red(`   ✗ DATABASE_URL still contains placeholder password`));
          issues.push('Replace [YOUR-PASSWORD] or YOUR_PASSWORD with actual database password');
          allChecksPass = false;
        } else {
          console.log(chalk.green(`   ✓ DATABASE_URL format looks correct`));
        }
      } else {
        console.log(chalk.red(`   ✗ DATABASE_URL format incorrect`));
        issues.push('DATABASE_URL should start with postgresql:// and include supabase.co');
        allChecksPass = false;
      }
    }

    // Check NEXTAUTH_SECRET length
    const nextAuthSecret = process.env.NEXTAUTH_SECRET;
    if (nextAuthSecret) {
      if (nextAuthSecret.length >= 32 && !nextAuthSecret.includes('your-secret')) {
        console.log(chalk.green(`   ✓ NEXTAUTH_SECRET length is sufficient (${nextAuthSecret.length} chars)`));
      } else {
        console.log(chalk.red(`   ✗ NEXTAUTH_SECRET is too short or uses placeholder`));
        issues.push('NEXTAUTH_SECRET should be at least 32 characters. Generate with: openssl rand -base64 32');
        allChecksPass = false;
      }
    }

    // Check JWT token format for API keys
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (anonKey) {
      if (anonKey.startsWith('eyJ') && anonKey.includes('.')) {
        console.log(chalk.green(`   ✓ SUPABASE_ANON_KEY appears to be valid JWT`));
      } else {
        console.log(chalk.red(`   ✗ SUPABASE_ANON_KEY doesn't look like valid JWT`));
        issues.push('SUPABASE_ANON_KEY should be a JWT token starting with eyJ');
        allChecksPass = false;
      }
    }

    // 3. Test Supabase Connection
    console.log(chalk.yellow('\n🔗 Step 3: Testing Supabase Connection...'));

    if (supabaseUrl && anonKey) {
      try {
        const supabase = createClient(supabaseUrl, anonKey);
        
        // Test basic connection
        const { data, error } = await supabase.from('_supabase_migrations').select('*').limit(1);
        
        if (!error || error.code === 'PGRST116') { // PGRST116 = table doesn't exist (which is fine)
          console.log(chalk.green(`   ✓ Supabase client connection successful`));
        } else {
          console.log(chalk.red(`   ✗ Supabase connection failed: ${error.message}`));
          issues.push(`Supabase connection error: ${error.message}`);
          allChecksPass = false;
        }
      } catch (error) {
        console.log(chalk.red(`   ✗ Supabase connection error: ${error.message}`));
        issues.push(`Supabase connection error: ${error.message}`);
        allChecksPass = false;
      }
    }

    // 4. Test Database Connection (if Prisma is available)
    console.log(chalk.yellow('\n🗄️ Step 4: Testing Database Connection...'));

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      await prisma.$connect();
      console.log(chalk.green(`   ✓ Database connection successful`));
      
      // Test if schema exists
      try {
        const userCount = await prisma.user.count();
        console.log(chalk.green(`   ✓ Database schema exists (${userCount} users found)`));
      } catch (schemaError) {
        console.log(chalk.yellow(`   ⚠️  Database connected but schema not deployed yet`));
        console.log(chalk.gray(`      Run: npx prisma db push`));
      }
      
      await prisma.$disconnect();
    } catch (error) {
      console.log(chalk.red(`   ✗ Database connection failed: ${error.message}`));
      issues.push(`Database connection error: ${error.message}`);
      allChecksPass = false;
    }

    // 5. Validate Production Settings
    console.log(chalk.yellow('\n🏭 Step 5: Checking Production Settings...'));

    const nextAuthUrl = process.env.NEXTAUTH_URL;
    if (nextAuthUrl) {
      if (nextAuthUrl.startsWith('https://') && !nextAuthUrl.includes('localhost')) {
        console.log(chalk.green(`   ✓ NEXTAUTH_URL is production-ready: ${nextAuthUrl}`));
      } else {
        console.log(chalk.yellow(`   ⚠️  NEXTAUTH_URL might be for development: ${nextAuthUrl}`));
        if (nextAuthUrl.includes('localhost')) {
          issues.push('NEXTAUTH_URL should be your production domain, not localhost');
          allChecksPass = false;
        }
      }
    }

    const nodeEnv = process.env.NODE_ENV;
    if (nodeEnv === 'production') {
      console.log(chalk.green(`   ✓ NODE_ENV set to production`));
    } else {
      console.log(chalk.yellow(`   ⚠️  NODE_ENV is set to: ${nodeEnv || 'undefined'}`));
    }

    // Final Results
    console.log(chalk.yellow('\n📊 Verification Results:'));
    console.log(chalk.gray('=' .repeat(50)));

    if (allChecksPass) {
      console.log(chalk.green('🎉 All checks passed! Your Supabase setup looks good!'));
      console.log(chalk.green('\n✅ Ready for production deployment!'));
      console.log(chalk.gray('\nNext steps:'));
      console.log(chalk.gray('1. Deploy your app to your hosting platform'));
      console.log(chalk.gray('2. Run: node scripts/setup-supabase-production.js'));
      console.log(chalk.gray('3. Test your deployed app'));
    } else {
      console.log(chalk.red(`❌ ${issues.length} issue(s) found that need attention:`));
      issues.forEach((issue, index) => {
        console.log(chalk.red(`   ${index + 1}. ${issue}`));
      });
      console.log(chalk.yellow('\n🔧 Please fix these issues before deploying to production.'));
    }

  } catch (error) {
    console.error(chalk.red('❌ Verification failed with error:'), error.message);
    console.log(chalk.yellow('\n💡 Make sure you have all dependencies installed:'));
    console.log(chalk.gray('npm install @supabase/supabase-js @prisma/client'));
  }
}

// Export for use in other scripts
module.exports = { verifySupabaseSetup };

// Run verification if called directly
if (require.main === module) {
  // Load environment variables
  try {
    require('dotenv').config({ path: '.env.local' });
  } catch (e) {
    // dotenv not available, that's ok
  }
  
  verifySupabaseSetup().catch(console.error);
}
