
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Crown, Check, Zap } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { pricingConfig } from '@/lib/pricing-config'

export default function PricingSection() {
  const plans = pricingConfig.getPlans()

  return (
    <section id="pricing" className="py-16 bg-gray-50">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-4 mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start with our free plan or unlock full access with Premium
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <Card className={`relative h-full ${
                plan.popular ? 'ring-2 ring-blue-500 shadow-xl scale-105' : 'shadow-lg'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white">
                      <Zap className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-8">
                  <div className="flex justify-center mb-4">
                    {plan.id === 'premium' ? (
                      <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
                        <Crown className="w-8 h-8 text-white" />
                      </div>
                    ) : (
                      <div className="p-3 bg-gray-100 rounded-full">
                        <Check className="w-8 h-8 text-gray-600" />
                      </div>
                    )}
                  </div>
                  
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <p className="text-gray-600 mt-2">{plan.description}</p>
                  
                  <div className="mt-6">
                    <span className="text-4xl font-bold">
                      {pricingConfig.getFormattedPrice(plan.id)}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-600">/{plan.period}</span>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-3">
                    {plan.id === 'free' ? (
                      <Link href="/auth/signup?plan=free" className="block">
                        <Button className="w-full bg-gray-600 hover:bg-gray-700">
                          Select Free Plan
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/auth/signup?plan=premium" className="block">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          Upgrade to Premium
                        </Button>
                      </Link>
                    )}
                    
                    <Link href="/auth/signin" className="block">
                      <Button variant="outline" className="w-full">
                        Already have an account? Sign In
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Feature Comparison */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16"
        >
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-center mb-8">What&apos;s the difference?</h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-gray-600" />
                  </div>
                  Free Plan
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Basic search with limited preview results</li>
                  <li>• Save up to 5 resources</li>
                  <li>• 5 AI searches per month</li>
                  <li>• No contact information displayed</li>
                  <li>• Email support only</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Crown className="w-4 h-4 text-white" />
                  </div>
                  Premium Plan
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• <strong>Complete search results with full details</strong></li>
                  <li>• <strong>Website links and contact information</strong></li>
                  <li>• <strong>Unlimited searches and saved resources</strong></li>
                  <li>• Voice search and AI chat assistance</li>
                  <li>• Priority support with phone access</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
