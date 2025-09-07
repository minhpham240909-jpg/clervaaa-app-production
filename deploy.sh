#!/bin/bash

# StudyBuddy App - Production Deployment Script
# This script helps automate the deployment process

set -e

echo "🚀 StudyBuddy App - Production Deployment"
echo "========================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if required tools are installed
command -v git >/dev/null 2>&1 || { echo "❌ Git is required but not installed. Aborting." >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required but not installed. Aborting." >&2; exit 1; }

echo "✅ Prerequisites check passed"

# Pre-deployment checks
echo ""
echo "🔍 Running pre-deployment checks..."

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local not found"
    echo "📝 Please create .env.local with your production environment variables"
    echo "   You can copy from .env.example and fill in your values"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Run tests
echo "🧪 Running tests..."
npm test -- --passWithNoTests --watchAll=false || {
    echo "❌ Tests failed. Please fix them before deploying."
    exit 1
}

# Type check
echo "🔍 Running type check..."
npm run type-check || {
    echo "❌ Type check failed. Please fix TypeScript errors before deploying."
    exit 1
}

# Build check
echo "🏗️  Testing production build..."
npm run build || {
    echo "❌ Build failed. Please fix build errors before deploying."
    exit 1
}

echo "✅ All pre-deployment checks passed!"

# Git checks
echo ""
echo "📝 Checking Git status..."

if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  You have uncommitted changes:"
    git status --short
    read -p "Commit and push changes? (Y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        echo "📝 Committing changes..."
        git add .
        read -p "Enter commit message (default: 'Deploy to production'): " commit_msg
        commit_msg=${commit_msg:-"Deploy to production"}
        git commit -m "$commit_msg"
        
        echo "📤 Pushing to GitHub..."
        git push
    fi
fi

# Deployment options
echo ""
echo "🚀 Choose deployment method:"
echo "1) Deploy with Vercel CLI (recommended)"
echo "2) Manual GitHub integration setup"
echo "3) Show environment variables checklist"

read -p "Enter choice (1-3): " choice

case $choice in
    1)
        # Check if Vercel CLI is installed
        if ! command -v vercel &> /dev/null; then
            echo "📦 Installing Vercel CLI..."
            npm install -g vercel
        fi
        
        echo "🚀 Deploying to Vercel..."
        vercel --prod
        
        echo ""
        echo "✅ Deployment complete!"
        echo "🌐 Your app should be live shortly"
        echo "⚙️  Don't forget to set up environment variables in Vercel dashboard"
        ;;
    2)
        echo ""
        echo "📋 Manual GitHub Integration Steps:"
        echo "1. Go to https://vercel.com"
        echo "2. Sign in with GitHub"
        echo "3. Click 'Import Project'"
        echo "4. Select this repository"
        echo "5. Vercel will auto-detect Next.js settings"
        echo "6. Set environment variables in project settings"
        echo ""
        echo "📖 See deployment-guide.md for detailed instructions"
        ;;
    3)
        echo ""
        echo "🔑 Environment Variables Checklist:"
        echo "=================================="
        echo "Required variables:"
        echo "- DATABASE_URL (PostgreSQL connection string)"
        echo "- NEXTAUTH_URL (https://your-app.vercel.app)"
        echo "- NEXTAUTH_SECRET (32+ character secret)"
        echo "- GOOGLE_CLIENT_ID"
        echo "- GOOGLE_CLIENT_SECRET"
        echo "- OPENAI_API_KEY"
        echo "- FOUNDER_EMAILS (your admin email)"
        echo "- NODE_ENV=production"
        echo ""
        echo "📖 See deployment-guide.md for setup instructions"
        ;;
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment process completed!"
echo "📖 Check deployment-guide.md for post-deployment steps"
echo "🔧 Remember to set up your database schema with 'npx prisma db push'"
