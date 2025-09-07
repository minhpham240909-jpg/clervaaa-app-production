import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import UsersTable from '@/components/admin/UsersTable'

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/signin')
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-heading text-neutral-900 mb-2">
            User Management
          </h1>
          <p className="text-neutral-600">
            View and manage all Clerva users
          </p>
        </div>
        
        <UsersTable />
      </div>
    </div>
  )
}