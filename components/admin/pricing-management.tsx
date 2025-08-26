
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Crown, DollarSign, Save, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { pricingConfig, type PricingPlan } from '@/lib/pricing-config'

interface PricingManagementProps {
  isAdmin?: boolean
}

export default function PricingManagement({ isAdmin = false }: PricingManagementProps) {
  const [plans, setPlans] = useState<PricingPlan[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setPlans([...pricingConfig.getPlans()])
  }, [])

  const handlePriceChange = (planId: string, newPrice: number) => {
    setPlans(prevPlans => 
      prevPlans.map(plan => 
        plan.id === planId ? { ...plan, price: newPrice } : plan
      )
    )
    setHasChanges(true)
  }

  const handleFeatureChange = (planId: string, features: string[]) => {
    setPlans(prevPlans => 
      prevPlans.map(plan => 
        plan.id === planId ? { ...plan, features } : plan
      )
    )
    setHasChanges(true)
  }

  const handlePopularToggle = (planId: string, popular: boolean) => {
    setPlans(prevPlans => 
      prevPlans.map(plan => 
        plan.id === planId ? { ...plan, popular } : plan
      )
    )
    setHasChanges(true)
  }

  const handleDescriptionChange = (planId: string, description: string) => {
    setPlans(prevPlans => 
      prevPlans.map(plan => 
        plan.id === planId ? { ...plan, description } : plan
      )
    )
    setHasChanges(true)
  }

  const savePricingChanges = async () => {
    setIsLoading(true)
    try {
      // Update each plan in the pricing config
      plans.forEach(plan => {
        pricingConfig.updatePlan(plan.id, plan)
      })

      // In a real implementation, you would also save to a database
      // await savePricingToDatabase(plans)
      
      toast.success('Pricing configuration updated successfully!')
      setHasChanges(false)
    } catch (error) {
      toast.error('Failed to update pricing configuration')
    } finally {
      setIsLoading(false)
    }
  }

  const resetToDefaults = () => {
    if (confirm('Are you sure you want to reset all pricing to default values? This will lose all custom changes.')) {
      setPlans([...pricingConfig.getPlans()])
      setHasChanges(true)
    }
  }

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Pricing Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Admin access required to manage pricing.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Pricing Configuration Management
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetToDefaults}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset to Defaults
              </Button>
              <Button 
                onClick={savePricingChanges}
                disabled={!hasChanges || isLoading}
                size="sm"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">
            Adjust pricing plans that will be displayed throughout the application. 
            Changes will be reflected immediately after saving.
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className={`${plan.popular ? 'ring-2 ring-blue-500' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {plan.id === 'premium' ? (
                    <Crown className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <DollarSign className="w-5 h-5 text-gray-400" />
                  )}
                  {plan.name}
                </CardTitle>
                {plan.id !== 'free' && (
                  <div className="flex items-center space-x-2">
                    <Label htmlFor={`popular-${plan.id}`} className="text-xs">Popular</Label>
                    <Switch
                      id={`popular-${plan.id}`}
                      checked={plan.popular || false}
                      onCheckedChange={(checked) => handlePopularToggle(plan.id, checked)}
                    />
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Price Input */}
              <div className="space-y-2">
                <Label htmlFor={`price-${plan.id}`}>
                  Price ({plan.period})
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id={`price-${plan.id}`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={plan.price}
                    onChange={(e) => handlePriceChange(plan.id, parseFloat(e.target.value) || 0)}
                    className="pl-10"
                    disabled={plan.id === 'free'}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor={`description-${plan.id}`}>Description</Label>
                <Textarea
                  id={`description-${plan.id}`}
                  value={plan.description}
                  onChange={(e) => handleDescriptionChange(plan.id, e.target.value)}
                  placeholder="Plan description..."
                  rows={2}
                />
              </div>

              {/* Features */}
              <div className="space-y-2">
                <Label htmlFor={`features-${plan.id}`}>Features (one per line)</Label>
                <Textarea
                  id={`features-${plan.id}`}
                  value={plan.features.join('\n')}
                  onChange={(e) => handleFeatureChange(plan.id, e.target.value.split('\n').filter(f => f.trim()))}
                  placeholder="Enter features, one per line..."
                  rows={6}
                />
              </div>

              {/* Preview */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium mb-2">Preview</h4>
                <div className="text-2xl font-bold mb-1">
                  {plan.price === 0 ? 'Free' : `$${plan.price.toFixed(2)}`}
                  {plan.price > 0 && <span className="text-sm font-normal text-gray-600">/{plan.period}</span>}
                </div>
                <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
                <ul className="text-xs space-y-1">
                  {plan.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-center gap-1">
                      <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                      {feature}
                    </li>
                  ))}
                  {plan.features.length > 3 && (
                    <li className="text-gray-500">+{plan.features.length - 3} more features</li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Current Pricing Display */}
      <Card>
        <CardHeader>
          <CardTitle>Current Live Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {pricingConfig.getPlans().map((livePlan) => (
              <div key={livePlan.id} className="text-center p-4 border rounded-lg">
                <h4 className="font-medium">{livePlan.name}</h4>
                <div className="text-xl font-bold text-blue-600">
                  {pricingConfig.getFormattedPrice(livePlan.id)}
                  {livePlan.price > 0 && <span className="text-sm">/{livePlan.period}</span>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
