

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import DashboardLayout from '@/components/dashboard/dashboard-layout'
import ContactSearchClient from '@/components/contact-search-client'

export default async function ContactSearchPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <DashboardLayout>
      <ContactSearchClient />
    </DashboardLayout>
  )
}

