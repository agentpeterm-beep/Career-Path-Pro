

'use client'

import { useRouter } from 'next/navigation'
import SearchInterface from './search-interface'

export default function SearchPageClient() {
  const router = useRouter()
  
  const handleBack = () => {
    router.push('/dashboard')
  }

  return <SearchInterface onBack={handleBack} />
}
