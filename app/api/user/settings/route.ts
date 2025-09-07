import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user settings from database (using preferences field)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        preferences: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Return settings or default settings if none exist
    const settings = user.preferences ? JSON.parse(user.preferences as string) : {}
    
    return NextResponse.json(settings)
  } catch (error) {
    logger.error('Failed to fetch user settings', error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      { error: 'Failed to fetch settings' }, 
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        preferences: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Merge existing settings with new ones
    const existingSettings = user.preferences ? JSON.parse(user.preferences as string) : {}
    const updatedSettings = {
      ...existingSettings,
      ...body,
      updatedAt: new Date().toISOString()
    }

    // Update user settings in database (using preferences field)
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        preferences: JSON.stringify(updatedSettings)
      }
    })

    return NextResponse.json({ 
      message: 'Settings updated successfully',
      settings: updatedSettings 
    })
  } catch (error) {
    logger.error('Failed to update user settings', error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      { error: 'Failed to update settings' }, 
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { section, settings: sectionSettings } = await request.json()

    if (!section) {
      return NextResponse.json({ error: 'Section is required' }, { status: 400 })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        preferences: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update specific section
    const existingSettings = user.preferences ? JSON.parse(user.preferences as string) : {}
    const updatedSettings = {
      ...existingSettings,
      [section]: {
        ...existingSettings[section],
        ...sectionSettings
      },
      updatedAt: new Date().toISOString()
    }

    // Update user settings in database (using preferences field)
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        preferences: JSON.stringify(updatedSettings)
      }
    })

    return NextResponse.json({ 
      message: 'Settings section updated successfully',
      settings: updatedSettings 
    })
  } catch (error) {
    logger.error('Failed to update settings section', error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      { error: 'Failed to update settings section' }, 
      { status: 500 }
    )
  }
}