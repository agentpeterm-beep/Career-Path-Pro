
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import HeroSection from '@/components/hero-section'
import FeaturesSection from '@/components/features-section'
import PricingSection from '@/components/pricing-section'
import Header from '@/components/header'

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
    </div>
  )
}
