
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import DashboardLayout from '@/components/dashboard/dashboard-layout'
import SavedResourcesContent from '@/components/dashboard/saved-resources-content'

export default async function SavedResourcesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <DashboardLayout>
      <SavedResourcesContent />
    </DashboardLayout>
  )
}
