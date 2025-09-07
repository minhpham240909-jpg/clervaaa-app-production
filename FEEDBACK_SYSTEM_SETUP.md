# Clerva Feedback System - Complete Setup Guide

## 🎯 Overview

This comprehensive feedback system allows you to collect, manage, and analyze user feedback, feature ideas, and bug reports. As the founder, you'll receive instant notifications and have a powerful admin dashboard to track everything.

## 📧 Email Notifications Setup

### Option 1: Resend (Recommended)
1. Sign up at [resend.com](https://resend.com)
2. Add your domain and verify DNS records
3. Generate an API key
4. Add to your `.env` file:

```bash
# Email Configuration
EMAIL_SERVICE=resend
RESEND_API_KEY=re_xxxxxxxxxx
FROM_EMAIL=Clerva <feedback@yourdomain.com>
ADMIN_EMAILS=your-email@gmail.com,co-founder@gmail.com
```

### Option 2: SendGrid
1. Create account at [sendgrid.com](https://sendgrid.com)
2. Generate API key
3. Set up sender authentication
4. Add to `.env`:

```bash
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxx
FROM_EMAIL=feedback@yourdomain.com
ADMIN_EMAILS=your-email@gmail.com,co-founder@gmail.com
```

## 🔧 Database Setup

1. Run the database migration to add feedback tables:
```bash
npx prisma db push
```

2. Generate the updated Prisma client:
```bash
npx prisma generate
```

## 👤 Admin Access Setup

Add your admin emails to the environment:
```bash
# Admin Configuration
ADMIN_EMAILS=founder@studybuddy.com,cofounder@studybuddy.com
```

Access your admin dashboard at: `https://yourdomain.com/admin/feedback`

## 📊 What You'll Receive

### Instant Email Notifications
Every time a user submits feedback, you'll get an email with:
- **Feedback type** (General, Feature Idea, Bug Report)
- **Priority level** (automatically determined)
- **User rating** (1-5 stars for general feedback)
- **Full message** content
- **User information** (name and email if available)
- **Direct link** to admin dashboard
- **Technical metadata** for bug reports

### Slack Integration (Optional)
Get notifications in Slack:
```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx/xxx/xxx
```

### Discord Integration (Optional)
Get notifications in Discord:
```bash
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/xxx/xxx
```

## 📈 Admin Dashboard Features

### Analytics Overview
- **Total feedback** count with trends
- **Average rating** from users
- **Priority distribution** (Critical, High, Medium, Low)
- **Status tracking** (New, In Progress, Resolved)

### Management Tools
- **Search and filter** feedback by type, status, priority
- **Bulk actions** for managing multiple items
- **Status updates** with timestamps
- **Priority adjustments** based on business needs
- **User information** and contact details
- **Export to CSV** for further analysis

### Feedback Categories
- 📝 **General Feedback** - User experiences and suggestions
- 💡 **Feature Ideas** - New features and improvements
- 🐛 **Bug Reports** - Technical issues and problems

## 🎯 Priority System

The system automatically assigns priority based on:
- **Critical**: Bug reports or 1-star ratings
- **High**: 2-star ratings or detailed feature ideas
- **Medium**: 3-star ratings or substantial feedback
- **Low**: 4-5 star ratings or brief comments

## 📱 How Users Submit Feedback

Users can access the feedback system through:
1. **Settings** → **Support & Feedback**
2. Three tabs: General Feedback, Feature Ideas, Bug Reports
3. **Star ratings** for experience feedback
4. **Rich text areas** for detailed descriptions
5. **Anonymous submissions** supported

## 🔍 Tracking & Analytics

### Data Collected
- User feedback content and ratings
- User information (when available)
- Browser and device information
- Submission timestamps
- Screen resolution and viewport size
- Current page URL

### Reports Available
- Feedback trends over time
- User satisfaction scores
- Feature request popularity
- Bug report frequency
- Response time analytics

## 🚀 Getting Started Checklist

- [ ] Set up email service (Resend or SendGrid)
- [ ] Add admin emails to environment variables
- [ ] Run database migration (`npx prisma db push`)
- [ ] Generate Prisma client (`npx prisma generate`)
- [ ] Test feedback submission from user side
- [ ] Verify email notifications are received
- [ ] Access admin dashboard at `/admin/feedback`
- [ ] Set up Slack/Discord webhooks (optional)

## 💡 Best Practices

### Responding to Feedback
1. **Acknowledge quickly** - Even a simple "Thanks, we're looking into this"
2. **Prioritize critical bugs** - Fix these first
3. **Engage with feature ideas** - Ask follow-up questions
4. **Close the loop** - Update users when issues are resolved

### Using the Data
1. **Weekly reviews** - Check new feedback regularly
2. **Product roadmap** - Use feature requests for planning
3. **User satisfaction** - Track rating trends
4. **Bug patterns** - Look for recurring issues

## 📞 Support

If you need help setting up the feedback system:
1. Check the console logs for any errors
2. Verify all environment variables are set
3. Test the API endpoints directly
4. Check email service configuration

## 🔒 Security & Privacy

- User emails are only stored if provided
- Anonymous feedback is supported
- Admin access is restricted by email whitelist
- All feedback is stored securely in your database
- GDPR compliant with data export features

---

## Example Email You'll Receive

```
Subject: 💡 New Feature Idea - HIGH Priority

Clerva Feedback System

Type: Feature Idea
Priority: HIGH
Rating: N/A
User: john.doe@university.edu
Submitted: Dec 15, 2024, 2:30 PM

Message:
"I'd love to see a mobile app with offline study modes. Sometimes I study in places without good WiFi, and being able to access my flashcards and notes offline would be amazing. Maybe sync when connection is restored?"

[View in Admin Dashboard]
```

Your feedback system is now ready to help you build a better Clerva! 🎉