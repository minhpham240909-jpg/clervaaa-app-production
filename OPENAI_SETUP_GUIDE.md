# 🤖 OpenAI Platform Setup Guide

Complete step-by-step guide to get your OpenAI API key for Clerva AI features.

## 🚀 **Step 1: Create OpenAI Account**

### **Go to OpenAI Platform**
1. **Open your browser** and go to: [https://platform.openai.com](https://platform.openai.com)
2. **Click "Sign up"** (or "Log in" if you already have an account)

### **Account Creation Options**
Choose one of these methods:

**Option A: Email Signup**
1. Enter your email address
2. Create a strong password
3. Verify your email (check your inbox)
4. Complete the verification process

**Option B: Google/Microsoft Account**
1. Click "Continue with Google" or "Continue with Microsoft"
2. Sign in with your existing account
3. Grant necessary permissions

### **Phone Verification**
1. **Enter your phone number** (required for security)
2. **Receive SMS code** and enter it
3. **Complete verification**

---

## 💳 **Step 2: Set Up Billing (Required for API Access)**

### **Add Payment Method**
1. **Go to [Billing](https://platform.openai.com/account/billing)**
2. **Click "Add payment method"**
3. **Enter your credit/debit card details**:
   - Card number
   - Expiration date
   - CVV code
   - Billing address

### **Add Initial Credit**
1. **Choose your starting amount**:
   - **$5** (good for testing and small apps)
   - **$10** (recommended for development)
   - **$20** (good for production start)
2. **Click "Add to balance"**
3. **Confirm the transaction**

### **Set Usage Limits (Recommended)**
1. **Go to [Usage limits](https://platform.openai.com/account/billing/limits)**
2. **Set monthly spending limit**:
   - **Soft limit**: $10-20 (gets warning)
   - **Hard limit**: $25-50 (stops usage)
3. **Enable email notifications**

---

## 🔑 **Step 3: Generate API Key**

### **Create Your API Key**
1. **Go to [API Keys](https://platform.openai.com/api-keys)**
2. **Click "Create new secret key"**
3. **Name your key**: `Clerva-Production`
4. **Set permissions** (if asked):
   - Choose "All" or "Write" permissions
5. **Click "Create secret key"**

### **⚠️ CRITICAL: Save Your API Key**
1. **Copy the key immediately** - it starts with `sk-` prefix
2. **Save it securely** - you can't see it again!
3. **Example format**: `sk-[your-actual-key-here]`

---

## 🛡️ **Step 4: Security Best Practices**

### **API Key Security**
- ✅ **Never commit to GitHub** or public repositories
- ✅ **Store in environment variables only**
- ✅ **Use different keys for development/production**
- ✅ **Regenerate if compromised**

### **Usage Monitoring**
1. **Check usage regularly**: [Usage Dashboard](https://platform.openai.com/usage)
2. **Set up alerts** for spending thresholds
3. **Monitor for unusual activity**

---

## 💰 **Step 5: Understanding Costs**

### **Pricing for Your Clerva Features**

**GPT-3.5-turbo** (recommended for start):
- **Input**: $0.50 per 1M tokens (~750,000 words)
- **Output**: $1.50 per 1M tokens (~750,000 words)

**GPT-4-turbo** (premium features):
- **Input**: $10.00 per 1M tokens
- **Output**: $30.00 per 1M tokens

### **Expected Monthly Costs for Clerva**
- **Light usage** (50 AI requests/day): $5-15
- **Medium usage** (200 AI requests/day): $15-50
- **Heavy usage** (500+ AI requests/day): $50-150

### **Cost Optimization Tips**
1. **Start with GPT-3.5-turbo** for all features
2. **Set reasonable token limits** (1500-2000 tokens)
3. **Monitor usage patterns** in first month
4. **Upgrade to GPT-4** only for complex features

---

## 📊 **Step 6: Test Your API Access**

### **Quick API Test**
Once you have your API key, you can test it:

```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello, this is a test!"}],
    "max_tokens": 10
  }'
```

### **Expected Response**
You should get a JSON response with AI-generated text.

---

## 🚨 **Common Issues & Solutions**

### **"Insufficient Quota" Error**
- **Problem**: No credit in account
- **Solution**: Add billing information and credit

### **"Invalid API Key" Error**
- **Problem**: Wrong key format or expired
- **Solution**: Generate new API key

### **"Rate Limit Exceeded" Error**
- **Problem**: Too many requests too quickly
- **Solution**: Add delays between requests or upgrade plan

### **"Model Not Available" Error**
- **Problem**: GPT-4 not accessible on free tier
- **Solution**: Start with GPT-3.5-turbo or upgrade account

---

## ✅ **Checklist: Ready for Clerva**

Before proceeding with Clerva setup:

- [ ] OpenAI account created and verified
- [ ] Phone number verified
- [ ] Payment method added
- [ ] Initial credit added ($5-20)
- [ ] Usage limits set
- [ ] API key generated and saved securely
- [ ] API key tested successfully

---

## 🔄 **Next Steps**

Once you have your OpenAI API key:

1. **Copy your API key** (starts with `sk-` prefix)
2. **Return to Clerva setup**
3. **I'll help you configure** the balanced AI setup
4. **Test all AI features** before deployment
5. **Deploy to production** with full AI capabilities

---

## 🆘 **Need Help?**

If you encounter any issues:

1. **Check OpenAI Status**: [status.openai.com](https://status.openai.com)
2. **Review OpenAI Documentation**: [platform.openai.com/docs](https://platform.openai.com/docs)
3. **Contact OpenAI Support**: Through platform dashboard
4. **Let me know** and I'll help troubleshoot!

---

**🎉 Ready to get your OpenAI access? Let's start with Step 1!**
