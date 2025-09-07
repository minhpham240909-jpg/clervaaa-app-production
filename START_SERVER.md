# 🚀 How to Start Your Clerva Server

## 📍 **Step 1: Navigate to the Correct Directory**

In your terminal, type these commands **exactly**:

```bash
cd /Users/minhpham/Documents/minh.py/studybuddy-app
pwd
```

You should see: `/Users/minhpham/Documents/minh.py/studybuddy-app`

## 🖥️ **Step 2: Start the Development Server**

```bash
npm run dev
```

## 🌐 **Step 3: Open Your Browser**

Go to: **http://localhost:3000**

## 🧪 **Complete Testing Guide**

### **✅ Homepage Testing**
1. **Visit** http://localhost:3000
2. **Check** if the Clerva landing page loads
3. **Look for** navigation menu, hero section, features

### **🔐 Authentication Testing**
1. **Click** "Sign In" or "Get Started"
2. **Try** Google sign-in
3. **Check** if you're redirected to dashboard

### **📊 Dashboard Testing**
1. **Access** the main dashboard
2. **Navigate** through different sections:
   - Goals
   - Sessions  
   - Messages
   - Calendar
   - Profile

### **🤖 AI Features Testing**
Test each AI-powered feature:

#### **📝 Study Summaries**
1. Go to AI → Summaries
2. Input some study content
3. Generate AI summary
4. Verify GPT response

#### **🎯 Flashcards**
1. Go to AI → Flashcards
2. Input study material
3. Generate flashcards
4. Check question/answer pairs

#### **📊 Quiz Generation**
1. Go to AI → Quiz
2. Input content
3. Generate quiz questions
4. Test different question types

#### **🤝 Partner Matching**
1. Go to Find Partners
2. Set preferences
3. Run AI matching
4. Check compatibility scores

#### **📈 Progress Analysis**
1. Go to Analytics/Progress
2. View AI insights
3. Check personalized recommendations

### **🔧 Troubleshooting**

**If you see database errors:**
- App still works, just authentication limited
- Most features (AI, UI) work perfectly

**If server won't start:**
1. Make sure you're in `/Users/minhpham/Documents/minh.py/studybuddy-app`
2. Run `npm install`
3. Try `npm run dev` again

**If page won't load:**
- Wait 30 seconds for server to fully start
- Check terminal for "Ready in XXXms" message
- Refresh browser

## 🎯 **What You Should See Working**

✅ **Beautiful UI** - Modern, responsive design  
✅ **AI Features** - All 5 AI-powered study tools  
✅ **Navigation** - Smooth app navigation  
✅ **Real-time** - Live updates and features  
✅ **Authentication** - Google OAuth login  
✅ **Dashboard** - Complete study management  

## 🎉 **You're All Set!**

Your Clerva app is ready to use with:
- **Advanced AI capabilities**
- **Production-ready codebase**  
- **Modern user interface**
- **Complete study platform**

**Enjoy testing your amazing AI-powered study app!** 🚀📚
