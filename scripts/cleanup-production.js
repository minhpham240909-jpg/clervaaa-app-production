#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Directories to clean up
const directories = [
  'app/api',
  'lib',
  'components'
];

// Files to skip (keep console.log for error handling)
const skipFiles = [
  'lib/logger.ts',
  'lib/logger-production.ts'
];

function cleanupFile(filePath) {
  if (skipFiles.some(skip => filePath.includes(skip))) {
    return;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Remove console.log statements but keep console.error and console.warn
    const consoleLogRegex = /^\s*console\.log\([^)]*\);?\s*$/gm;
    if (consoleLogRegex.test(content)) {
      content = content.replace(consoleLogRegex, '');
      modified = true;
    }

    // Remove empty lines that were left after console.log removal
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Cleaned: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error cleaning ${filePath}:`, error.message);
  }
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDirectory(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      cleanupFile(filePath);
    }
  }
}

console.log('🧹 Starting production cleanup...');

for (const dir of directories) {
  const fullPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullPath)) {
    console.log(`📁 Cleaning directory: ${dir}`);
    walkDirectory(fullPath);
  }
}

console.log('✨ Production cleanup completed!');
