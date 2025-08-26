
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Crown, Check, CreditCard, Zap, Shield, Star } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { pricingConfig } from '@/lib/pricing-config'
import { loadStripe } from '@stripe/stripe-js'
import { toast } from 'sonner'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function PricingPage() {
  const [isLoading, setIsLoading] = useState(false)
  const plans = pricingConfig.getPlans()

  const handleUpgrade = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM 
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      const stripe = await stripePromise
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({
          sessionId: data.id
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
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 mb-16"
        >
          <Badge className="bg-blue-100 text-blue-800 mb-4">
            <Zap className="w-3 h-3 mr-1" />
            Special Launch Pricing
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
            Choose Your Career Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start with our free plan or unlock full access with Premium at just $5.99/month
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className={plan.popular ? 'lg:scale-105' : ''}
            >
              <Card className={`relative h-full ${
                plan.popular ? 'ring-2 ring-blue-500 shadow-2xl' : 'shadow-lg'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className={`text-center ${plan.popular ? 'pt-8' : 'pt-6'}`}>
                  <div className="flex justify-center mb-4">
                    {plan.id === 'premium' ? (
                      <div className="p-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
                        <Crown className="w-8 h-8 text-white" />
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-100 rounded-full">
                        <Check className="w-8 h-8 text-gray-600" />
                      </div>
                    )}
                  </div>
                  
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <p className="text-gray-600 mt-2 mb-4">{plan.description}</p>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-5xl font-bold text-gray-900">
                        {pricingConfig.getFormattedPrice(plan.id)}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-gray-600 text-lg">/{plan.period}</span>
                      )}
                    </div>
                    {plan.id === 'premium' && (
                      <p className="text-sm text-green-600 font-medium mt-2">
                        Limited time offer!
                      </p>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-3">
                    {plan.id === 'free' ? (
                      <Link href="/auth/signup?plan=free" className="block">
                        <Button variant="outline" className="w-full h-12" size="lg">
                          Get Started Free
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        onClick={handleUpgrade}
                        disabled={isLoading}
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        size="lg"
                        id="upgrade-button"
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Processing...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5" />
                            Proceed to Payment
                          </div>
                        )}
                      </Button>
                    )}
                    
                    <div className="text-center">
                      <Link href="/auth/signin" className="text-sm text-gray-600 hover:text-gray-900 hover:underline">
                        Already have an account? Sign in
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Trust Indicators */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-6 bg-white rounded-full px-8 py-4 shadow-lg">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium">Secure Payment</span>
            </div>
            <div className="w-px h-6 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium">All Cards Accepted</span>
            </div>
            <div className="w-px h-6 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-medium">Cancel Anytime</span>
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold mb-2">Can I cancel anytime?</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Yes, you can cancel your subscription at any time. You'll retain access until the end of your billing period.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    We accept all major credit cards through our secure payment processor, Stripe.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Is there a free trial?</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Our free plan gives you access to basic features. Upgrade to Premium for complete access.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">How secure is my data?</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    We use industry-standard encryption and security measures to protect your data and payment information.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
