# 🔒 GitHub Secrets Setup Guide

## Why This Matters
Following the security best practices you mentioned, this guide will help you set up GitHub repository secrets properly for secure deployment.

## Step 1: Access GitHub Repository Secrets

1. **Go to your GitHub repository**: https://github.com/minhpham240909-jpg/clervaaa-app-production
2. **Click on "Settings"** tab (at the top of the repository)
3. **In the left sidebar**, click **"Secrets and variables"** → **"Actions"**
4. **Click "New repository secret"** button

## Step 2: Add Required Secrets

Add these secrets one by one by clicking "New repository secret":

### 🔑 **Essential Secrets**

| Secret Name | Description | Where to Get It |
|-------------|-------------|-----------------|
| `NEXTAUTH_SECRET` | Authentication secret | Generate: `openssl rand -base64 32` |
| `DATABASE_URL` | PostgreSQL connection string | Your database provider (Supabase/Railway/PlanetScale) |
| `OPENAI_API_KEY` | OpenAI API key | https://platform.openai.com/api-keys |

### 🌐 **OAuth Secrets (Optional)**

| Secret Name | Description | Where to Get It |
|-------------|-------------|-----------------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | Google Cloud Console |
| `GITHUB_ID` | GitHub OAuth client ID | GitHub Developer Settings |
| `GITHUB_SECRET` | GitHub OAuth secret | GitHub Developer Settings |

### 📧 **Additional Secrets (Optional)**

| Secret Name | Description | Where to Get It |
|-------------|-------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Dashboard |
| `EMAIL_SERVER_PASSWORD` | Email service password | Your email provider |

## Step 3: Verify Secrets Are Added

After adding secrets, you should see them listed in the "Repository secrets" section. They will show as:
- ✅ `NEXTAUTH_SECRET` (Updated X minutes ago)
- ✅ `DATABASE_URL` (Updated X minutes ago)
- ✅ `OPENAI_API_KEY` (Updated X minutes ago)

## Step 4: GitHub Actions Integration

If you set up GitHub Actions for deployment, access secrets like this:

\`\`\`yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy
        env:
          NEXTAUTH_SECRET: \${{ secrets.NEXTAUTH_SECRET }}
          DATABASE_URL: \${{ secrets.DATABASE_URL }}
          OPENAI_API_KEY: \${{ secrets.OPENAI_API_KEY }}
          GOOGLE_CLIENT_ID: \${{ secrets.GOOGLE_CLIENT_ID }}
          GOOGLE_CLIENT_SECRET: \${{ secrets.GOOGLE_CLIENT_SECRET }}
        run: |
          # Your deployment commands here
\`\`\`

## Step 5: Vercel Integration

For Vercel deployment, you can either:

### Option A: Manual Vercel Environment Variables
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add the same secrets there

### Option B: Vercel CLI (What we used)
\`\`\`bash
vercel env add NEXTAUTH_SECRET
vercel env add DATABASE_URL
vercel env add OPENAI_API_KEY
# etc...
\`\`\`

## 🛡️ Security Best Practices

✅ **DO:**
- Use GitHub repository secrets for sensitive data
- Rotate API keys regularly
- Use different keys for development and production
- Keep secrets in environment variables, never in code

❌ **DON'T:**
- Commit `.env.local` or `.env.production` files
- Hardcode API keys in your source code
- Share secrets in chat, email, or documentation
- Use the same secrets across multiple projects

## 🔄 Key Rotation

If you suspect a key is compromised:
1. **Generate a new key** from the provider
2. **Update the GitHub secret** with the new value
3. **Update Vercel environment variables**
4. **Redeploy your application**
5. **Revoke the old key** from the provider

## ✅ Verification

Your setup is secure when:
- No secrets appear in your GitHub repository code
- All secrets are stored in GitHub repository secrets
- Your app deploys successfully using environment variables
- You can rotate keys without touching your codebase
