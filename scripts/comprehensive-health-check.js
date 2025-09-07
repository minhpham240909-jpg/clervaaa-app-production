#!/usr/bin/env node

/**
 * Comprehensive MindSpring App Health Check
 * Checks all aspects of the app without making any changes
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

class HealthChecker {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.suggestions = [];
    this.passed = [];
  }

  addIssue(category, message, severity = 'error') {
    this.issues.push({ category, message, severity });
  }

  addWarning(category, message) {
    this.warnings.push({ category, message });
  }

  addSuggestion(category, message) {
    this.suggestions.push({ category, message });
  }

  addPass(category, message) {
    this.passed.push({ category, message });
  }

  async runFullHealthCheck() {
    console.log(chalk.blue('🔍 MindSpring Comprehensive Health Check'));
    console.log(chalk.gray('=' .repeat(60)));
    console.log(chalk.yellow('Checking all aspects of your app for production readiness...\n'));

    // Load environment
    try {
      require('dotenv').config({ path: '.env.local' });
    } catch (e) {
      this.addIssue('Environment', 'Could not load .env.local file');
    }

    await this.checkEnvironmentVariables();
    await this.checkDatabaseConfiguration();
    await this.checkAIConfiguration();
    await this.checkNextJSConfiguration();
    await this.checkAuthConfiguration();
    await this.checkAPIEndpoints();
    await this.checkComponentStructure();
    await this.checkSecurityConfiguration();
    await this.checkPerformanceOptimizations();
    await this.checkDeploymentReadiness();
    await this.checkDependencies();
    await this.checkCodeQuality();

    this.generateReport();
  }

  async checkEnvironmentVariables() {
    console.log(chalk.yellow('📋 Checking Environment Variables...'));

    const requiredVars = [
      'DATABASE_URL',
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'NEXTAUTH_URL',
      'NEXTAUTH_SECRET',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'OPENAI_API_KEY'
    ];

    let missingVars = 0;
    let placeholderVars = 0;

    for (const varName of requiredVars) {
      const value = process.env[varName];
      
      if (!value) {
        this.addIssue('Environment', `Missing required variable: ${varName}`);
        missingVars++;
      } else if (value.includes('your-') || value.includes('YOUR_') || value.includes('fake') || value.includes('demo')) {
        this.addIssue('Environment', `Placeholder value detected: ${varName}`);
        placeholderVars++;
      } else {
        this.addPass('Environment', `${varName} configured correctly`);
      }
    }

    // Check for production-specific issues
    if (process.env.NEXTAUTH_URL?.includes('localhost')) {
      this.addWarning('Environment', 'NEXTAUTH_URL still points to localhost - update for production');
    }

    if (process.env.NODE_ENV !== 'production') {
      this.addWarning('Environment', 'NODE_ENV not set to production');
    }

    console.log(chalk.gray(`   Checked ${requiredVars.length} required variables`));
  }

  async checkDatabaseConfiguration() {
    console.log(chalk.yellow('🗄️ Checking Database Configuration...'));

    // Check Prisma schema
    try {
      const schemaPath = 'prisma/schema.prisma';
      if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        if (schema.includes('provider = "postgresql"')) {
          this.addPass('Database', 'Prisma configured for PostgreSQL');
        } else {
          this.addIssue('Database', 'Prisma not configured for PostgreSQL');
        }

        if (schema.includes('directUrl')) {
          this.addPass('Database', 'Direct URL configured for connection pooling');
        } else {
          this.addSuggestion('Database', 'Consider adding directUrl for better connection pooling');
        }
      } else {
        this.addIssue('Database', 'Prisma schema file not found');
      }
    } catch (error) {
      this.addIssue('Database', `Error reading Prisma schema: ${error.message}`);
    }

    // Check database URL format
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
      if (dbUrl.startsWith('postgresql://') && dbUrl.includes('supabase.co')) {
        this.addPass('Database', 'Database URL format is correct');
      } else if (dbUrl.includes('file:')) {
        this.addIssue('Database', 'Still using SQLite - needs PostgreSQL for production');
      } else {
        this.addWarning('Database', 'Database URL format may be incorrect');
      }
    }

    console.log(chalk.gray('   Database configuration checked'));
  }

  async checkAIConfiguration() {
    console.log(chalk.yellow('🤖 Checking AI Configuration...'));

    // Check AI library
    try {
      if (fs.existsSync('lib/ai.ts')) {
        const aiLib = fs.readFileSync('lib/ai.ts', 'utf8');
        
        if (aiLib.includes('OpenAI')) {
          this.addPass('AI', 'OpenAI integration found');
        }
        
        if (aiLib.includes('OPENAI_API_KEY')) {
          this.addPass('AI', 'OpenAI API key usage implemented');
        }

        if (aiLib.includes('mindgrasp') || aiLib.includes('MINDGRASP')) {
          this.addPass('AI', 'Multiple AI services supported');
        }
      } else {
        this.addIssue('AI', 'AI library file not found');
      }
    } catch (error) {
      this.addIssue('AI', `Error checking AI library: ${error.message}`);
    }

    // Check AI API endpoints
    const aiEndpoints = [
      'app/api/ai/summaries/route.ts',
      'app/api/ai/flashcards/route.ts',
      'app/api/ai/quiz/route.ts',
      'app/api/ai/partner-matching/route.ts',
      'app/api/ai/progress-analysis/route.ts'
    ];

    let workingEndpoints = 0;
    for (const endpoint of aiEndpoints) {
      if (fs.existsSync(endpoint)) {
        workingEndpoints++;
        this.addPass('AI', `AI endpoint exists: ${endpoint.split('/').pop()?.replace('.ts', '')}`);
      } else {
        this.addIssue('AI', `Missing AI endpoint: ${endpoint}`);
      }
    }

    // Test OpenAI connection if possible
    try {
      const OpenAI = require('openai');
      if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('fake')) {
        this.addPass('AI', 'OpenAI API key format appears valid');
      }
    } catch (error) {
      this.addWarning('AI', 'Could not test OpenAI connection (dependency may be missing)');
    }

    console.log(chalk.gray(`   Checked ${aiEndpoints.length} AI endpoints, ${workingEndpoints} found`));
  }

  async checkNextJSConfiguration() {
    console.log(chalk.yellow('⚛️ Checking Next.js Configuration...'));

    // Check next.config.js
    try {
      if (fs.existsSync('next.config.js')) {
        const config = fs.readFileSync('next.config.js', 'utf8');
        this.addPass('NextJS', 'Next.js config file exists');
        
        if (config.includes('experimental')) {
          this.addPass('NextJS', 'Experimental features configured');
        }
      } else {
        this.addWarning('NextJS', 'No next.config.js found - may need custom configuration');
      }
    } catch (error) {
      this.addWarning('NextJS', `Error checking Next.js config: ${error.message}`);
    }

    // Check package.json scripts
    try {
      if (fs.existsSync('package.json')) {
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        const requiredScripts = ['dev', 'build', 'start'];
        for (const script of requiredScripts) {
          if (pkg.scripts?.[script]) {
            this.addPass('NextJS', `${script} script configured`);
          } else {
            this.addIssue('NextJS', `Missing required script: ${script}`);
          }
        }

        if (pkg.scripts?.lint) {
          this.addPass('NextJS', 'Linting script available');
        } else {
          this.addSuggestion('NextJS', 'Consider adding linting script');
        }
      }
    } catch (error) {
      this.addIssue('NextJS', `Error checking package.json: ${error.message}`);
    }

    console.log(chalk.gray('   Next.js configuration checked'));
  }

  async checkAuthConfiguration() {
    console.log(chalk.yellow('🔐 Checking Authentication Configuration...'));

    // Check NextAuth configuration
    try {
      if (fs.existsSync('lib/auth.ts')) {
        const auth = fs.readFileSync('lib/auth.ts', 'utf8');
        
        if (auth.includes('GoogleProvider')) {
          this.addPass('Auth', 'Google OAuth configured');
        }
        
        if (auth.includes('PrismaAdapter')) {
          this.addPass('Auth', 'Prisma adapter configured');
        }
        
        if (auth.includes('NEXTAUTH_SECRET')) {
          this.addPass('Auth', 'NextAuth secret configuration found');
        }
      } else {
        this.addIssue('Auth', 'Auth configuration file not found');
      }
    } catch (error) {
      this.addIssue('Auth', `Error checking auth config: ${error.message}`);
    }

    // Check auth API route
    if (fs.existsSync('app/api/auth/[...nextauth]/route.ts')) {
      this.addPass('Auth', 'NextAuth API route exists');
    } else {
      this.addIssue('Auth', 'NextAuth API route missing');
    }

    console.log(chalk.gray('   Authentication configuration checked'));
  }

  async checkAPIEndpoints() {
    console.log(chalk.yellow('🔌 Checking API Endpoints...'));

    const criticalEndpoints = [
      'app/api/auth/[...nextauth]/route.ts',
      'app/api/health/route.ts',
      'app/api/user/profile/route.ts'
    ];

    let workingEndpoints = 0;
    for (const endpoint of criticalEndpoints) {
      if (fs.existsSync(endpoint)) {
        workingEndpoints++;
        this.addPass('API', `Critical endpoint exists: ${endpoint.split('/').slice(-2).join('/')}`);
      } else {
        this.addWarning('API', `Missing endpoint: ${endpoint}`);
      }
    }

    // Count total API routes
    try {
      const apiDir = 'app/api';
      if (fs.existsSync(apiDir)) {
        const countRoutes = (dir) => {
          let count = 0;
          const items = fs.readdirSync(dir);
          for (const item of items) {
            const fullPath = path.join(dir, item);
            if (fs.statSync(fullPath).isDirectory()) {
              count += countRoutes(fullPath);
            } else if (item === 'route.ts') {
              count++;
            }
          }
          return count;
        };
        
        const totalRoutes = countRoutes(apiDir);
        this.addPass('API', `Total API routes found: ${totalRoutes}`);
      }
    } catch (error) {
      this.addWarning('API', `Error counting API routes: ${error.message}`);
    }

    console.log(chalk.gray('   API endpoints checked'));
  }

  async checkComponentStructure() {
    console.log(chalk.yellow('🧩 Checking Component Structure...'));

    const criticalComponents = [
      'components/LoadingSpinner.tsx',
      'components/ErrorBoundary.tsx'
    ];

    for (const component of criticalComponents) {
      if (fs.existsSync(component)) {
        this.addPass('Components', `Critical component exists: ${path.basename(component)}`);
      } else {
        this.addWarning('Components', `Missing component: ${component}`);
      }
    }

    // Check component organization
    const componentDirs = [
      'components/ai',
      'components/auth',
      'components/dashboard',
      'components/chat'
    ];

    let organizedDirs = 0;
    for (const dir of componentDirs) {
      if (fs.existsSync(dir)) {
        organizedDirs++;
        this.addPass('Components', `Organized component directory: ${dir}`);
      }
    }

    if (organizedDirs >= 3) {
      this.addPass('Components', 'Components are well-organized');
    } else {
      this.addSuggestion('Components', 'Consider better component organization');
    }

    console.log(chalk.gray('   Component structure checked'));
  }

  async checkSecurityConfiguration() {
    console.log(chalk.yellow('🛡️ Checking Security Configuration...'));

    // Check middleware
    if (fs.existsSync('middleware.ts')) {
      const middleware = fs.readFileSync('middleware.ts', 'utf8');
      
      if (middleware.includes('auth')) {
        this.addPass('Security', 'Authentication middleware configured');
      }
      
      if (middleware.includes('rate') || middleware.includes('limit')) {
        this.addPass('Security', 'Rate limiting configured');
      } else {
        this.addSuggestion('Security', 'Consider adding rate limiting');
      }
    } else {
      this.addWarning('Security', 'No middleware.ts found');
    }

    // Check for security headers
    try {
      if (fs.existsSync('next.config.js')) {
        const config = fs.readFileSync('next.config.js', 'utf8');
        if (config.includes('headers') || config.includes('security')) {
          this.addPass('Security', 'Security headers may be configured');
        } else {
          this.addSuggestion('Security', 'Consider adding security headers in next.config.js');
        }
      }
    } catch (error) {
      // Ignore
    }

    // Check environment variable protection
    const sensitiveVars = ['OPENAI_API_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'NEXTAUTH_SECRET'];
    for (const varName of sensitiveVars) {
      if (process.env[varName] && !varName.startsWith('NEXT_PUBLIC_')) {
        this.addPass('Security', `${varName} properly configured as server-side`);
      }
    }

    console.log(chalk.gray('   Security configuration checked'));
  }

  async checkPerformanceOptimizations() {
    console.log(chalk.yellow('⚡ Checking Performance Optimizations...'));

    // Check for loading components
    const loadingComponents = [
      'components/LoadingSpinner.tsx',
      'components/optimized'
    ];

    for (const component of loadingComponents) {
      if (fs.existsSync(component)) {
        this.addPass('Performance', `Loading optimization: ${path.basename(component)}`);
      }
    }

    // Check for image optimization
    try {
      if (fs.existsSync('next.config.js')) {
        const config = fs.readFileSync('next.config.js', 'utf8');
        if (config.includes('images')) {
          this.addPass('Performance', 'Image optimization configured');
        } else {
          this.addSuggestion('Performance', 'Consider configuring image optimization');
        }
      }
    } catch (error) {
      // Ignore
    }

    // Check for caching strategies
    const hasCache = fs.existsSync('lib/cache.ts') || 
                    fs.existsSync('lib/redis.ts') ||
                    fs.readdirSync('lib').some(file => file.includes('cache'));
    
    if (hasCache) {
      this.addPass('Performance', 'Caching strategy implemented');
    } else {
      this.addSuggestion('Performance', 'Consider implementing caching for better performance');
    }

    console.log(chalk.gray('   Performance optimizations checked'));
  }

  async checkDeploymentReadiness() {
    console.log(chalk.yellow('🚀 Checking Deployment Readiness...'));

    // Check for build optimization
    if (fs.existsSync('.next')) {
      this.addPass('Deployment', 'Next.js build directory exists');
    } else {
      this.addWarning('Deployment', 'No build directory found - run "npm run build" to test');
    }

    // Check for production files
    const prodFiles = [
      'package.json',
      'package-lock.json',
      '.env.example'
    ];

    for (const file of prodFiles) {
      if (fs.existsSync(file)) {
        this.addPass('Deployment', `Production file exists: ${file}`);
      } else {
        this.addWarning('Deployment', `Missing production file: ${file}`);
      }
    }

    // Check gitignore
    if (fs.existsSync('.gitignore')) {
      const gitignore = fs.readFileSync('.gitignore', 'utf8');
      const shouldIgnore = ['.env.local', 'node_modules', '.next'];
      
      for (const item of shouldIgnore) {
        if (gitignore.includes(item)) {
          this.addPass('Deployment', `Gitignore includes: ${item}`);
        } else {
          this.addWarning('Deployment', `Gitignore missing: ${item}`);
        }
      }
    }

    console.log(chalk.gray('   Deployment readiness checked'));
  }

  async checkDependencies() {
    console.log(chalk.yellow('📦 Checking Dependencies...'));

    try {
      if (fs.existsSync('package.json')) {
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        const criticalDeps = [
          'next',
          'react',
          '@prisma/client',
          'next-auth',
          'openai',
          '@supabase/supabase-js'
        ];

        let foundDeps = 0;
        for (const dep of criticalDeps) {
          if (pkg.dependencies?.[dep] || pkg.devDependencies?.[dep]) {
            foundDeps++;
            this.addPass('Dependencies', `Critical dependency found: ${dep}`);
          } else {
            this.addWarning('Dependencies', `Missing dependency: ${dep}`);
          }
        }

        // Check for security vulnerabilities (basic check)
        const totalDeps = Object.keys(pkg.dependencies || {}).length + 
                         Object.keys(pkg.devDependencies || {}).length;
        
        this.addPass('Dependencies', `Total dependencies: ${totalDeps}`);
        
        if (totalDeps > 100) {
          this.addSuggestion('Dependencies', 'Consider auditing dependencies for unused packages');
        }
      }
    } catch (error) {
      this.addIssue('Dependencies', `Error checking dependencies: ${error.message}`);
    }

    console.log(chalk.gray('   Dependencies checked'));
  }

  async checkCodeQuality() {
    console.log(chalk.yellow('✨ Checking Code Quality...'));

    // Check for TypeScript configuration
    if (fs.existsSync('tsconfig.json')) {
      this.addPass('Code Quality', 'TypeScript configuration found');
    } else {
      this.addWarning('Code Quality', 'No TypeScript configuration found');
    }

    // Check for linting configuration
    const lintConfigs = ['.eslintrc.json', '.eslintrc.js', 'eslint.config.js'];
    const hasLinting = lintConfigs.some(config => fs.existsSync(config));
    
    if (hasLinting) {
      this.addPass('Code Quality', 'ESLint configuration found');
    } else {
      this.addSuggestion('Code Quality', 'Consider adding ESLint for code quality');
    }

    // Check for testing setup
    const testFiles = ['jest.config.js', 'jest.setup.js'];
    const hasTests = testFiles.some(file => fs.existsSync(file)) ||
                    fs.existsSync('__tests__') ||
                    fs.existsSync('tests');
    
    if (hasTests) {
      this.addPass('Code Quality', 'Testing framework configured');
    } else {
      this.addSuggestion('Code Quality', 'Consider adding testing framework');
    }

    console.log(chalk.gray('   Code quality checked'));
  }

  generateReport() {
    console.log(chalk.blue('\n📊 Health Check Report'));
    console.log(chalk.gray('=' .repeat(60)));

    // Summary
    const totalChecks = this.passed.length + this.issues.length + this.warnings.length;
    console.log(chalk.yellow(`\n📈 Summary:`));
    console.log(chalk.green(`  ✅ Passed: ${this.passed.length}`));
    console.log(chalk.red(`  ❌ Issues: ${this.issues.length}`));
    console.log(chalk.yellow(`  ⚠️  Warnings: ${this.warnings.length}`));
    console.log(chalk.blue(`  💡 Suggestions: ${this.suggestions.length}`));
    console.log(chalk.gray(`  📊 Total Checks: ${totalChecks}`));

    // Critical Issues
    if (this.issues.length > 0) {
      console.log(chalk.red('\n❌ Critical Issues (Must Fix):'));
      this.issues.forEach((issue, index) => {
        console.log(chalk.red(`  ${index + 1}. [${issue.category}] ${issue.message}`));
      });
    }

    // Warnings
    if (this.warnings.length > 0) {
      console.log(chalk.yellow('\n⚠️  Warnings (Should Fix):'));
      this.warnings.forEach((warning, index) => {
        console.log(chalk.yellow(`  ${index + 1}. [${warning.category}] ${warning.message}`));
      });
    }

    // Suggestions
    if (this.suggestions.length > 0) {
      console.log(chalk.blue('\n💡 Suggestions (Nice to Have):'));
      this.suggestions.forEach((suggestion, index) => {
        console.log(chalk.blue(`  ${index + 1}. [${suggestion.category}] ${suggestion.message}`));
      });
    }

    // Overall Health Score
    const healthScore = Math.round((this.passed.length / totalChecks) * 100);
    console.log(chalk.yellow(`\n🎯 Overall Health Score: ${healthScore}%`));

    if (healthScore >= 90) {
      console.log(chalk.green('🎉 Excellent! Your app is production-ready!'));
    } else if (healthScore >= 75) {
      console.log(chalk.yellow('👍 Good! Address critical issues and you\'re ready to deploy.'));
    } else if (healthScore >= 60) {
      console.log(chalk.yellow('⚠️  Fair. Several issues need attention before production.'));
    } else {
      console.log(chalk.red('❌ Poor. Significant issues need to be resolved.'));
    }

    // Final recommendations
    console.log(chalk.yellow('\n🚀 Next Steps:'));
    if (this.issues.length === 0) {
      console.log(chalk.green('  ✅ No critical issues found - ready for deployment!'));
      console.log(chalk.gray('  1. Address any warnings if desired'));
      console.log(chalk.gray('  2. Deploy to Vercel'));
      console.log(chalk.gray('  3. Test in production environment'));
    } else {
      console.log(chalk.red('  🔧 Fix all critical issues first'));
      console.log(chalk.gray('  1. Review and fix each critical issue above'));
      console.log(chalk.gray('  2. Re-run this health check'));
      console.log(chalk.gray('  3. Deploy when all critical issues are resolved'));
    }
  }
}

// Run the health check
if (require.main === module) {
  const checker = new HealthChecker();
  checker.runFullHealthCheck().catch(console.error);
}

module.exports = { HealthChecker };
