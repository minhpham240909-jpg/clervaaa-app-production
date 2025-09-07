import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { env } from '@/lib/env'

// Helper function to check if user is founder
function isFounderEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const founderEmails = env.FOUNDER_EMAILS.split(',').map((e: string) => e.trim()).filter((e: string) => e.length > 0)

  return founderEmails.includes(email)
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      }
    }),
  ],
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.sub || ''
        // Check if user is founder
        session.user.isFounder = isFounderEmail(session.user.email)
      }
      return session
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.uid = user.id
        // Store founder status in JWT
        token.isFounder = isFounderEmail(user.email || null)
      }
      return token
    },
    redirect: async ({ url, baseUrl }) => {

      // Handle callbackUrl parameter properly
      try {
        const urlObj = new URL(url, baseUrl)
        const callbackUrl = urlObj.searchParams.get('callbackUrl')
        
        if (callbackUrl) {
          // Decode and validate the callback URL
          const decodedCallbackUrl = decodeURIComponent(callbackUrl)
          if (decodedCallbackUrl.startsWith('/')) {

            return baseUrl + decodedCallbackUrl
          }
        }
      } catch (error) {
        console.error('Error parsing callback URL:', error)
      }
      
      // Always return to the requested URL if it's internal
      if (url.startsWith(baseUrl)) {

        return url
      }
      
      // For external URLs, redirect to dashboard by default

      return `${baseUrl}/dashboard`
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // 1 hour
  },
  pages: {
    signIn: '/signin',
    newUser: '/dashboard',
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60, // 24 hours
      },
    },
  },
}