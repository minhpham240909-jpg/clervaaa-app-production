#!/bin/bash

echo "🚀 Starting StudyBuddy App Setup..."

# Navigate to the correct directory
cd /Users/minhpham/Documents/minh.py/studybuddy-app

# Kill any existing processes
echo "🔄 Stopping existing processes..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true

# Wait a moment
sleep 2

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Generate Prisma client
echo "🗄️ Setting up database..."
npx prisma generate
npx prisma db push

# Update environment with correct configuration
echo "⚙️ Configuring environment..."
sed -i '' 's/NEXTAUTH_URL=".*"/NEXTAUTH_URL="http:\/\/localhost:3000"/' .env.local
sed -i '' 's/FOUNDER_EMAILS=".*"/FOUNDER_EMAILS="clervaclever@gmail.com"/' .env.local
sed -i '' 's/ADMIN_EMAILS=".*"/ADMIN_EMAILS="clervaclever@gmail.com"/' .env.local

echo "✅ Configuration complete!"
echo ""
echo "📋 Your app is configured with:"
echo "   👤 Founder Email: clervaclever@gmail.com"
echo "   🌐 Server URL: http://localhost:3000"
echo "   🔐 Admin Dashboard: http://localhost:3000/admin"
echo ""
echo "🚀 Starting development server..."

# Start the development server
npm run dev
