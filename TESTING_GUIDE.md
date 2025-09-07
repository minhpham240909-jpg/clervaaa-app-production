# 🧪 Clerva Enhanced App Testing Guide

Your Clerva app is now running with advanced algorithms and enhanced features! Here's how to test everything:

## 🌐 **Quick Access Links**
- **Homepage**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs
- **Health Check**: http://localhost:3001/api/health

## 🔐 **Step 1: Authentication Testing**

### Test the Homepage Flow:
1. **Visit Homepage**: http://localhost:3001
   - ✅ Should see your beautiful landing page
   - ✅ Click "Sign In" button to test authentication

2. **Sign In Process**:
   - ✅ Should redirect to `/auth/signin`
   - ✅ Test Google/GitHub OAuth integration
   - ✅ After sign-in, should redirect to dashboard

3. **Profile Completion**:
   - ✅ Complete your profile to unlock advanced features
   - ✅ Add subjects, study level, learning style
   - ✅ Check that you earn +50 points for profile completion

## 📊 **Step 2: API Features Testing**

### Test Enhanced Health Monitoring:
```bash
curl http://localhost:3001/api/health
```
**Expected Response:**
- ✅ System status with caching info
- ✅ Database health metrics
- ✅ Memory usage statistics
- ✅ Performance metrics

### Test API Documentation:
1. **Visit**: http://localhost:3001/api/docs
   - ✅ Should see comprehensive HTML documentation
   - ✅ Try JSON format: http://localhost:3001/api/docs?format=json

## 👥 **Step 3: Advanced Partner Matching**

### Test Basic Matching (requires auth):
1. **Sign in first**, then visit the matching page
2. **Test Standard Algorithm**:
   ```javascript
   // In browser console or API client:
   fetch('/api/partners/matching', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       limit: 5,
       includeAIScoring: false,
       useAdvancedAlgorithms: false
     })
   })
   ```

3. **Test Advanced Algorithms**:
   ```javascript
   fetch('/api/partners/matching', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       limit: 5,
       includeAIScoring: true,
       useAdvancedAlgorithms: true,  // 🚀 NEW FEATURE
       preferences: {
         studyLevel: ['INTERMEDIATE'],
         learningStyle: ['visual'],
         sessionType: 'virtual'
       }
     })
   })
   ```

**Expected Advanced Features:**
- ✅ Memoized user queries for performance
- ✅ Performance metrics in response
- ✅ Advanced algorithm results vs legacy
- ✅ Gamification insights
- ✅ Hybrid recommendation engine results

## 📚 **Step 4: Study Groups Testing**

### Test Study Group Creation:
```javascript
fetch('/api/study-groups', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Advanced JavaScript Study Group',
    description: 'Learning modern JavaScript together',
    maxMembers: 8,
    isPrivate: false,
    tags: ['javascript', 'programming', 'web-development']
  })
})
```

**Expected Results:**
- ✅ Group created successfully
- ✅ +25 points awarded
- ✅ User becomes group owner

### Test Joining Groups:
1. **Get available groups**:
   ```javascript
   fetch('/api/study-groups?limit=10')
   ```

2. **Join a group**:
   ```javascript
   fetch('/api/study-groups/[GROUP_ID]/join', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       message: 'Excited to study together!'
     })
   })
   ```

## 🎯 **Step 5: Goals & Gamification**

### Test Goal Creation:
```javascript
fetch('/api/goals', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Complete React Course',
    description: 'Finish the advanced React course within 4 weeks',
    targetValue: 40,
    unit: 'hours',
    category: 'STUDY_TIME',
    priority: 'HIGH',
    deadline: '2024-02-28T00:00:00Z'
  })
})
```

### Test Goal Progress Update:
```javascript
fetch('/api/goals?id=[GOAL_ID]', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    value: 10,
    note: 'Completed first 3 modules'
  })
})
```

**Expected Gamification:**
- ✅ +15 points for creating goal
- ✅ +5 points for progress updates
- ✅ Bonus points for goal completion
- ✅ Streak tracking

## 📖 **Step 6: Subjects Management**

### Add Subjects to Profile:
```javascript
fetch('/api/subjects', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    subjectId: '[SUBJECT_ID]',
    skillLevel: 'INTERMEDIATE'
  })
})
```

### Get Available Subjects:
```javascript
fetch('/api/subjects?category=Science')
```

## 🤖 **Step 7: AI Chat Testing**

### Test AI Chatbot:
```javascript
fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Help me create a study plan for learning React',
    context: { type: 'STUDY_PLANNING' }
  })
})
```

### Get Chat History:
```javascript
fetch('/api/chat?limit=10')
```

## 🔒 **Step 8: Security Features Testing**

### Test Rate Limiting:
1. **Make multiple rapid requests** to see rate limiting in action
2. **Check response headers**:
   - `X-RateLimit-Limit`
   - `X-RateLimit-Remaining` 
   - `X-RateLimit-Reset`

### Test Security Headers:
```bash
curl -I http://localhost:3001/api/health
```
**Should include:**
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `X-Frame-Options: DENY`
- ✅ `X-XSS-Protection: 1; mode=block`
- ✅ `Content-Security-Policy`

## 🚀 **Step 9: Performance Testing**

### Test Caching:
1. **First request** to `/api/health` (should be slow)
2. **Second request** within 30 seconds (should be fast, cached)
3. **Check cache headers** in response

### Test Memoization:
1. **Multiple matching requests** with same user
2. **Check performance metrics** in response
3. **Should see improved response times**

## 📱 **Step 10: Frontend Integration**

### Test in Browser:
1. **Complete user journey**:
   - Sign up → Complete Profile → Browse Groups → Find Partners
2. **Check network tab** for API calls
3. **Test error handling** with invalid inputs
4. **Verify responsive design** on mobile

### Key Frontend Features to Test:
- ✅ Homepage with hero section and features
- ✅ Authentication flow
- ✅ Dashboard with stats and achievements  
- ✅ Study groups list and creation
- ✅ Partner matching interface
- ✅ Goals tracking and progress
- ✅ AI chat interface
- ✅ Profile management

## 🐛 **Troubleshooting**

### Common Issues:
1. **"Unauthorized" errors**: Make sure you're signed in
2. **Database errors**: Check your `.env.local` file
3. **Algorithm errors**: Check that algorithm files exist
4. **Network errors**: Verify server is running on port 3001

### Debug Commands:
```bash
# Check server status
npm run dev

# Check database
npx prisma studio

# Run tests
npm test

# Check logs
# Look in browser console and server terminal
```

## ✨ **Advanced Testing Scenarios**

### Test Algorithm Performance:
1. **Create multiple test users** with different profiles
2. **Run matching with and without advanced algorithms**
3. **Compare response times and result quality**
4. **Check performance metrics in responses**

### Test Scalability:
1. **Concurrent user simulation**
2. **Bulk data operations**
3. **Memory usage monitoring**
4. **Cache hit rate analysis**

---

## 🎉 **Success Indicators**

Your app is working perfectly if you see:
- ✅ Fast, cached responses
- ✅ Proper authentication flow
- ✅ Advanced matching results
- ✅ Gamification points system
- ✅ Comprehensive error handling
- ✅ Security headers and rate limiting
- ✅ Real-time performance metrics

Happy testing! 🚀