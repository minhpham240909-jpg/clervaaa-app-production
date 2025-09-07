# 🤖 AI API Integration Guide for StudyMatch

## 🎯 Overview

Your StudyMatch app now supports **3 AI providers** with automatic fallback to offline intelligence:

1. **OpenAI GPT** - Most popular, high quality
2. **Google Gemini** - Cost-effective, fast (RECOMMENDED)
3. **Anthropic Claude** - High quality, good reasoning

## 🚀 Quick Setup (Choose One or More)

### Option 1: Google Gemini (RECOMMENDED - Free tier available)

1. **Get API Key:**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with Google account
   - Click "Create API Key"
   - Copy the key

2. **Add to Environment:**
   ```bash
   # Add to your .env.local file
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Cost:** FREE up to 60 requests/minute, then $0.50/1M tokens

### Option 2: OpenAI GPT

1. **Get API Key:**
   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Sign up/Sign in
   - Create new API key
   - Copy the key

2. **Add to Environment:**
   ```bash
   # Add to your .env.local file
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Cost:** GPT-3.5-turbo: $0.50/1M input tokens, $1.50/1M output tokens

### Option 3: Anthropic Claude

1. **Get API Key:**
   - Go to [Anthropic Console](https://console.anthropic.com/)
   - Sign up/Sign in
   - Create API key
   - Copy the key

2. **Add to Environment:**
   ```bash
   # Add to your .env.local file
   ANTHROPIC_API_KEY=your_claude_api_key_here
   ```

3. **Cost:** Claude Haiku: $0.25/1M input tokens, $1.25/1M output tokens

## 📝 Environment Configuration

Create or update your `.env.local` file:

```bash
# Existing variables
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL="file:./dev.db"

# AI API Keys (add one or more)
GEMINI_API_KEY=your_gemini_key_here
OPENAI_API_KEY=your_openai_key_here  
ANTHROPIC_API_KEY=your_claude_key_here

# Optional: Set preferred provider (default: gemini)
PREFERRED_AI_PROVIDER=gemini
```

## 🎛️ Configuration Options

You can configure which AI provider to use by default in `lib/ai-providers.ts`:

```typescript
// Change the preferred provider
export const aiManager = new AIManager({
  openaiKey: process.env.OPENAI_API_KEY,
  geminiKey: process.env.GEMINI_API_KEY,
  claudeKey: process.env.ANTHROPIC_API_KEY,
  preferredProvider: 'gemini' // Change this to 'openai' or 'claude'
});
```

## 🧪 Testing Your AI Integration

### Test URLs:
1. **With AI APIs**: http://localhost:3000/test-ai-chat
2. **Offline Only**: http://localhost:3000/test-offline-ai
3. **Main App**: http://localhost:3000/messages

### Testing Steps:
1. Add at least one API key to `.env.local`
2. Restart your development server: `npm run dev`
3. Go to the test URL
4. Send study-related messages
5. Click the 🧠 brain icon
6. Click "Generate AI Suggestions"
7. Check browser console for logs

## 📊 AI vs Offline Comparison

| Feature | AI APIs | Offline Intelligence |
|---------|---------|---------------------|
| **Quality** | 🌟🌟🌟🌟🌟 | 🌟🌟🌟 |
| **Context Understanding** | Advanced | Good |
| **Personalization** | High | Moderate |
| **Response Speed** | 1-3 seconds | Instant |
| **Cost** | $0.25-1.50/1M tokens | Free |
| **Reliability** | 99.9% uptime | 100% |
| **Privacy** | Sent to API | Local only |

## 🔄 How the Fallback System Works

```typescript
1. Try AI Provider (OpenAI/Gemini/Claude)
   ↓ (if fails)
2. Try Alternative AI Providers  
   ↓ (if all fail)
3. Use Offline Intelligence
   ↓ 
4. Always return suggestions to user
```

## 💰 Cost Estimation

For a typical study chat with 10 messages:
- **Gemini**: ~$0.0001 (practically free)
- **OpenAI GPT-3.5**: ~$0.0005 
- **Claude Haiku**: ~$0.0003

**Monthly cost for 1000 active users**: $5-15

## 🔧 Advanced Configuration

### Custom AI Prompts

You can customize the AI prompts in `lib/ai-providers.ts` to better match your app's needs:

```typescript
private createStudyAnalysisPrompt(conversationText: string): string {
  return `
You are a specialized study assistant for StudyMatch app.
Analyze this conversation and provide study suggestions that:
1. Match the user's academic level
2. Consider their learning style  
3. Suggest appropriate break times
4. Recommend collaborative activities

Conversation: ${conversationText}
// ... rest of prompt
`;
}
```

### Provider Selection Strategy

```typescript
// In lib/ai-providers.ts, you can change the fallback order:
const providerOrder = ['gemini', 'openai', 'claude'];
```

## 🚨 Troubleshooting

### Common Issues:

1. **"No AI providers configured"**
   - Add at least one API key to `.env.local`
   - Restart development server

2. **"API key invalid"**
   - Check API key is correct
   - Verify account has credits/quota

3. **"Rate limit exceeded"**
   - API quota exceeded
   - Wait or upgrade plan
   - System will fallback to offline mode

4. **AI responses seem generic**
   - Customize prompts in `ai-providers.ts`
   - Add more context about your app

### Debug Logs:

Check browser console and server logs for:
```
Using AI provider for chat analysis
AI analysis completed successfully  
AI provider failed, falling back to offline analysis
```

## 🎯 Recommendations

### For Development:
- Start with **Gemini** (free tier)
- Test with sample conversations
- Monitor usage in API dashboards

### For Production:
- Use **Gemini** for cost-effectiveness
- Set up monitoring and alerting
- Configure rate limiting
- Consider caching responses

### For Enterprise:
- **OpenAI GPT-4** for highest quality
- **Claude** for complex reasoning
- Multiple providers for redundancy

## 🔐 Security Best Practices

1. **Never expose API keys in client-side code**
2. **Use environment variables only**
3. **Rotate API keys regularly**
4. **Monitor API usage for anomalies**
5. **Set up billing alerts**

## 📈 Monitoring & Analytics

Track these metrics:
- AI vs offline usage ratio
- Response quality ratings
- API costs per user
- Fallback frequency
- User engagement with suggestions

---

## 🎉 You're Ready!

Your StudyMatch app now has **enterprise-grade AI capabilities** with intelligent fallbacks. Users get the best of both worlds:

- **🤖 AI-powered suggestions** when available
- **🧠 Smart offline analysis** as backup
- **⚡ Always-working system** regardless of API status

Start with Gemini's free tier and scale up as needed! 🚀