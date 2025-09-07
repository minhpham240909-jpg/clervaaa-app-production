# 🚀 Clerva Deployment Guide

Complete guide to deploy your Clerva app to production.

## 📋 Pre-Deployment Checklist

### ✅ **Required Services Setup**
1. **Database**: Set up PostgreSQL (recommended: Supabase or Railway)
2. **Google OAuth**: Configure production OAuth credentials
3. **OpenAI API**: Get production API key for AI features
4. **Domain**: Purchase and configure your domain
5. **Email Service**: Set up Resend or SendGrid for notifications

### ✅ **Environment Variables**
Copy `.env.production.example` to your hosting platform and fill in all required values.

## 🌟 **Recommended Hosting Platforms**

### **1. Vercel (Recommended - Easiest)**
**Best for**: Quick deployment, automatic scaling, built for Next.js

**Deployment Steps:**
1. Push your code to GitHub
2. Connect GitHub repo to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

**Database Options:**
- Supabase (PostgreSQL + real-time features)
- Railway PostgreSQL
- Neon PostgreSQL

**Monthly Cost**: ~$20-50/month
- Vercel Pro: $20/month
- Supabase Pro: $25/month

### **2. Railway (Great Alternative)**
**Best for**: Full-stack apps, database included

**Deployment Steps:**
1. Connect GitHub repo to Railway
2. Add PostgreSQL database service
3. Set environment variables
4. Deploy

**Monthly Cost**: ~$15-30/month

### **3. DigitalOcean App Platform**
**Best for**: Managed hosting with more control

**Monthly Cost**: ~$25-50/month

### **4. Self-Hosted (Advanced Users)**
**Best for**: Full control, cost optimization

**Requirements:**
- VPS (DigitalOcean, Linode, AWS EC2)
- Docker & Docker Compose
- Reverse proxy (Nginx)
- SSL certificate (Let's Encrypt)

## 🚀 **Quick Deploy with Vercel + Supabase**

### **Step 1: Set up Supabase Database**
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note down your Database URL and API keys

### **Step 2: Configure Google OAuth**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new OAuth 2.0 credentials
3. Add your production domain to authorized origins

### **Step 3: Deploy to Vercel**
1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables:

```bash
# Required Variables
DATABASE_URL=your-supabase-database-url
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-production-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FOUNDER_EMAILS=minhpham240909@gmail.com
OPENAI_API_KEY=your-openai-api-key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### **Step 4: Set up Database**
```bash
# Run database migrations
npx prisma db push
npx prisma generate

# Seed initial data (optional)
npx prisma db seed
```

### **Step 5: Test Your Deployment**
1. Visit your production URL
2. Test Google sign-in
3. Verify founder dashboard access
4. Check all major features

## 🔧 **Production Optimizations**

### **Database Performance**
```sql
-- Add indexes for better performance
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_session_token ON "Session"("sessionToken");
CREATE INDEX idx_study_session_user ON "StudySession"("userId");
```

### **Monitoring Setup**
1. **Error Tracking**: Set up Sentry
2. **Analytics**: Configure Google Analytics
3. **Uptime Monitoring**: Use Uptime Robot or similar

### **CDN & Performance**
- Images automatically optimized by Next.js
- Enable gzip compression (already configured)
- Use Vercel Edge Network for global CDN

## 🐛 **Common Deployment Issues**

### **Build Failures**
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### **Database Connection Issues**
- Verify DATABASE_URL format
- Check database server accessibility
- Ensure SSL is properly configured

### **OAuth Not Working**
- Update OAuth redirect URLs in Google Console
- Verify NEXTAUTH_URL matches exactly
- Check domain configuration

### **Environment Variables Not Loading**
- Ensure variables are set in hosting platform dashboard
- Verify variable names match exactly
- Check for trailing spaces or special characters

## 📊 **Scaling Considerations**

### **Traffic Growth (1K+ users)**
- Enable database connection pooling
- Add Redis caching layer
- Consider upgrading hosting plan

### **Global Users**
- Set up CDN for assets
- Consider multi-region database
- Implement proper internationalization

## 🔒 **Security Best Practices**

### **Environment Security**
```bash
# Generate strong secrets
openssl rand -base64 32  # For NEXTAUTH_SECRET
```

### **Database Security**
- Use connection pooling
- Enable SSL connections
- Regular backup schedule

### **Application Security**
- Regular dependency updates
- Security headers (already configured)
- Rate limiting (implemented)

## 💰 **Cost Estimates**

### **Starter Setup (< 1K users)**
- **Vercel Pro**: $20/month
- **Supabase Pro**: $25/month  
- **Domain**: $12/year
- **Total**: ~$45-50/month

### **Growth Setup (1K-10K users)**
- **Vercel Pro**: $20/month
- **Supabase Pro**: $25/month
- **Additional services**: $20-50/month
- **Total**: ~$65-95/month

### **Scale Setup (10K+ users)**
- **Enterprise hosting**: $200-500/month
- **Dedicated database**: $100-200/month
- **CDN & monitoring**: $50-100/month
- **Total**: ~$350-800/month

## 🎯 **Launch Checklist**

### **Pre-Launch**
- [ ] All environment variables configured
- [ ] Database migrations successful
- [ ] Google OAuth working
- [ ] Founder dashboard accessible
- [ ] Core features tested
- [ ] Performance optimized
- [ ] Security headers configured
- [ ] Domain SSL certificate active

### **Post-Launch**
- [ ] Set up monitoring alerts
- [ ] Configure backup schedule
- [ ] Monitor error rates
- [ ] Track user engagement
- [ ] Plan scaling strategy

## 🆘 **Support & Troubleshooting**

### **Getting Help**
1. Check deployment logs in your hosting platform
2. Review error messages in browser console
3. Test database connectivity
4. Verify all environment variables

### **Common Commands**
```bash
# Check build locally
npm run build

# Test production build
npm run start

# Database operations
npx prisma studio
npx prisma db push
npx prisma generate
```

## 🎉 **You're Ready to Launch!**

Your Clerva app is now production-ready with:
- ✅ Secure authentication & founder access
- ✅ Production database setup
- ✅ AI-powered features
- ✅ Performance optimizations
- ✅ Security best practices
- ✅ Monitoring capabilities

**Next Steps:**
1. Choose your hosting platform
2. Set up required services
3. Configure environment variables
4. Deploy and test
5. Monitor and scale

Good luck with your launch! 🚀