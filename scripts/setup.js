#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Clerva Setup Script');
console.log('==========================\n');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  console.log(`\n${colors.blue}${colors.bold}${step}${colors.reset} ${message}`);
}

function checkPrerequisites() {
  logStep('1️⃣', 'Checking prerequisites...');
  
  // Check Node.js version
  try {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 18) {
      log(`❌ Node.js version ${nodeVersion} detected. MindSpring requires Node.js 18.0 or later.`, 'red');
      log('Please update Node.js and try again.', 'yellow');
      process.exit(1);
    }
    
    log(`✅ Node.js ${nodeVersion} detected`, 'green');
  } catch (error) {
    log('❌ Could not detect Node.js version', 'red');
    process.exit(1);
  }
  
  // Check npm
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    log(`✅ npm ${npmVersion} detected`, 'green');
  } catch (error) {
    log('❌ npm not found. Please install npm and try again.', 'red');
    process.exit(1);
  }
}

function installDependencies() {
  logStep('2️⃣', 'Installing dependencies...');
  
  try {
    log('Installing npm packages...', 'yellow');
    execSync('npm install', { stdio: 'inherit' });
    log('✅ Dependencies installed successfully', 'green');
  } catch (error) {
    log('❌ Failed to install dependencies', 'red');
    log('Please check your internet connection and try again.', 'yellow');
    process.exit(1);
  }
}

function setupEnvironment() {
  logStep('3️⃣', 'Setting up environment...');
  
  const envExamplePath = path.join(__dirname, '..', '.env.example');
  const envLocalPath = path.join(__dirname, '..', '.env.local');
  
  if (!fs.existsSync(envExamplePath)) {
    log('❌ .env.example file not found', 'red');
    log('Please ensure the .env.example file exists in the project root.', 'yellow');
    process.exit(1);
  }
  
  if (fs.existsSync(envLocalPath)) {
    log('⚠️  .env.local already exists. Skipping environment setup.', 'yellow');
    log('Please review your .env.local file to ensure all required variables are set.', 'blue');
  } else {
    try {
      fs.copyFileSync(envExamplePath, envLocalPath);
      log('✅ Created .env.local from .env.example', 'green');
      log('📝 Please edit .env.local with your actual configuration values.', 'blue');
    } catch (error) {
      log('❌ Failed to create .env.local file', 'red');
      process.exit(1);
    }
  }
}

function generatePrismaClient() {
  logStep('4️⃣', 'Setting up database...');
  
  try {
    log('Generating Prisma client...', 'yellow');
    execSync('npm run db:generate', { stdio: 'inherit' });
    log('✅ Prisma client generated successfully', 'green');
  } catch (error) {
    log('❌ Failed to generate Prisma client', 'red');
    log('This might be due to missing environment variables.', 'yellow');
    log('Please ensure your .env.local file is properly configured.', 'blue');
  }
}

function generateAssets() {
  logStep('5️⃣', 'Generating PWA assets...');
  
  try {
    log('Generating icons and screenshots...', 'yellow');
    execSync('node scripts/generate-icons.js', { stdio: 'inherit' });
    execSync('node scripts/generate-screenshots.js', { stdio: 'inherit' });
    log('✅ PWA assets generated successfully', 'green');
  } catch (error) {
    log('❌ Failed to generate PWA assets', 'red');
    log('This is not critical for development, but PWA features may not work properly.', 'yellow');
  }
}

function runTests() {
  logStep('6️⃣', 'Running tests...');
  
  try {
    log('Running test suite...', 'yellow');
    execSync('npm test -- --passWithNoTests', { stdio: 'inherit' });
    log('✅ Tests completed successfully', 'green');
  } catch (error) {
    log('⚠️  Some tests failed. This is normal for initial setup.', 'yellow');
    log('You can run tests later with: npm test', 'blue');
  }
}

function showNextSteps() {
  logStep('🎉', 'Setup completed!');
  
  console.log('\n📋 Next Steps:');
  console.log('==============');
  
  console.log('\n1. Configure your environment:');
  console.log('   - Edit .env.local with your actual values');
  console.log('   - Set up your database (PostgreSQL recommended)');
  console.log('   - Configure OAuth providers (Google, GitHub)');
  
  console.log('\n2. Set up your database:');
  console.log('   - Run: npm run db:push');
  console.log('   - Run: npm run db:seed');
  
  console.log('\n3. Start development:');
  console.log('   - Run: npm run dev');
  console.log('   - Open: http://localhost:3000');
  
  console.log('\n4. Additional setup (optional):');
  console.log('   - Set up Supabase for real-time features');
  console.log('   - Configure OpenAI API for AI features');
  console.log('   - Set up push notifications');
  
  console.log('\n📚 Documentation:');
  console.log('==================');
  console.log('- README.md - Project overview and features');
  console.log('- SECURITY.md - Security considerations');
  console.log('- CLAUDE.md - Development guidelines');
  console.log('- PROJECT_AUDIT.md - Project analysis');
  
  console.log('\n🔧 Available Scripts:');
  console.log('=====================');
  console.log('- npm run dev          - Start development server');
  console.log('- npm run build        - Build for production');
  console.log('- npm run start        - Start production server');
  console.log('- npm run test         - Run tests');
  console.log('- npm run lint         - Run ESLint');
  console.log('- npm run format       - Format code with Prettier');
  console.log('- npm run db:studio    - Open Prisma Studio');
  console.log('- npm run db:seed      - Seed database');
  
  console.log('\n🎯 Getting Help:');
  console.log('================');
  console.log('- Check the documentation files');
  console.log('- Review the PROJECT_AUDIT.md for missing components');
  console.log('- Ensure all environment variables are set');
  console.log('- Check the console for any error messages');
  
  log('\n🚀 Happy coding!', 'green');
}

function main() {
  try {
    checkPrerequisites();
    installDependencies();
    setupEnvironment();
    generatePrismaClient();
    generateAssets();
    runTests();
    showNextSteps();
  } catch (error) {
    log(`\n❌ Setup failed: ${error.message}`, 'red');
    log('Please check the error messages above and try again.', 'yellow');
    process.exit(1);
  }
}

// Run the setup
main();
