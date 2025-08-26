
'use client'

import dynamic from 'next/dynamic'

const ClientDashboardLayout = dynamic(() => import('./client-dashboard-layout'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
})

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientDashboardLayout>
      {children}
    </ClientDashboardLayout>
  )
}
