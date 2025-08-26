
'use client'

import { SessionProvider } from 'next-auth/react'
import { useState, useEffect } from 'react'

export default function Providers({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <div className="min-h-screen bg-background">{children}</div>
  }

  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
}
