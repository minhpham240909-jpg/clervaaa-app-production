import Hero from '@/components/landing/Hero'
import Features from '@/components/landing/Features'
import HowItWorks from '@/components/landing/HowItWorks'
import Testimonials from '@/components/landing/Testimonials'
import CTA from '@/components/landing/CTA'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function PreviewPage() {
  return (
    <div className='min-h-screen bg-white'>
      <Header />
      <main className='overflow-hidden'>
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}