

'use client'

import { useRouter } from 'next/navigation'
import ContactSearch from '@/components/contact-search'

export default function ContactSearchClient() {
  const router = useRouter()
  
  const handleBack = () => {
    router.push('/dashboard')
  }

  return <ContactSearch onBack={handleBack} />
}

