# Clerva 📚

A Next.js 14 application that connects students with their perfect study partners through intelligent matching algorithms and collaborative learning features.

## ✨ Features

- **Smart Matching Algorithm**: AI-powered matching based on subjects, schedule, learning style, and location
- **Real-time Chat**: Instant messaging with study partners and groups
- **Study Group Management**: Create and join study groups with scheduling tools
- **Session Planning**: Organize and track study sessions with calendar integration
- **Progress Tracking**: Monitor your learning progress and achievements
- **Peer Reviews**: Build reputation through peer feedback and recommendations
- **Subject Management**: Comprehensive subject catalog with skill level tracking
- **Authentication**: Secure OAuth authentication with Google and GitHub
- **Real-time Updates**: Live notifications and real-time collaboration features

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Real-time**: Supabase for real-time features
- **UI Components**: Custom components with Lucide React icons
- **Form Handling**: React Hook Form with Zod validation
- **Notifications**: React Hot Toast

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or later
- PostgreSQL database (or Supabase account)
- Google OAuth credentials (optional)
- GitHub OAuth credentials (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/studybuddy-app.git
   cd studybuddy-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Fill in your environment variables:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/studybuddy"
   DIRECT_URL="postgresql://username:password@localhost:5432/studybuddy"

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

   # NextAuth.js
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"

   # OAuth Providers
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GITHUB_ID="your-github-app-id"
   GITHUB_SECRET="your-github-app-secret"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push the schema to your database
   npm run db:push

   # Seed the database with sample data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔒 Security Features

This application includes comprehensive security measures:

### Environment Validation
- All environment variables are validated at startup
- Missing or invalid variables will prevent the app from starting
- Secure defaults are provided where appropriate

### API Security
- Rate limiting on all API endpoints
- Input validation and sanitization
- XSS protection with DOMPurify
- SQL injection protection through Prisma ORM
- Request size limits and validation

### Authentication & Authorization
- NextAuth.js with secure session management
- OAuth providers (Google, GitHub)
- Session timeout and secure cookies
- CSRF protection

### Monitoring & Alerting
- Real-time application monitoring
- Security event logging
- Performance metrics tracking
- Automated alerting for security incidents

### Privacy & GDPR Compliance
- Data retention policies
- User data export functionality
- Account deletion capabilities
- Privacy settings management

### Database Security
- PostgreSQL with connection pooling
- Prepared statements through Prisma
- Data encryption at rest
- Secure connection strings

## 🛡️ Security Commands

```bash
# Run security audit
npm run security:audit

# Fix security vulnerabilities
npm run security:fix

# Check for outdated dependencies
npm run deps:check

# Update dependencies
npm run deps:update

# Run tests
npm test

# Type checking
npm run type-check
```

## 📁 Project Structure

```
studybuddy-app/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard pages
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── auth/              # Authentication components
│   ├── dashboard/         # Dashboard components
│   ├── landing/           # Landing page components
│   ├── layout/            # Layout components
│   └── providers/         # Context providers
├── lib/                   # Utility libraries
│   ├── auth.ts            # NextAuth configuration
│   ├── prisma.ts          # Prisma client
│   ├── supabase.ts        # Supabase client
│   └── utils.ts           # Utility functions
├── prisma/                # Database schema and migrations
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seeding
├── types/                 # TypeScript type definitions
└── public/                # Static assets
```

## 🗄️ Database Schema

The application uses a comprehensive schema designed for study matching:

- **Users**: Profile information, preferences, and availability
- **Subjects**: Academic subjects with categories
- **UserSubjects**: User's subjects with skill levels
- **StudyGroups**: Group information and settings
- **StudyGroupMembers**: Group membership and roles
- **StudySessions**: Scheduled study sessions
- **StudyRequests**: Partner requests and invitations
- **Messages**: Real-time messaging
- **Reviews**: Peer review system

## 🎨 Design System

Clerva uses a custom design system optimized for educational applications:

### Color Palette
- **Primary**: Bright blue (#0ea5e9) - Trust and focus
- **Secondary**: Bright yellow (#facc15) - Energy and highlights
- **Accent**: Success green (#22c55e) - Achievement and progress
- **Semantic Colors**: 
  - Focus purple - Deep concentration
  - Learning blue - Knowledge acquisition
  - Motivation red - Encouragement

### Typography
- **Headings**: Poppins (friendly and approachable)
- **Body**: Inter (clean and readable)

## 📊 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema changes
npm run db:studio       # Open Prisma Studio
npm run db:seed         # Seed database

# Code Quality
npm run lint            # Run ESLint
npm run format          # Format with Prettier
npm run format:check    # Check formatting
npm run type-check      # TypeScript type checking
```

## 🔧 Configuration

### Authentication Setup

1. **Google OAuth**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

2. **GitHub OAuth**:
   - Go to GitHub Settings > Developer settings > OAuth Apps
   - Create a new OAuth App
   - Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

### Supabase Setup

1. Create a new project at [Supabase](https://supabase.com/)
2. Get your project URL and anon key
3. Set up real-time subscriptions for messaging features
4. Configure row level security (RLS) policies

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-production-secret"
# ... other environment variables
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and code comments
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Use GitHub Discussions for questions

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS
- [Prisma](https://prisma.io/) for the excellent database toolkit
- [Supabase](https://supabase.com/) for real-time features
- [Lucide](https://lucide.dev/) for beautiful icons