
'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Crown, Check, CreditCard, ArrowLeft, Shield, Zap } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { toast } from 'sonner'
import { pricingConfig } from '@/lib/pricing-config'
import Link from 'next/link'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function CheckoutPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session, status } = useSession() || {}
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('premium')
  
  const planId = searchParams.get('plan') || 'premium'
  const plan = pricingConfig.getPlan(planId)
  const userTier = session?.user?.subscriptionTier || 'free'

  useEffect(() => {
    if (planId && pricingConfig.getPlan(planId)) {
      setSelectedPlan(planId)
    }
  }, [planId])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    router.push('/auth/signin?callbackUrl=/checkout')
    return null
  }

  if (!plan || plan.id === 'free') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Plan</h1>
          <p className="text-gray-600 mb-6">The requested plan could not be found.</p>
          <Link href="/dashboard">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleCheckout = async () => {
    if (!plan.stripePriceId) {
      toast.error('Invalid pricing plan')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: plan.stripePriceId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upgrade Your Account</h1>
          <p className="text-gray-600">Choose the plan that best fits your career goals</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Plan Details */}
          <Card className="relative overflow-hidden">
            {plan.popular && (
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-2 text-sm font-medium">
                <Zap className="w-4 h-4 inline mr-1" />
                Most Popular Choice
              </div>
            )}
            
            <CardHeader className={plan.popular ? 'pt-12' : ''}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-blue-600">
                      {pricingConfig.getFormattedPrice(plan.id)}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-600">/{plan.period}</span>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-gray-600">{plan.description}</p>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">What's included:</h4>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      </div>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Checkout Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Complete Your Purchase
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Order Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Order Summary</h4>
                <div className="flex justify-between items-center mb-2">
                  <span>{plan.name}</span>
                  <span className="font-semibold">
                    {pricingConfig.getFormattedPrice(plan.id)}
                    {plan.price > 0 && `/${plan.period}`}
                  </span>
                </div>
                {plan.price > 0 && (
                  <>
                    <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                      <span>Billing</span>
                      <span>Monthly subscription</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between items-center font-semibold">
                        <span>Total today</span>
                        <span>{pricingConfig.getFormattedPrice(plan.id)}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Current Plan Status */}
              {userTier !== 'free' && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Current Plan</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700">
                      {pricingConfig.getPlan(userTier)?.name || 'Unknown Plan'}
                    </span>
                    <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    Your new plan will take effect immediately after payment.
                  </p>
                </div>
              )}

              {/* Security Notice */}
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900">Secure Payment</p>
                  <p className="text-xs text-green-700">
                    Your payment information is processed securely by Stripe. 
                    We never store your card details.
                  </p>
                </div>
              </div>

              {/* Checkout Button */}
              <div className="space-y-4">
                <Button
                  onClick={handleCheckout}
                  disabled={isLoading || userTier === plan.id}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  size="lg"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : userTier === plan.id ? (
                    'Current Plan'
                  ) : (
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Proceed to Payment
                    </div>
                  )}
                </Button>
                
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    By proceeding, you agree to our Terms of Service and Privacy Policy.
                    Cancel anytime.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Can I cancel anytime?</h4>
                <p className="text-sm text-gray-600">
                  Yes, you can cancel your subscription at any time from your account settings. 
                  You'll retain access until the end of your current billing period.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
                <p className="text-sm text-gray-600">
                  We accept all major credit cards and debit cards through our secure 
                  payment processor, Stripe.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Is my data secure?</h4>
                <p className="text-sm text-gray-600">
                  Yes, we use industry-standard encryption and security measures to 
                  protect your data and payment information.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Do you offer refunds?</h4>
                <p className="text-sm text-gray-600">
                  We offer a 30-day money-back guarantee. If you're not satisfied, 
                  contact our support team for a full refund.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading checkout...</p>
        </div>
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  )
}
