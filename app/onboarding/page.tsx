import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import OnboardingFlow from '@/components/onboarding/OnboardingFlow'
import { prisma } from '@/lib/prisma'

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/signin')
  }

  // Check if user has already completed onboarding
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { profileComplete: true }
    })

    if (user?.profileComplete) {
      redirect('/dashboard')
    }
  } catch (error) {
    console.error('Error checking onboarding status:', error)
  }

  return <OnboardingFlow />
}
