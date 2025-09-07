# 🤖 AI Features Setup Guide

## Overview
Your Clerva app now includes powerful AI features that can work in two modes:
1. **Full AI Mode** (with OpenAI API) - Advanced AI-powered features
2. **Fallback Mode** (without OpenAI API) - Basic AI features for testing

## 🚀 Quick Start (Fallback Mode)
The AI features will work immediately with fallback responses for testing. No setup required!

## 🔑 Full AI Setup (Recommended)

### Step 1: Get OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Go to [API Keys](https://platform.openai.com/api-keys)
4. Click "Create new secret key"
5. Copy the key (starts with `sk-`)

### Step 2: Update Environment File
Edit your `.env` file and replace the placeholder:

```bash
# Replace this line:
OPENAI_API_KEY="your-openai-api-key-here"

# With your actual key:
OPENAI_API_KEY="sk-your-actual-openai-key-here"
```

### Step 3: Restart Development Server
```bash
npm run dev
```

## 🎯 AI Features Available

### 1. **AI Study Partner Matching**
- **Endpoint**: `/api/ai/partner-matching`
- **Features**: Smart compatibility scoring, learning style matching
- **Fallback**: Basic compatibility scoring based on profile data

### 2. **AI Study Group Formation**
- **Endpoint**: `/api/ai/study-groups`
- **Features**: Optimal group composition, diversity analysis
- **Fallback**: Simple group formation based on subject matching

### 3. **AI Study Plan Generator**
- **Endpoint**: `/api/ai/study-plan`
- **Features**: Personalized study schedules, adaptive learning paths
- **Fallback**: Basic study plan with standard recommendations

### 4. **AI Session Optimizer**
- **Endpoint**: `/api/ai/session-optimizer`
- **Features**: Optimal break scheduling, learning technique recommendations
- **Fallback**: Standard Pomodoro technique with basic recommendations

### 5. **AI Study Assistant Chatbot**
- **Endpoint**: `/api/ai/chatbot`
- **Features**: Context-aware responses, intent recognition
- **Fallback**: Keyword-based responses for common study questions

### 6. **AI Progress Analysis**
- **Endpoint**: `/api/ai/progress-analysis`
- **Features**: Learning pattern analysis, personalized insights
- **Fallback**: Basic progress tracking with standard recommendations

## 💰 OpenAI Pricing
- **GPT-3.5-turbo**: ~$0.002 per 1K tokens (very affordable)
- **Typical cost**: $0.01-0.05 per user per month
- **Free tier**: $5 credit for new users

## 🧪 Testing AI Features

### Test Fallback Mode (No API Key)
1. Visit: http://localhost:3000
2. Scroll to "AI-Powered Study Features"
3. Click "Try AI Feature" buttons
4. Features will work with fallback responses

### Test Full AI Mode (With API Key)
1. Add your OpenAI API key to `.env`
2. Restart the server
3. Test the same features
4. You'll get more sophisticated AI responses

## 🔧 Troubleshooting

### AI Features Not Working?
1. Check your `.env` file has the correct API key
2. Restart the development server
3. Check browser console for errors
4. Verify OpenAI API key is valid

### Getting "Unauthorized" Errors?
- Make sure you're signed in to the app
- Check that your user profile is complete

### API Rate Limits?
- OpenAI has rate limits for free accounts
- Consider upgrading to a paid plan for production use

## 📊 Monitoring AI Usage
- Check server logs for AI service usage
- Monitor OpenAI dashboard for API usage
- Fallback mode will be used if API limits are reached

## 🚀 Production Deployment
For production deployment:
1. Set up proper environment variables
2. Use a paid OpenAI plan
3. Monitor API usage and costs
4. Consider implementing caching for common requests

## 🎉 You're All Set!
Your Clerva app now has powerful AI features that will help students:
- Find perfect study partners
- Create optimal study groups
- Generate personalized study plans
- Optimize study sessions
- Get instant study assistance
- Track learning progress

The AI features work great in both fallback and full modes, so you can start testing immediately!
