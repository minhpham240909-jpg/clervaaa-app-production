import React from 'react';
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import Hero from '@/components/landing/Hero'
import Features from '@/components/landing/Features'
import HowItWorks from '@/components/landing/HowItWorks'
import CTA from '@/components/landing/CTA'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default async function LandingPage() {
  const session = await getServerSession(authOptions)

  // Redirect authenticated users directly to dashboard
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className='min-h-screen relative floating-shapes bg-pattern'>
      <Header />
      <main className='overflow-hidden relative z-10'>
        <Hero />
        <Features />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}