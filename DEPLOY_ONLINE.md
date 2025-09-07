# 🚀 Deploy Clerva Online - Video Calling Test

## 🎯 Quick Deploy Options

### ⚡ **FASTEST: Vercel (Recommended)**
Perfect for testing video calling - 2 minutes to deploy!

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy (from your project directory)
vercel

# 3. Follow prompts:
# - Set up and deploy? Yes
# - Which scope? [your-account]
# - Link to existing project? No
# - Project name: studybuddy-video-test
# - Directory: ./
# - Auto-detect settings? Yes
```

### 🌐 **Alternative: Netlify**
Also great for static hosting with serverless functions.

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Build the app
npm run build

# 3. Deploy
netlify deploy --prod --dir=.next
```

### 🐳 **Advanced: Railway/Render**
For full backend hosting with database.

---

## 🔧 **Environment Configuration for Production**

### **Required Environment Variables:**

Create these on your deployment platform:

```bash
# Essential for video calling
NEXTAUTH_URL=https://your-app-url.vercel.app
NEXTAUTH_SECRET=your-super-secure-32-character-secret-here
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app-url.vercel.app

# Database (use Vercel Postgres or Supabase)
DATABASE_URL=postgresql://user:pass@host:5432/db

# For real-time video calling (Optional but recommended)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Google Auth (Optional for full app, not needed for video test)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### **Minimal Setup for Video Testing:**
```bash
NEXTAUTH_URL=https://your-deployed-url.com
NEXTAUTH_SECRET=a-very-long-random-string-32-chars-minimum
DATABASE_URL=file:./dev.db
NODE_ENV=production
```

---

## 📱 **Step-by-Step Vercel Deployment**

### **Step 1: Prepare Your Code**
```bash
# Make sure everything builds locally
npm run build

# Check for any errors
npm run type-check
```

### **Step 2: Deploy to Vercel**
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

**Follow the prompts:**
- ✅ Set up and deploy? **Yes**
- ✅ Which scope? **[Select your account]**
- ✅ Link to existing project? **No**
- ✅ What's your project's name? **studybuddy-video-test**
- ✅ In which directory? **./  (just press Enter)**
- ✅ Want to modify settings? **No**

### **Step 3: Configure Environment Variables**
```bash
# Set environment variables via CLI
vercel env add NEXTAUTH_URL
# Enter: https://your-app-name.vercel.app

vercel env add NEXTAUTH_SECRET
# Enter: generate-a-32-character-random-string-here

vercel env add NODE_ENV
# Enter: production

vercel env add DATABASE_URL
# Enter: file:./dev.db

# Redeploy with new environment
vercel --prod
```

### **Step 4: Test Video Calling**
Your app will be available at: `https://your-app-name.vercel.app`

**Test URLs:**
- 🎥 **Video Test Page**: `https://your-app-name.vercel.app/test-video-calls`
- 🔧 **WebRTC Test**: `https://your-app-name.vercel.app/webrtc-test`

---

## 🌟 **Using GitHub for Auto-Deploy**

### **Step 1: Push to GitHub**
```bash
# Initialize git if not done
git init
git add .
git commit -m "Add video calling system"

# Create GitHub repo and push
git remote add origin https://github.com/yourusername/studybuddy-video-test.git
git branch -M main
git push -u origin main
```

### **Step 2: Connect Vercel to GitHub**
1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Connect your GitHub account
4. Select your repository
5. Configure environment variables
6. Deploy!

---

## 🔐 **Environment Variables Setup on Vercel Dashboard**

1. Go to your Vercel project dashboard
2. Go to Settings → Environment Variables
3. Add these variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Production |
| `NEXTAUTH_SECRET` | `your-32-char-secret` | Production |
| `NODE_ENV` | `production` | Production |
| `DATABASE_URL` | `file:./dev.db` | Production |

---

## 🧪 **Testing Checklist After Deployment**

### ✅ **Basic Deployment Test**
- [ ] App loads at your production URL
- [ ] No console errors on homepage
- [ ] Test page accessible: `/test-video-calls`
- [ ] WebRTC test page works: `/webrtc-test`

### ✅ **Video Calling Test**
- [ ] Camera/microphone permissions work
- [ ] Video call interface loads
- [ ] Local video stream appears
- [ ] Study tools sidebar opens
- [ ] Note-taking functionality works
- [ ] Mobile responsive design works

### ✅ **Cross-Device Testing**
- [ ] Test on desktop Chrome/Firefox
- [ ] Test on mobile iOS Safari
- [ ] Test on mobile Android Chrome
- [ ] Test screen sharing on desktop
- [ ] Test with denied permissions

---

## 🚨 **Common Issues & Solutions**

### **Issue: "HTTPS Required for WebRTC"**
**Solution:** WebRTC requires HTTPS. Vercel automatically provides HTTPS.

### **Issue: "Database Connection Error"**
**Solution:** For quick testing, use `DATABASE_URL=file:./dev.db`
For production, set up Vercel Postgres or Supabase.

### **Issue: "Camera/Microphone Not Working"**
**Solution:** Ensure your deployment URL uses HTTPS and has proper permissions headers (already configured).

### **Issue: "Build Failing"**
**Solution:** 
```bash
# Test build locally first
npm run build

# Check TypeScript errors
npm run type-check

# Fix any errors, then redeploy
```

---

## 🎉 **Quick Commands Summary**

```bash
# Deploy to Vercel (fastest)
npm install -g vercel
vercel

# Deploy to Netlify
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=.next

# Test locally before deploy
npm run build
npm run start
```

---

## 📞 **Testing Your Deployed Video Calling**

Once deployed, test at:
- **Main Test**: `https://your-app.vercel.app/test-video-calls`
- **WebRTC Check**: `https://your-app.vercel.app/webrtc-test`

**Mobile Testing:**
- Share the URL with your phone
- Test camera/microphone permissions
- Test study tools on mobile interface

---

**🚀 Ready to deploy! Start with Vercel for the fastest deployment and testing experience.**