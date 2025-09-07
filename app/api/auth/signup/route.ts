import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

const signupSchema = z.object({
  name: z.string().min(1, 'Full name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = signupSchema.parse(body)
    const { name, email, password } = validatedData

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        preferences: JSON.stringify({
          notifications: {
            email: true,
            studyReminders: true,
            newMatches: true,
          },
          privacy: {
            showEmail: false,
            showLocation: true,
          },
        }),
        availability: JSON.stringify({
          monday: { available: true, times: [] },
          tuesday: { available: true, times: [] },
          wednesday: { available: true, times: [] },
          thursday: { available: true, times: [] },
          friday: { available: true, times: [] },
          saturday: { available: false, times: [] },
          sunday: { available: false, times: [] },
        }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      }
    })

    logger.info('User created successfully', { userId: user.id, email: user.email })

    return NextResponse.json(
      {
        message: 'Account created successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        }
      },
      { status: 201 }
    )

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    logger.error('Signup error', error as Error, {
      endpoint: '/api/auth/signup',
      method: 'POST'
    })

    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
