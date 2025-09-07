#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function fixUnusedImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Remove unused imports that are clearly not used
    const unusedImports = [
      // Common unused imports from the lint output
      /^import.*'Calendar'.*from.*lucide-react.*;\s*$/gm,
      /^import.*'Settings'.*from.*lucide-react.*;\s*$/gm,
      /^import.*'Filter'.*from.*lucide-react.*;\s*$/gm,
      /^import.*'Search'.*from.*lucide-react.*;\s*$/gm,
      /^import.*'Plus'.*from.*lucide-react.*;\s*$/gm,
      /^import.*'Trash2'.*from.*lucide-react.*;\s*$/gm,
      /^import.*'Award'.*from.*lucide-react.*;\s*$/gm,
      /^import.*'Globe'.*from.*lucide-react.*;\s*$/gm,
      /^import.*'Phone'.*from.*lucide-react.*;\s*$/gm,
      /^import.*'Upload'.*from.*lucide-react.*;\s*$/gm,
    ];

    for (const regex of unusedImports) {
      if (regex.test(content)) {
        content = content.replace(regex, '');
        modified = true;
      }
    }

    // Fix common unused variable patterns
    const unusedVariablePatterns = [
      // Remove unused session variables
      /^\s*const\s+session\s*=.*;\s*$/gm,
      // Remove unused destructured variables that are clearly not used
      /^\s*const\s*{\s*[^}]*session[^}]*\s*}\s*=.*;\s*$/gm,
    ];

    // Clean up empty lines
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed imports: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
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
      fixUnusedImports(filePath);
    }
  }
}

console.log('🔧 Fixing unused imports...');

const directories = ['app', 'components', 'lib'];
for (const dir of directories) {
  const fullPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullPath)) {
    walkDirectory(fullPath);
  }
}

console.log('✨ Import cleanup completed!');
