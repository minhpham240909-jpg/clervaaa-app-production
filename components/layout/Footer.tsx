import Link from 'next/link'
import { BookOpen, Github, Twitter, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className='bg-white border-t border-neutral-200'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
          <div className='col-span-1 md:col-span-2'>
            <div className='flex items-center space-x-2 mb-4'>
              <BookOpen className='h-8 w-8 text-primary-500' />
              <span className='font-bold text-xl font-heading text-neutral-900'>
                Clerva
              </span>
            </div>
            <p className='text-neutral-600 max-w-md'>
              Connect with like-minded students for collaborative learning and academic success. 
              Find your perfect study partner today.
            </p>
            <div className='flex space-x-4 mt-6'>
              <a href='#' className='text-neutral-400 hover:text-primary-500 transition-colors'>
                <Twitter className='h-5 w-5' />
              </a>
              <a href='#' className='text-neutral-400 hover:text-primary-500 transition-colors'>
                <Github className='h-5 w-5' />
              </a>
              <a href='#' className='text-neutral-400 hover:text-primary-500 transition-colors'>
                <Mail className='h-5 w-5' />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className='font-semibold text-neutral-900 mb-4'>Product</h3>
            <ul className='space-y-2'>
              <li>
                <Link href='/features' className='text-neutral-600 hover:text-primary-600 transition-colors'>
                  Features
                </Link>
              </li>
              <li>
                <Link href='/faq' className='text-neutral-600 hover:text-primary-600 transition-colors'>
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className='font-semibold text-neutral-900 mb-4'>Company</h3>
            <ul className='space-y-2'>
              <li>
                <Link href='/about' className='text-neutral-600 hover:text-primary-600 transition-colors'>
                  About
                </Link>
              </li>
              <li>
                <Link href='/privacy' className='text-neutral-600 hover:text-primary-600 transition-colors'>
                  Privacy
                </Link>
              </li>
              <li>
                <Link href='/terms' className='text-neutral-600 hover:text-primary-600 transition-colors'>
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className='border-t border-neutral-200 mt-8 pt-8 text-center text-neutral-500'>
          <p>&copy; 2024 Clerva. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}