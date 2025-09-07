# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

StudyBuddy is a Next.js 14 study matching application that connects students with perfect study partners through intelligent algorithms. The app uses TypeScript, Tailwind CSS, Prisma with PostgreSQL, Supabase for real-time features, and NextAuth.js for authentication.

## Development Commands

### Core Development
```bash
npm run dev              # Start development server (http://localhost:3000)
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint with TypeScript rules
npm run format          # Format code with Prettier
npm run type-check      # TypeScript type checking
```

### Database Operations
```bash
npm run db:generate     # Generate Prisma client (run after schema changes)
npm run db:push         # Push schema changes to database
npm run db:studio       # Open Prisma Studio for database inspection
npm run db:seed         # Seed database with sample data
```

## Architecture

### Next.js 14 App Router Structure
- `app/` - Next.js 14 App Router with route groups
- `app/(auth)/` - Authentication pages (signin, signup)
- `app/(dashboard)/` - Protected dashboard pages with shared layout
- `app/api/` - API routes including NextAuth endpoints

### Component Organization
- `components/auth/` - Authentication forms and flows
- `components/dashboard/` - Dashboard-specific components
- `components/landing/` - Marketing/landing page components
- `components/layout/` - Shared layout components (Header, Sidebar, Footer)
- `components/providers/` - React context providers

### Core Libraries and Configuration
- `lib/auth.ts` - NextAuth.js configuration with Prisma adapter
- `lib/prisma.ts` - Prisma client singleton pattern
- `lib/supabase.ts` - Supabase client with SSR support
- `lib/utils.ts` - Utility functions including cn() for class merging

### Database Schema (Prisma)
- **Comprehensive StudyBuddy schema** with 20+ models and proper relationships
- **Core Models**: User, Subject, StudyGroup, StudySession, StudyRequest, Message, Review
- **Chat & Calling**: ChatRoom, ChatMessage, Call, CallParticipant with real-time support
- **Study Tracking**: PersonalStudySession, Partnership, Goal, Achievement, Progress
- **AI & Notifications**: ChatbotMessage, Reminder, Notification, Event
- **Enhanced User Profile**: Study level, learning style, points, streaks, focus time
- **Gamification System**: Achievement badges, user points, progress tracking
- **Partnership System**: Study buddy matching, ratings, session tracking
- **Goal Management**: SMART goals with progress tracking and deadlines
- **Analytics**: Comprehensive progress metrics and study analytics
- **Proper Indexing**: Performance optimized with strategic database indexes
- **Type Safety**: Full TypeScript integration with Prisma generated types

## Key Technologies & Patterns

### Styling System
- Tailwind CSS with custom education-focused color palette
- CSS custom properties for primary, secondary, accent colors
- Utility classes defined in globals.css (btn-primary, card, input-field)
- Responsive design with mobile-first approach

### Authentication Flow
- NextAuth.js with Google and GitHub providers
- Session-based authentication using database sessions
- Protected routes using middleware and layout-level auth checks
- User onboarding flow for new accounts

### Database Patterns
- Prisma ORM with PostgreSQL
- Comprehensive relations between users, subjects, groups, sessions
- Enum types for standardized status values
- Seed file for sample data

### Real-time Features
- Supabase integration for real-time messaging
- Server-side client for SSR/SSG compatibility
- Real-time channels for chat and notifications

## Common Development Tasks

### Adding New Pages
1. Create page.tsx in appropriate app directory route group
2. Add navigation link in components/layout/Sidebar.tsx if needed
3. Implement proper authentication checks in layout.tsx

### Database Schema Changes
1. Modify prisma/schema.prisma
2. Run `npm run db:generate` to update Prisma client
3. Run `npm run db:push` to apply changes to database
4. Update TypeScript types in types/index.ts if needed
5. Run `npm run db:seed` to populate with sample data including achievements

### Working with New Study Features
- **Personal Study Sessions**: Track individual study time, topics, and productivity
- **Partnerships**: Manage study buddy relationships and ratings
- **Goals**: Create SMART goals with progress tracking and deadlines
- **Achievements**: Gamification system with badges and points
- **Progress Analytics**: Comprehensive metrics and study insights
- **AI Chatbot**: Conversation history and contextual responses

### Adding New Components
1. Follow the established component structure
2. Use TypeScript with proper prop interfaces
3. Apply Tailwind classes using the established design system
4. Use Lucide React for icons consistently

### Environment Variables
- Copy .env.example to .env.local for development
- Required: Database URL, NextAuth secret, OAuth credentials
- Optional: Supabase keys for real-time features

## Testing Strategy

### Type Safety
- Run `npm run type-check` before commits
- Use proper TypeScript interfaces for all components
- Leverage Prisma's generated types for database operations

### Code Quality
- ESLint configuration enforces TypeScript best practices
- Prettier for consistent code formatting
- Pre-commit hooks recommended for quality gates

## Design System Guidelines

### Colors
- Primary: Blue (#0ea5e9) for main actions and branding
- Secondary: Yellow (#facc15) for highlights and energy
- Accent: Green (#22c55e) for success states
- Semantic: Purple (focus), Blue (learning), Red (motivation)

### Typography
- Headings: Poppins font (friendly, approachable)
- Body: Inter font (clean, readable)
- Use font-heading class for headings, default for body text

### Component Patterns
- Use card class for content containers
- Apply btn-primary, btn-secondary, btn-outline for buttons
- Implement hover states and transitions consistently
- Follow mobile-first responsive design

## Performance Considerations

- Next.js 14 App Router with server components by default
- Client components marked with 'use client' directive
- Image optimization using Next.js Image component
- Database queries optimized with Prisma relations

## Security Practices

- NextAuth.js handles authentication securely
- Environment variables for sensitive data
- Row Level Security (RLS) policies in Supabase
- Input validation using Zod schemas
- CSRF protection built into NextAuth.js