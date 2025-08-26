
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Crown, Lock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { pricingConfig } from '@/lib/pricing-config'

interface PremiumGateProps {
  userTier?: string
  children: React.ReactNode
  fallback?: React.ReactNode
  requiredAccess?: 'basic' | 'premium' | 'unlimited'
  showUpgrade?: boolean
}

export default function PremiumGate({ 
  userTier = 'free', 
  children, 
  fallback,
  requiredAccess = 'premium',
  showUpgrade = true 
}: PremiumGateProps) {
  const hasAccess = pricingConfig.hasAccess(userTier, requiredAccess)

  if (hasAccess) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  if (!showUpgrade) {
    return null
  }

  return (
    <Card className="border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardContent className="p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
            <Crown className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Premium Feature
        </h3>
        <p className="text-gray-600 mb-4">
          Upgrade to Premium to unlock complete search results with contact information and unlimited access.
        </p>
        
        <div className="space-y-3">
          <Link href="/dashboard/settings">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Button>
          </Link>
          
          <div className="text-xs text-gray-500">
            Get unlimited searches, full contact info, and more
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Component to show limited vs full resource information
interface ResourceDisplayProps {
  resource: any
  userTier?: string
  showPreview?: boolean
}

export function ResourceDisplay({ resource, userTier = 'free', showPreview = true }: ResourceDisplayProps) {
  const hasFullAccess = pricingConfig.hasAccess(userTier, 'unlimited')
  
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold leading-tight">
            {resource.title}
          </CardTitle>
          {!hasFullAccess && (
            <Badge variant="outline" className="text-xs">
              <Lock className="w-3 h-3 mr-1" />
              Limited
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-gray-600 text-sm">
          {hasFullAccess 
            ? resource.description 
            : `${resource.description?.substring(0, 150)}${resource.description?.length > 150 ? '...' : ''}`
          }
        </p>
        
        {hasFullAccess ? (
          // Full Information for Premium Users
          <div className="space-y-3">
            {resource.website && (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Website:</span>
                <a 
                  href={resource.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {resource.website}
                </a>
              </div>
            )}
            
            {resource.phone && (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Phone:</span>
                <a href={`tel:${resource.phone}`} className="text-blue-600">
                  {resource.phone}
                </a>
              </div>
            )}
            
            {resource.contactEmail && (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Email:</span>
                <a href={`mailto:${resource.contactEmail}`} className="text-blue-600">
                  {resource.contactEmail}
                </a>
              </div>
            )}
            
            {resource.address && (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Address:</span>
                <span className="text-gray-600">
                  {resource.address}, {resource.city}, {resource.state} {resource.zipCode}
                </span>
              </div>
            )}
          </div>
        ) : showPreview ? (
          // Limited Preview for Free Users
          <PremiumGate userTier={userTier} showUpgrade={false}>
            <div />
          </PremiumGate>
        ) : null}
        
        {!hasFullAccess && (
          <div className="pt-4 border-t">
            <div className="text-center space-y-2">
              <p className="text-xs text-gray-500">
                <Lock className="w-3 h-3 inline mr-1" />
                Contact information and full details available with Premium
              </p>
              <Link href="/dashboard/settings">
                <Button size="sm" variant="outline" className="text-xs">
                  Upgrade for Full Access
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Helper function to filter search results based on user tier
export function filterSearchResults(results: any[], userTier: string = 'free', limit?: number) {
  const hasFullAccess = pricingConfig.hasAccess(userTier, 'unlimited')
  
  if (hasFullAccess) {
    return results
  }
  
  // For free users, limit results and hide contact information
  const limitedResults = results.slice(0, limit || 3).map(resource => ({
    ...resource,
    // Remove contact information for free users
    website: null,
    phone: null,
    contactEmail: null,
    address: null,
    // Truncate description
    description: resource.description?.substring(0, 200) + (resource.description?.length > 200 ? '...' : '')
  }))
  
  return limitedResults
}
