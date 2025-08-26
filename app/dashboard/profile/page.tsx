
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import DashboardLayout from '@/components/dashboard/dashboard-layout'
import ProfileContent from '@/components/dashboard/profile-content'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <DashboardLayout>
      <ProfileContent />
    </DashboardLayout>
  )
}
