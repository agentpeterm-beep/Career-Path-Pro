
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import DashboardLayout from '@/components/dashboard/dashboard-layout'
import SearchPageClient from '@/components/dashboard/search-page-client'

export default async function SearchPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <DashboardLayout>
      <SearchPageClient />
    </DashboardLayout>
  )
}
