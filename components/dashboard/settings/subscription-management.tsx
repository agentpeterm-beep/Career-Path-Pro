
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Crown, CreditCard, Calendar, Star, Check, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { loadStripe } from '@stripe/stripe-js'
import { pricingConfig, type PricingPlan } from '@/lib/pricing-config'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface UserProfile {
  subscriptionTier: string
  subscriptionExpires?: string
  stripeCustomerId?: string
}



interface SubscriptionManagementProps {
  userProfile: UserProfile
  onSubscriptionUpdate: () => void
}

export default function SubscriptionManagement({ userProfile, onSubscriptionUpdate }: SubscriptionManagementProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(userProfile.subscriptionTier)
  const pricingPlans = pricingConfig.getPlans()

  const handleUpgrade = async (stripePriceId: string) => {
    if (!stripePriceId) {
      toast.error('Invalid pricing plan')
      return
    }

    setIsLoading(true)

    try {
      // Create Stripe Checkout session
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: stripePriceId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      const stripe = await stripePromise
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({
          sessionId: data.sessionId
        })

        if (error) {
          throw new Error(error.message)
        }
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Failed to process payment. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.')) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        toast.success('Subscription cancelled. You will retain access until your current billing period ends.')
        onSubscriptionUpdate()
      } else {
        throw new Error('Failed to cancel subscription')
      }
    } catch (error) {
      toast.error('Failed to cancel subscription. Please contact support.')
    } finally {
      setIsLoading(false)
    }
  }

  const openCustomerPortal = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const data = await response.json()
      if (response.ok) {
        window.open(data.url, '_blank')
      } else {
        throw new Error(data.error || 'Failed to open customer portal')
      }
    } catch (error) {
      toast.error('Failed to open billing portal. Please contact support.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Current Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                userProfile.subscriptionTier === 'premium' 
                  ? 'bg-yellow-100 text-yellow-600' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {userProfile.subscriptionTier === 'premium' ? (
                  <Crown className="w-5 h-5" />
                ) : (
                  <Star className="w-5 h-5" />
                )}
              </div>
              <div>
                <p className="font-medium">
                  {pricingConfig.getPlan(userProfile.subscriptionTier)?.name || 'Free Plan'}
                </p>
                <p className="text-sm text-gray-600">
                  {pricingConfig.getFormattedPrice(userProfile.subscriptionTier)}/{pricingConfig.getPlan(userProfile.subscriptionTier)?.period || 'forever'}
                </p>
                {userProfile.subscriptionExpires && (
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Expires: {new Date(userProfile.subscriptionExpires).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <Badge className={
                userProfile.subscriptionTier === 'premium' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-gray-100 text-gray-700'
              }>
                {userProfile.subscriptionTier === 'premium' ? 'Active' : 'Free'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      <div className="grid md:grid-cols-3 gap-6">
        {pricingPlans.map((plan) => (
          <Card key={plan.id} className={`relative ${
            plan.popular ? 'ring-2 ring-blue-500 shadow-lg' : ''
          }`}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-600 text-white">
                  <Zap className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                {plan.id === 'premium' ? (
                  <Crown className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Star className="w-5 h-5 text-gray-400" />
                )}
                {plan.name}
              </CardTitle>
              <div className="mt-4">
                <span className="text-3xl font-bold">
                  {pricingConfig.getFormattedPrice(plan.id)}
                </span>
                {plan.price > 0 && (
                  <span className="text-gray-600">/{plan.period}</span>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {userProfile.subscriptionTier === plan.id ? (
                <div className="space-y-2">
                  <Button disabled className="w-full">
                    Current Plan
                  </Button>
                  {plan.id === 'premium' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelSubscription}
                      className="w-full text-xs"
                    >
                      Cancel Subscription
                    </Button>
                  )}
                </div>
              ) : plan.id !== 'free' ? (
                <Button
                  onClick={() => handleUpgrade(plan.stripePriceId)}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {isLoading ? 'Processing...' : 'Upgrade to Premium'}
                </Button>
              ) : (
                <Button variant="outline" disabled className="w-full">
                  Current Plan
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Billing Management */}
      {userProfile.subscriptionTier === 'premium' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Billing Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Payment Method</p>
                  <p className="text-xs text-gray-600">•••• •••• •••• 1234</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={openCustomerPortal}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Update Card'}
              </Button>
            </div>
            <div className="pt-4 border-t">
              <div className="flex flex-col gap-3">
                <Button 
                  variant="outline" 
                  onClick={openCustomerPortal}
                  disabled={isLoading}
                  className="justify-start"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {isLoading ? 'Loading...' : 'View Billing History & Manage Subscription'}
                </Button>
                <p className="text-xs text-gray-500">
                  Access your complete billing history, download invoices, update payment methods, and manage your subscription settings.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
