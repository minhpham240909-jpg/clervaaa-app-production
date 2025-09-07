'use client'

import Link from 'next/link'
import { BookOpen, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className='bg-white/80 backdrop-blur-sm border-b border-neutral-200 sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          <Link href='/' className='flex items-center space-x-2 hover:opacity-80 transition-opacity'>
            <BookOpen className='h-8 w-8 text-primary-500' />
            <span className='font-bold text-xl font-heading text-neutral-900'>
              Clerva
            </span>
          </Link>

          <nav className='hidden md:flex items-center space-x-8'>
            <Link href='/features' className='text-neutral-600 hover:text-primary-600 transition-colors'>
              Features
            </Link>
            <Link href='/faq' className='text-neutral-600 hover:text-primary-600 transition-colors'>
              FAQ
            </Link>
            <Link href='/about' className='text-neutral-600 hover:text-primary-600 transition-colors'>
              About
            </Link>
            <Link href='/signin?mode=login' className='btn-outline'>
              Log In
            </Link>
            <Link href='/signin?mode=signup' className='btn-primary'>
              Sign Up
            </Link>
          </nav>

          <button
            className='md:hidden'
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className='h-6 w-6' /> : <Menu className='h-6 w-6' />}
          </button>
        </div>

        {isMenuOpen && (
          <div className='md:hidden py-4 border-t border-neutral-200'>
            <nav className='flex flex-col space-y-4'>
              <Link href='/features' className='text-neutral-600 hover:text-primary-600 transition-colors'>
                Features
              </Link>
              <Link href='/faq' className='text-neutral-600 hover:text-primary-600 transition-colors'>
                FAQ
              </Link>
              <Link href='/about' className='text-neutral-600 hover:text-primary-600 transition-colors'>
                About
              </Link>
              <Link href='/signin?mode=login' className='btn-outline text-center'>
                Log In
              </Link>
              <Link href='/signin?mode=signup' className='btn-primary text-center'>
                Sign Up
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}