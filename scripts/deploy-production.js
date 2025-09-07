#!/usr/bin/env node

/**
 * Production Deployment Script for MindSpring
 * Handles security checks, testing, and deployment preparation
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 MindSpring Production Deployment Script');
console.log('==========================================\n');

// Color codes for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, status = 'info') {
  const statusIcon = status === 'success' ? '✅' : status === 'error' ? '❌' : status === 'warning' ? '⚠️' : 'ℹ️';
  const statusColor = status === 'success' ? 'green' : status === 'error' ? 'red' : status === 'warning' ? 'yellow' : 'blue';
  log(`${statusIcon} ${step}`, statusColor);
}

function runCommand(command, description) {
  try {
    logStep(description, 'info');
    execSync(command, { stdio: 'inherit' });
    logStep(description, 'success');
    return true;
  } catch (error) {
    logStep(description, 'error');
    log(`Command failed: ${command}`, 'red');
    return false;
  }
}

function checkEnvironment() {
  logStep('Checking environment variables', 'info');
  
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET'
  ];

  const missingVars = [];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }

  if (missingVars.length > 0) {
    logStep('Environment variables check', 'error');
    log(`Missing required environment variables: ${missingVars.join(', ')}`, 'red');
    log('Please check your .env.local file and ensure all required variables are set.', 'yellow');
    return false;
  }

  logStep('Environment variables check', 'success');
  return true;
}

function checkSecurity() {
  logStep('Running security audit', 'info');
  
  // Check for npm vulnerabilities
  try {
    const auditResult = execSync('npm audit --audit-level=moderate', { encoding: 'utf8' });
    if (auditResult.includes('found 0 vulnerabilities')) {
      logStep('Security audit', 'success');
    } else {
      logStep('Security audit', 'warning');
      log('Vulnerabilities found. Consider running: npm audit fix', 'yellow');
    }
  } catch (error) {
    logStep('Security audit', 'error');
    return false;
  }

  // Check for console statements in production code
  const consoleStatements = execSync('grep -r "console\\." app/ components/ lib/ --include="*.ts" --include="*.tsx" | wc -l', { encoding: 'utf8' }).trim();
  
  if (parseInt(consoleStatements) > 0) {
    logStep('Console statements check', 'warning');
    log(`Found ${consoleStatements} console statements. Consider removing them for production.`, 'yellow');
  } else {
    logStep('Console statements check', 'success');
  }

  return true;
}

function runTests() {
  logStep('Running tests', 'info');
  
  // Run type checking
  if (!runCommand('npm run type-check', 'TypeScript type checking')) {
    return false;
  }

  // Run linting
  if (!runCommand('npm run lint', 'ESLint code quality check')) {
    logStep('ESLint check', 'warning');
    log('Code quality issues found. Consider fixing them before deployment.', 'yellow');
  }

  // Run tests
  if (!runCommand('npm test', 'Unit and integration tests')) {
    logStep('Tests', 'warning');
    log('Some tests are failing. Consider fixing them before deployment.', 'yellow');
  }

  return true;
}

function buildApplication() {
  logStep('Building application', 'info');
  
  // Clean previous build
  if (fs.existsSync('.next')) {
    execSync('rm -rf .next');
  }

  // Build the application
  if (!runCommand('npm run build', 'Next.js build')) {
    return false;
  }

  // Check build size
  const buildSize = execSync('du -sh .next', { encoding: 'utf8' }).trim();
  log(`Build size: ${buildSize}`, 'blue');

  return true;
}

function generateDeploymentFiles() {
  logStep('Generating deployment files', 'info');

  // Create production environment template
  const envTemplate = `# Production Environment Variables
# Copy this to your production environment

DATABASE_URL="${process.env.DATABASE_URL || 'your-production-database-url'}"
NEXTAUTH_URL="${process.env.NEXTAUTH_URL || 'https://your-domain.com'}"
NEXTAUTH_SECRET="${process.env.NEXTAUTH_SECRET || 'your-production-secret'}"
GOOGLE_CLIENT_ID="${process.env.GOOGLE_CLIENT_ID || 'your-google-client-id'}"
GOOGLE_CLIENT_SECRET="${process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret'}"

# Set production mode
NODE_ENV="production"
`;

  fs.writeFileSync('production.env.template', envTemplate);
  logStep('Generated production.env.template', 'success');

  // Create deployment checklist
  const checklist = `# Production Deployment Checklist

## Pre-Deployment
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Domain configured
- [ ] Monitoring tools set up

## Post-Deployment
- [ ] Health checks passing
- [ ] Performance monitoring active
- [ ] Error tracking configured
- [ ] Backup system tested
- [ ] User acceptance testing completed

## Security Checklist
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Rate limiting active
- [ ] Input validation working
- [ ] Authentication tested

## Performance Checklist
- [ ] Page load times < 3 seconds
- [ ] Database queries optimized
- [ ] CDN configured
- [ ] Caching strategy implemented
- [ ] Load testing completed
`;

  fs.writeFileSync('DEPLOYMENT_CHECKLIST.md', checklist);
  logStep('Generated DEPLOYMENT_CHECKLIST.md', 'success');

  return true;
}

function main() {
  log('Starting production deployment preparation...\n', 'bold');

  const checks = [
    { name: 'Environment Check', fn: checkEnvironment },
    { name: 'Security Check', fn: checkSecurity },
    { name: 'Testing', fn: runTests },
    { name: 'Build Process', fn: buildApplication },
    { name: 'Deployment Files', fn: generateDeploymentFiles }
  ];

  let allPassed = true;

  for (const check of checks) {
    log(`\n${colors.bold}${check.name}${colors.reset}`);
    log('─'.repeat(check.name.length));
    
    if (!check.fn()) {
      allPassed = false;
      log(`\n${colors.red}❌ ${check.name} failed${colors.reset}\n`);
      break;
    }
    
    log(`\n${colors.green}✅ ${check.name} completed${colors.reset}\n`);
  }

  if (allPassed) {
    log('\n🎉 Production deployment preparation completed successfully!', 'green');
    log('\nNext steps:', 'bold');
    log('1. Review the generated files (production.env.template, DEPLOYMENT_CHECKLIST.md)');
    log('2. Set up your production environment with the required variables');
    log('3. Choose your hosting platform (Vercel, Netlify, AWS, etc.)');
    log('4. Deploy your application');
    log('5. Run the post-deployment checklist');
  } else {
    log('\n❌ Production deployment preparation failed!', 'red');
    log('Please fix the issues above before proceeding with deployment.', 'yellow');
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  checkEnvironment,
  checkSecurity,
  runTests,
  buildApplication,
  generateDeploymentFiles
};
