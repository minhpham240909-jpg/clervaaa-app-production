# 🗄️ Supabase Production Setup Guide

Complete step-by-step guide to set up Supabase for your Clerva production deployment.

## 📋 Prerequisites

- Supabase account created
- Your Clerva project code ready
- Hosting platform chosen (Vercel recommended)

## 🔑 Step 1: Create Supabase Project

1. **Go to [supabase.com](https://supabase.com)**
2. **Sign in** or create account
3. **Click "New Project"**
4. **Fill in details:**
   - **Organization**: Choose or create one
   - **Project Name**: `studybuddy-production`
   - **Database Password**: Generate strong password (SAVE THIS!)
   - **Region**: Choose closest to your users
   - **Plan**: Free (upgrade to Pro later)

## 🔧 Step 2: Get Supabase Credentials

### **2.1 API Keys & Project URL**

1. **In Supabase Dashboard → Settings → API**
2. **Copy these values:**

```bash
# Project URL
NEXT_PUBLIC_SUPABASE_URL=https://study-buddy-app.supabase.co

# Project API keys
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **2.2 Database Connection String**

1. **In Supabase Dashboard → Settings → Database**
2. **Find "Connection parameters" section**
3. **Set options:**
   - **Mode**: Session
   - **Database**: postgres
4. **Copy connection string:**

```bash
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project-id.supabase.co:5432/postgres
```

> ⚠️ **Replace `[YOUR-PASSWORD]` with your actual database password!**

## ⚙️ Step 3: Configure Environment Variables

### **Option A: Vercel (Recommended)**

1. **Vercel Dashboard → Your Project → Settings → Environment Variables**
2. **Add these variables:**

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `DATABASE_URL` | `postgresql://postgres:YOUR_PASSWORD@db.your-project-id.supabase.co:5432/postgres` | Production |
| `DIRECT_URL` | Same as DATABASE_URL | Production |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project-id.supabase.co` | Production |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key | Production |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key | Production |
| `NEXTAUTH_URL` | `https://yourdomain.vercel.app` | Production |
| `NEXTAUTH_SECRET` | Generate: `openssl rand -base64 32` | Production |
| `GOOGLE_CLIENT_ID` | Your Google OAuth ID | Production |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth secret | Production |
| `FOUNDER_EMAILS` | `minhpham240909@gmail.com` | Production |
| `OPENAI_API_KEY` | Your OpenAI API key | Production |
| `NODE_ENV` | `production` | Production |

### **Option B: Railway**

1. **Railway Dashboard → Your Project → Variables**
2. **Add the same variables as above**

### **Option C: Other Platforms**

Use the same variable names and values in your platform's environment variable settings.

## 🚀 Step 4: Deploy & Initialize Database

### **4.1 Deploy Your App**

1. **Push your code** to GitHub/GitLab
2. **Deploy** through your hosting platform
3. **Wait for deployment** to complete

### **4.2 Initialize Database**

**Option A: Using the setup script**
```bash
# SSH into your deployment or run locally with production env
node scripts/setup-supabase-production.js
```

**Option B: Manual setup**
```bash
# Push database schema
npx prisma db push

# Generate Prisma client
npx prisma generate

# Seed initial data (optional)
npx prisma db seed
```

## ✅ Step 5: Verify Setup

### **5.1 Test Database Connection**

Visit your deployed app and check:
- [ ] App loads without errors
- [ ] Can sign in with Google
- [ ] Dashboard displays correctly
- [ ] No database connection errors

### **5.2 Check Supabase Dashboard**

In Supabase Dashboard:
- [ ] **Database → Tables**: Verify all tables created
- [ ] **Database → Logs**: Check for connection activity
- [ ] **API → Logs**: Verify API calls working

## 🔒 Security Checklist

- [ ] `SUPABASE_SERVICE_ROLE_KEY` is marked as secret/hidden
- [ ] Database password is strong and secure
- [ ] All environment variables are set to "Production" environment
- [ ] No credentials committed to git
- [ ] SSL/HTTPS enabled for your domain

## 🛠️ Troubleshooting

### **Database Connection Issues**

```bash
# Test connection locally
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$connect().then(() => {
  console.log('✅ Connected!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Connection failed:', err);
  process.exit(1);
});
"
```

### **Common Issues**

| Issue | Solution |
|-------|----------|
| "Database does not exist" | Check DATABASE_URL spelling and password |
| "Connection refused" | Verify Supabase project is running |
| "Invalid API key" | Double-check API keys from dashboard |
| "CORS errors" | Verify NEXT_PUBLIC_SUPABASE_URL is correct |

### **Environment Variable Validation**

Use our validation script:
```bash
node -e "
const env = require('./lib/env.ts');
console.log('✅ Environment validation passed!');
"
```

## 📊 Production Optimization

### **Database Performance**

```sql
-- Run these in Supabase SQL Editor for better performance
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);
CREATE INDEX IF NOT EXISTS idx_session_token ON "Session"("sessionToken");
CREATE INDEX IF NOT EXISTS idx_study_session_user ON "StudySession"("userId");
```

### **Connection Pooling**

- **Supabase Free**: 60 connections
- **Supabase Pro**: 200+ connections
- **Use `DIRECT_URL`** for better connection management

## 🎯 Next Steps

1. **Monitor your app** in production
2. **Set up alerts** in Supabase dashboard
3. **Upgrade to Pro** when you need more resources
4. **Configure backups** (Pro plan includes automatic backups)
5. **Set up monitoring** with Sentry/LogRocket

## 🆘 Getting Help

If you encounter issues:

1. **Check Supabase logs** in dashboard
2. **Review deployment logs** in hosting platform
3. **Test environment variables** are correctly set
4. **Verify network connectivity** to Supabase

---

🎉 **Congratulations!** Your Clerva app is now running on Supabase in production!
