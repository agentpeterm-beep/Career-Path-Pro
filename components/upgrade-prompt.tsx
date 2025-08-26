

'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Crown, ArrowRight, X } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { pricingConfig } from '@/lib/pricing-config'

interface UpgradePromptProps {
  title?: string
  description?: string
  variant?: 'banner' | 'card' | 'inline'
  dismissible?: boolean
  benefits?: string[]
  className?: string
}

export default function UpgradePrompt({ 
  title = "Unlock Premium Features",
  description = "Get full contact information, unlimited searches, and detailed results",
  variant = 'card',
  dismissible = false,
  benefits = [
    "Complete contact information (phone, email, address)",
    "Unlimited AI-powered searches",
    "Full resource descriptions",
    "Priority support"
  ],
  className = ""
}: UpgradePromptProps) {
  const { data: session } = useSession() || {}
  const [dismissed, setDismissed] = useState(false)
  
  const userTier = session?.user?.subscriptionTier || 'free'
  const hasFullAccess = pricingConfig.hasAccess(userTier, 'unlimited')
  
  // Don't show for premium users
  if (hasFullAccess || dismissed) return null

  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 ${className}`}>
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <Crown className="w-5 h-5 text-yellow-300" />
            <div>
              <span className="font-medium">{title}</span>
              <span className="hidden sm:inline ml-2 opacity-90">{description}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/checkout?plan=premium">
              <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                Upgrade Now
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            {dismissible && (
              <Button size="sm" variant="ghost" onClick={() => setDismissed(true)} className="text-white hover:bg-white/20">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200 ${className}`}>
        <Crown className="w-5 h-5 text-blue-600" />
        <div className="flex-1">
          <span className="text-sm font-medium text-blue-900">{title}</span>
          <p className="text-xs text-blue-700">{description}</p>
        </div>
        <Link href="/checkout?plan=premium">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
            Upgrade
          </Button>
        </Link>
      </div>
    )
  }

  // Default card variant
  return (
    <Card className={`border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 ${className}`}>
      <CardContent className="p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
            <Crown className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 mb-4">
          {description}
        </p>
        
        <div className="space-y-2 mb-4 text-left">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0"></div>
              {benefit}
            </div>
          ))}
        </div>
        
        <div className="space-y-3">
          <Link href="/checkout?plan=premium">
            <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          
          <div className="text-xs text-gray-500">
            Starting at $10/month • Cancel anytime
          </div>
        </div>
        
        {dismissible && (
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setDismissed(true)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

