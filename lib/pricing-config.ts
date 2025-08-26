
// Pricing configuration that can be updated from admin panel
export interface PricingPlan {
  id: string
  name: string
  price: number
  period: string
  stripePriceId: string
  features: string[]
  popular?: boolean
  description: string
  maxSavedResources: number
  maxAISearches: number
  accessLevel: 'basic' | 'premium' | 'unlimited'
}

// Default pricing configuration - can be overridden by admin settings
const DEFAULT_PRICING: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free Plan',
    price: 0,
    period: 'forever',
    stripePriceId: '',
    description: 'Basic search access with limited results',
    maxSavedResources: 5,
    maxAISearches: 5,
    accessLevel: 'basic',
    features: [
      'Basic search functionality',
      'Limited search results preview',
      'Save up to 5 resources',
      'Email support',
      'Basic career guidance',
      '5 AI searches per month'
    ]
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    price: 5.99,
    period: 'month',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM || 'price_premium_PLACEHOLDER',
    popular: true,
    description: 'Full access with complete contact information and unlimited searches',
    maxSavedResources: -1, // unlimited
    maxAISearches: -1, // unlimited
    accessLevel: 'unlimited',
    features: [
      'Unlimited everything',
      'Complete contact information',
      'Website links and phone numbers',
      'Unlimited saved resources',
      'Advanced filters & sorting',
      'Priority phone & email support',
      'AI-powered recommendations',
      'Weekly career insights',
      'Industry-specific resources',
      'Voice search & commands',
      'Personal career coach chat',
      'Custom resource alerts',
      'Advanced analytics',
      'Export functionality'
    ]
  }
]

// Pricing configuration manager
class PricingConfigManager {
  private static instance: PricingConfigManager
  private plans: PricingPlan[] = DEFAULT_PRICING

  private constructor() {}

  static getInstance(): PricingConfigManager {
    if (!PricingConfigManager.instance) {
      PricingConfigManager.instance = new PricingConfigManager()
    }
    return PricingConfigManager.instance
  }

  // Get current pricing plans
  getPlans(): PricingPlan[] {
    return this.plans
  }

  // Get plan by ID
  getPlan(id: string): PricingPlan | undefined {
    return this.plans.find(plan => plan.id === id)
  }

  // Update pricing (admin function)
  updatePlan(planId: string, updates: Partial<PricingPlan>): boolean {
    const planIndex = this.plans.findIndex(plan => plan.id === planId)
    if (planIndex === -1) return false

    this.plans[planIndex] = { ...this.plans[planIndex], ...updates }
    return true
  }

  // Get pricing for display (with proper formatting)
  getFormattedPrice(planId: string): string {
    const plan = this.getPlan(planId)
    if (!plan) return '$0'
    
    if (plan.price === 0) return 'Free'
    return `$${plan.price.toFixed(2)}`
  }

  // Check if user has access to feature based on their plan
  hasAccess(userTier: string, requiredAccess: 'basic' | 'premium' | 'unlimited'): boolean {
    const userPlan = this.getPlan(userTier || 'free')
    if (!userPlan) return false

    const accessLevels = ['basic', 'premium', 'unlimited']
    const userLevel = accessLevels.indexOf(userPlan.accessLevel)
    const requiredLevel = accessLevels.indexOf(requiredAccess)

    return userLevel >= requiredLevel
  }

  // Get feature comparison for display
  getFeatureComparison(): { free: string[], premium: string[] } {
    const freePlan = this.getPlan('free')
    const premiumPlan = this.getPlan('premium')
    
    return {
      free: freePlan?.features || [],
      premium: premiumPlan?.features || []
    }
  }
}

export const pricingConfig = PricingConfigManager.getInstance()
export { DEFAULT_PRICING }
