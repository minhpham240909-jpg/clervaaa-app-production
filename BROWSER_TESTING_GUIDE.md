# 🧪 Clerva Browser Testing Guide

## 🚀 **Current Status**
Your Clerva app is ready for testing! Here's how to access it in your browser.

## 📝 **Step-by-Step Testing Instructions**

### **1. Start the Development Server**

**In your terminal, make sure you're in the right directory:**
```bash
cd /Users/minhpham/Documents/minh.py/studybuddy-app
npm run dev
```

**You should see:**
```
▲ Next.js 14.2.32
- Local:        http://localhost:3000
- Environments: .env.local, .env

✓ Ready in [time]ms
```

### **2. Open Your Browser**

**Go to:** `http://localhost:3000`

### **3. Test Homepage**
- ✅ Homepage should load with Clerva branding
- ✅ Navigation menu should be visible
- ✅ "Sign In" button should be present

### **4. Test Authentication**

**Click "Sign In":**
- ✅ Should redirect to Google OAuth
- ✅ Sign in with your Google account
- ✅ Should redirect back to Clerva
- ✅ Should automatically go to `/dashboard`

### **5. Test Dashboard Access**

**After signing in:**
- ✅ URL should be: `http://localhost:3000/dashboard`
- ✅ You should see your study dashboard
- ✅ User profile should be visible
- ✅ Navigation sidebar should work

### **6. Test AI Features**

**Navigate through the app and test:**

1. **📝 Study Summaries** (`/ai/summaries`)
   - ✅ Upload or paste text content
   - ✅ Generate AI summary using OpenAI
   - ✅ Summary should appear

2. **🎯 Flashcards** (`/ai/flashcards`)
   - ✅ Input study material
   - ✅ Generate flashcards with AI
   - ✅ Flashcards should be interactive

3. **📊 Quiz Generator** (`/ai/quiz`)
   - ✅ Create quiz from content
   - ✅ Multiple choice questions generated
   - ✅ Interactive quiz interface

4. **🤝 Partner Matching** (`/find`)
   - ✅ Set study preferences
   - ✅ AI-powered matching algorithm
   - ✅ Find compatible study partners

5. **📈 Progress Analysis** (`/ai/progress`)
   - ✅ View study analytics
   - ✅ AI-generated insights
   - ✅ Progress charts and metrics

### **7. Test Database Features**

**Create test data:**
- ✅ Create a study goal
- ✅ Save preferences in settings
- ✅ Add calendar events
- ✅ Data should persist after refresh

### **8. Test Mobile Responsiveness**

**Resize browser window or use mobile view:**
- ✅ Layout adapts to smaller screens
- ✅ Navigation becomes mobile-friendly
- ✅ All features accessible on mobile

## 🔧 **Troubleshooting**

### **❌ "This site can't be reached"**
- **Solution**: Make sure `npm run dev` is running
- **Check**: Terminal should show "Ready" message
- **URL**: Use `http://localhost:3000` (not https)

### **❌ "Authentication Error"**
- **Solution**: Check environment variables
- **Ensure**: NEXTAUTH_SECRET, GOOGLE_CLIENT_ID are set
- **Try**: Clear browser cookies and try again

### **❌ "Dashboard not found" or "500 Error"**
- **Solution**: Database schema issue
- **Fix**: Run `npx prisma db push` in terminal
- **Restart**: Server after database changes

### **❌ "AI Features not working"**
- **Solution**: Check OPENAI_API_KEY in .env.local
- **Verify**: API key is valid and has credits
- **Test**: Try different AI features

### **❌ "Page not loading"**
- **Solution**: Check browser console (F12)
- **Look for**: JavaScript errors or network issues
- **Try**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

## 📱 **Browser Compatibility**

**Tested and working on:**
- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

## 🎯 **Testing Checklist**

Use this checklist to verify everything works:

- [ ] Homepage loads (`http://localhost:3000`)
- [ ] Google sign-in works
- [ ] Dashboard accessible after login
- [ ] AI Summaries feature works
- [ ] AI Flashcards feature works
- [ ] AI Quiz generator works
- [ ] AI Partner matching works
- [ ] AI Progress analysis works
- [ ] Create and save goals
- [ ] User settings save properly
- [ ] Mobile responsive design
- [ ] All navigation links work
- [ ] No console errors (F12)

## 🚀 **Ready for Deployment?**

**When all tests pass:**
✅ Your app is ready for production deployment to Vercel!

**Next step:** Follow the deployment guide to go live.

---

## 💡 **Quick Tips**

- **Keep terminal open** with `npm run dev` running
- **Use browser dev tools** (F12) to check for errors
- **Test on different screen sizes** for responsiveness
- **Try all AI features** to ensure OpenAI integration works
- **Clear browser cache** if you see old/cached content

**Happy testing! 🧪✨**
