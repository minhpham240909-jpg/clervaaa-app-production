'use client'

import Link from 'next/link'
import { Search, Sparkles, Users } from 'lucide-react'

export default function QuickActions() {
  return (
    <div className='flex space-x-3'>

      <Link
        href='/find'
        className='btn-primary inline-flex items-center'
      >
        <Search className='h-4 w-4 mr-2' />
        Find Partners
      </Link>
      
      <Link
        href='/ai/partner-matching'
        className='btn-outline inline-flex items-center'
      >
        <Sparkles className='h-4 w-4 mr-2' />
        AI Matching
      </Link>
      
      <Link
        href='/groups/new'
        className='btn-outline inline-flex items-center'
      >
        <Users className='h-4 w-4 mr-2' />
        Create Group
      </Link>
    </div>
  )
}