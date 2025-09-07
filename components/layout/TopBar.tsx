'use client'

import { Bell, User } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import Image from 'next/image'

export default function TopBar() {
  const { data: session } = useSession()
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  return (
    <header className='bg-white border-b border-neutral-200 px-6 py-4'>
      <div className='flex items-center justify-end'>
        <div className='flex items-center space-x-4'>
          <button className='p-2 text-neutral-400 hover:text-neutral-600 transition-colors relative'>
            <Bell className='h-6 w-6' />
            <span className='absolute -top-1 -right-1 bg-accent-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
              3
            </span>
          </button>

          <div className='relative'>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className='flex items-center space-x-2 p-2 rounded-lg hover:bg-neutral-100 transition-colors'
            >
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  width={32}
                  height={32}
                  className='rounded-full'
                />
              ) : (
                <div className='w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center'>
                  <User className='h-5 w-5 text-white' />
                </div>
              )}
              <span className='text-sm font-medium text-neutral-700'>
                {session?.user?.name?.split(' ')[0] || 'User'}
              </span>
            </button>

            {showProfileMenu && (
              <div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-50'>
                <a href='/profile' className='block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100'>
                  View Profile
                </a>
                <a href='/settings' className='block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100'>
                  Settings
                </a>
                <hr className='my-1 border-neutral-200' />
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className='block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100'
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}