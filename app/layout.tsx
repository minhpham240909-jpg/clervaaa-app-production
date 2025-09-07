import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { SettingsProvider } from '@/lib/contexts/SettingsContext'
import { Toaster } from 'react-hot-toast'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import SettingsApplicatorClient from '@/components/SettingsApplicatorClient'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'Clerva - Find Your Perfect Study Partner',
  description: 'Connect with like-minded students for collaborative learning and academic success.',
  keywords: 'study, education, learning, collaboration, students, tutoring',
  authors: [{ name: 'Clerva Team' }],
  creator: 'Clerva',
  publisher: 'Clerva',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Clerva" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
      </head>
      <body className='font-sans antialiased'>
        <ErrorBoundary>
          <AuthProvider>
            <SettingsProvider>
              <SettingsApplicatorClient />
              {children}
              <Toaster
                position='top-right'
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#fff',
                    color: '#374151',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  },
                }}
              />
            </SettingsProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}