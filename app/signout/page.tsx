'use client'

import { signOut } from 'next-auth/react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SignOutPage() {
  const router = useRouter()

  useEffect(() => {
    const performSignOut = async () => {
      await signOut({ redirect: false })
      router.push('/')
    }
    
    performSignOut()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Signing out...</h1>
        <p className="text-gray-600">You will be redirected to the homepage shortly.</p>
      </div>
    </div>
  )
}
