#!/usr/bin/env node

/**
 * MindSpring Production Supabase Setup Script
 * 
 * This script helps set up your Supabase database for production deployment.
 * Run this after you've configured your Supabase project and environment variables.
 */

const { PrismaClient } = require('@prisma/client');
const chalk = require('chalk');

// Initialize Prisma client
const prisma = new PrismaClient();

async function setupSupabaseProduction() {
  console.log(chalk.blue('🚀 MindSpring Production Supabase Setup'));
  console.log(chalk.gray('=' .repeat(50)));

  try {
    // Test database connection
    console.log(chalk.yellow('📡 Testing database connection...'));
    await prisma.$connect();
    console.log(chalk.green('✅ Database connection successful!'));

    // Check if database is empty
    console.log(chalk.yellow('🔍 Checking database state...'));
    
    const userCount = await prisma.user.count();
    const subjectCount = await prisma.subject.count();

    if (userCount === 0 && subjectCount === 0) {
      console.log(chalk.blue('📊 Database is empty, running initial setup...'));
      
      // Run database push
      console.log(chalk.yellow('🔧 Pushing database schema...'));
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);
      
      try {
        await execAsync('npx prisma db push --force-reset');
        console.log(chalk.green('✅ Database schema pushed successfully!'));
      } catch (error) {
        console.log(chalk.red('❌ Error pushing schema:'), error.message);
        throw error;
      }

      // Generate Prisma client
      console.log(chalk.yellow('🔧 Generating Prisma client...'));
      try {
        await execAsync('npx prisma generate');
        console.log(chalk.green('✅ Prisma client generated successfully!'));
      } catch (error) {
        console.log(chalk.red('❌ Error generating client:'), error.message);
        throw error;
      }

      // Seed initial data
      console.log(chalk.yellow('🌱 Seeding initial data...'));
      await seedInitialData();
      
    } else {
      console.log(chalk.green(`✅ Database already has data (${userCount} users, ${subjectCount} subjects)`));
    }

    // Verify environment variables
    console.log(chalk.yellow('🔧 Verifying environment configuration...'));
    await verifyEnvironmentVariables();

    console.log(chalk.green('\n🎉 Production setup completed successfully!'));
    console.log(chalk.gray('Your MindSpring app is ready for production deployment.'));

  } catch (error) {
    console.error(chalk.red('❌ Setup failed:'), error.message);
    console.log(chalk.yellow('\n🔍 Troubleshooting tips:'));
    console.log('1. Verify your DATABASE_URL is correct');
    console.log('2. Check that Supabase project is running');
    console.log('3. Ensure your database password is correct');
    console.log('4. Verify your network connection');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function seedInitialData() {
  try {
    // Create default subjects
    const subjects = [
      { name: 'Mathematics', category: 'STEM', description: 'All areas of mathematics' },
      { name: 'Computer Science', category: 'STEM', description: 'Programming and computer science' },
      { name: 'Physics', category: 'STEM', description: 'Physics and physical sciences' },
      { name: 'Chemistry', category: 'STEM', description: 'Chemistry and chemical sciences' },
      { name: 'Biology', category: 'STEM', description: 'Biology and life sciences' },
      { name: 'English Literature', category: 'Arts', description: 'English literature and writing' },
      { name: 'History', category: 'Social Sciences', description: 'History and historical studies' },
      { name: 'Psychology', category: 'Social Sciences', description: 'Psychology and behavioral sciences' },
      { name: 'Business', category: 'Business', description: 'Business studies and management' },
      { name: 'Economics', category: 'Social Sciences', description: 'Economics and economic theory' }
    ];

    for (const subject of subjects) {
      await prisma.subject.upsert({
        where: { name: subject.name },
        update: {},
        create: subject
      });
    }

    console.log(chalk.green('✅ Initial subjects created'));

    // Create default achievements
    const achievements = [
      {
        name: 'First Study Session',
        description: 'Complete your first study session',
        icon: '🎯',
        category: 'MILESTONE',
        rarity: 'COMMON',
        criteria: JSON.stringify({ action: 'complete_study_session', count: 1 })
      },
      {
        name: 'Study Streak - 7 Days',
        description: 'Study for 7 consecutive days',
        icon: '🔥',
        category: 'CONSISTENCY',
        rarity: 'UNCOMMON',
        criteria: JSON.stringify({ action: 'study_streak', days: 7 })
      },
      {
        name: 'Early Bird',
        description: 'Complete 10 morning study sessions',
        icon: '🌅',
        category: 'STUDY_TIME',
        rarity: 'RARE',
        criteria: JSON.stringify({ action: 'morning_studies', count: 10 })
      }
    ];

    for (const achievement of achievements) {
      await prisma.achievement.upsert({
        where: { name: achievement.name },
        update: {},
        create: achievement
      });
    }

    console.log(chalk.green('✅ Initial achievements created'));

  } catch (error) {
    console.log(chalk.red('❌ Error seeding data:'), error.message);
    throw error;
  }
}

async function verifyEnvironmentVariables() {
  const requiredVars = [
    'DATABASE_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];

  const missingVars = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    console.log(chalk.red('❌ Missing required environment variables:'));
    missingVars.forEach(varName => {
      console.log(chalk.red(`   - ${varName}`));
    });
    throw new Error(`Missing ${missingVars.length} required environment variables`);
  }

  console.log(chalk.green('✅ All required environment variables are set'));

  // Check Supabase URL format
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl && !supabaseUrl.includes('.supabase.co')) {
    console.log(chalk.yellow('⚠️  Warning: Supabase URL might be incorrect'));
  }

  // Check database URL format
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && !dbUrl.includes('supabase.co')) {
    console.log(chalk.yellow('⚠️  Warning: Database URL might not be pointing to Supabase'));
  }
}

// Run the setup
if (require.main === module) {
  setupSupabaseProduction().catch(console.error);
}

module.exports = { setupSupabaseProduction };
