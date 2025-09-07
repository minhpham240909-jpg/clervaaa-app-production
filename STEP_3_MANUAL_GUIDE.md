# 🚀 Step 3: Post-Deployment Setup - Manual Guide

**After you've deployed to Vercel, follow these steps to complete your setup:**

## 📋 **Step 3.1: Update NEXTAUTH_URL in Vercel**

1. **Get your Vercel URL**:
   - After deployment, copy your app's URL (e.g., `https://studybuddy-abc123.vercel.app`)

2. **Update Environment Variable**:
   - Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
   - Find `NEXTAUTH_URL` and edit it
   - Replace with your actual Vercel URL: `https://your-app-name.vercel.app`
   - **Redeploy** your app (go to Deployments tab → click "Redeploy")

## 🔧 **Step 3.2: Configure Google OAuth**

1. **Go to Google Cloud Console**:
   - Visit: [console.cloud.google.com](https://console.cloud.google.com)

2. **Navigate to OAuth Settings**:
   - Go to: **APIs & Services** → **Credentials**
   - Find your OAuth 2.0 Client ID and click **Edit**

3. **Add Redirect URI**:
   - In "Authorized redirect URIs", add:
   ```
   https://your-vercel-url.vercel.app/api/auth/callback/google
   ```
   - Replace `your-vercel-url` with your actual Vercel URL
   - **Save** the changes

## 🗄️ **Step 3.3: Initialize Production Database**

**Option A: Automatic (Recommended)**
1. **Visit your deployed app**: `https://your-app.vercel.app`
2. **Try to sign in** - this will automatically create database tables
3. **If you see errors**, continue to Option B

**Option B: Manual Database Setup**
After deployment, your Supabase database should be automatically initialized. If you encounter issues:

1. **Check Supabase Dashboard**:
   - Go to [supabase.com](https://supabase.com)
   - Open your project
   - Check if tables exist in the **Table Editor**

2. **If tables are missing**:
   - You can use Vercel's terminal or run locally:
   ```bash
   # Make sure you're using production DATABASE_URL
   npx prisma db push --accept-data-loss
   npx prisma generate
   ```

## 🧪 **Step 3.4: Test Your Deployed App**

### **✅ Testing Checklist**

Visit your Vercel URL and test:

1. **Homepage** ✓
   - [ ] Homepage loads without errors
   - [ ] Design looks correct on desktop and mobile

2. **Authentication** 🔐
   - [ ] "Sign In" button works
   - [ ] Google OAuth login completes successfully
   - [ ] Redirects to dashboard after login

3. **Dashboard** 📊
   - [ ] Dashboard loads after login
   - [ ] User profile information displays
   - [ ] Navigation menu works

4. **AI Features** 🤖
   - [ ] **Study Summaries**: Generate a summary from text
   - [ ] **Flashcards**: Create flashcards
   - [ ] **Quiz Generator**: Generate quiz questions
   - [ ] **Partner Matching**: Find study partners
   - [ ] **Progress Analysis**: View insights

5. **Database Operations** 🗄️
   - [ ] Create a study goal
   - [ ] Save user preferences
   - [ ] Data persists after refresh

6. **Mobile Responsiveness** 📱
   - [ ] App works on mobile devices
   - [ ] All features accessible on small screens

## 🔍 **Troubleshooting Common Issues**

### **🚨 "Authentication Error" or "Callback URL Mismatch"**
- ✅ **Solution**: Update Google OAuth redirect URLs (Step 3.2)
- ✅ **Check**: NEXTAUTH_URL matches your Vercel URL exactly

### **🚨 "Database Connection Error"**
- ✅ **Solution**: Verify DATABASE_URL in Vercel environment variables
- ✅ **Check**: Supabase project is active and accessible

### **🚨 "AI Features Not Working"**
- ✅ **Solution**: Check OPENAI_API_KEY in Vercel environment
- ✅ **Check**: OpenAI account has sufficient credits

### **🚨 "Internal Server Error"**
- ✅ **Solution**: Check Vercel function logs
- ✅ **Go to**: Vercel Dashboard → Functions tab → View logs

### **🚨 "Environment Variable Missing"**
- ✅ **Solution**: Add missing variables in Vercel
- ✅ **Required variables**:
  ```
  DATABASE_URL
  NEXT_PUBLIC_SUPABASE_URL  
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  NEXTAUTH_URL
  NEXTAUTH_SECRET
  GOOGLE_CLIENT_ID
  GOOGLE_CLIENT_SECRET
  OPENAI_API_KEY
  ```

## 🎉 **Success! What You've Accomplished**

Once everything is working:

### **🌟 Your Live Features:**
- ✅ **AI-Powered Study Platform** - Complete with OpenAI integration
- ✅ **Secure Authentication** - Google OAuth login
- ✅ **Real-time Database** - Supabase PostgreSQL
- ✅ **Responsive Design** - Works on all devices
- ✅ **Production-Ready** - Deployed on Vercel

### **🎯 Next Steps:**
1. **Share your app** with friends and get feedback
2. **Monitor usage** in Vercel, Supabase, and OpenAI dashboards
3. **Set up billing alerts** to track costs
4. **Consider upgrading** plans as you grow

### **💰 Cost Monitoring:**
- **Vercel**: Free → $20/month Pro
- **Supabase**: Free → $25/month Pro  
- **OpenAI**: ~$15-40/month based on usage

## 📞 **Support**

If you encounter any issues:

1. **Check Vercel logs**: Dashboard → Functions → Logs
2. **Check browser console**: F12 → Console tab
3. **Verify environment variables**: Make sure all are set correctly
4. **Test locally first**: If it works locally, it's likely an environment variable issue

---

## 🎊 **Congratulations!** 

Your StudyBuddy app is now **LIVE** and ready for users! 🚀📚

**Your app URL**: `https://your-vercel-url.vercel.app`

Share it with the world! 🌍
