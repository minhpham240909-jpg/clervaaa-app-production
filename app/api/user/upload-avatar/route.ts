import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const image = formData.get('image') as File

    if (!image) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      )
    }

    // Validate image type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif']
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!allowedTypes.includes(image.type)) {
      return NextResponse.json(
        { error: 'Invalid image type. Only JPG, PNG, and GIF are allowed.' },
        { status: 400 }
      )
    }

    if (image.size > maxSize) {
      return NextResponse.json(
        { error: 'Image file too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // In a real implementation, you would:
    // 1. Upload the image to a cloud storage service (AWS S3, Cloudinary, etc.)
    // 2. Get the public URL of the uploaded image
    // 3. Save the URL to the user's profile in the database
    
    // For now, we'll simulate this process and return a placeholder URL
    const imageUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}&backgroundColor=0ea5e9,1e40af,7c3aed`

    // Update user profile with the new image URL
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl }
    })

    return NextResponse.json({
      success: true,
      imageUrl,
      message: 'Avatar updated successfully'
    })

  } catch (error) {
    console.error('Avatar upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload avatar' },
      { status: 500 }
    )
  }
}