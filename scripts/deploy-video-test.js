#!/usr/bin/env node

/**
 * Deploy MindSpring Video Calling Test
 * Quick deployment script for testing video calling online
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎥 MindSpring Video Calling - Quick Deploy Script');
console.log('=====================================================\n');

function runCommand(command, description) {
  console.log(`📋 ${description}...`);
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'inherit' });
    console.log(`✅ ${description} completed\n`);
    return output;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

function checkPrerequisites() {
  console.log('🔍 Checking prerequisites...');
  
  // Check if Node.js version is compatible
  const nodeVersion = process.version;
  console.log(`   Node.js version: ${nodeVersion}`);
  
  // Check if npm is available
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log(`   NPM version: ${npmVersion}`);
  } catch (error) {
    console.error('❌ NPM not found. Please install Node.js and NPM.');
    process.exit(1);
  }
  
  // Check if project builds locally
  console.log('   Testing local build...');
  try {
    execSync('npm run build', { stdio: 'pipe' });
    console.log('✅ Prerequisites check passed\n');
  } catch (error) {
    console.error('❌ Build failed. Please fix build errors first.');
    console.error('Run "npm run build" to see detailed errors.');
    process.exit(1);
  }
}

function checkVercelCLI() {
  console.log('🔧 Checking Vercel CLI...');
  try {
    const vercelVersion = execSync('vercel --version', { encoding: 'utf8' }).trim();
    console.log(`   Vercel CLI version: ${vercelVersion}`);
    console.log('✅ Vercel CLI found\n');
    return true;
  } catch (error) {
    console.log('   Vercel CLI not found. Installing...');
    runCommand('npm install -g vercel', 'Installing Vercel CLI');
    return true;
  }
}

function deployToVercel() {
  console.log('🚀 Deploying to Vercel...');
  console.log('   This will open your browser for authentication if needed.\n');
  
  try {
    // Deploy with Vercel
    const deployOutput = execSync('vercel --prod --yes', { encoding: 'utf8' });
    
    // Extract the deployed URL from output
    const urlMatch = deployOutput.match(/https:\/\/[^\s]+/);
    const deployedURL = urlMatch ? urlMatch[0] : null;
    
    if (deployedURL) {
      console.log('🎉 DEPLOYMENT SUCCESSFUL!');
      console.log('=========================');
      console.log(`📱 Your app is live at: ${deployedURL}`);
      console.log(`🎥 Video test page: ${deployedURL}/test-video-calls`);
      console.log(`🔧 WebRTC test page: ${deployedURL}/webrtc-test`);
      console.log('\n📋 Testing checklist:');
      console.log('   □ Open video test page');
      console.log('   □ Grant camera/microphone permissions');
      console.log('   □ Test video calling interface');
      console.log('   □ Test study tools sidebar');
      console.log('   □ Test on mobile device');
      console.log('\n🎯 Ready to test your video calling system online!');
    } else {
      console.log('✅ Deployment completed! Check Vercel dashboard for URL.');
    }
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    console.log('\n🛠️  Try manual deployment:');
    console.log('   1. Run: vercel login');
    console.log('   2. Run: vercel --prod');
    console.log('   3. Follow the prompts');
    process.exit(1);
  }
}

function main() {
  try {
    checkPrerequisites();
    checkVercelCLI();
    deployToVercel();
  } catch (error) {
    console.error('\n❌ Deployment script failed:', error.message);
    console.log('\n📖 Manual deployment guide: See DEPLOY_ONLINE.md');
    process.exit(1);
  }
}

// Run the deployment
main();