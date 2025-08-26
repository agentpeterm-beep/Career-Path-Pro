
'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import SearchInterface from '@/components/dashboard/search-interface'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Briefcase, 
  TrendingUp, 
  Users, 
  BookOpen,
  Search,
  Sparkles,
  ArrowRight,
  Building2
} from 'lucide-react'
import UpgradePrompt from '@/components/upgrade-prompt'
import Link from 'next/link'
import { pricingConfig } from '@/lib/pricing-config'

const popularQuestions = [
  {
    question: "How do I find remote software engineering jobs?",
    category: "Technology",
    icon: "💻"
  },
  {
    question: "What are the best resources for starting a small business?",
    category: "Business",
    icon: "🚀"
  },
  {
    question: "How can I transition into healthcare from another field?",
    category: "Healthcare",
    icon: "🏥"
  },
  {
    question: "What certification programs are available for project managers?",
    category: "Professional Development",
    icon: "📋"
  },
  {
    question: "Where can I find apprenticeship programs for electricians?",
    category: "Trade Skills",
    icon: "⚡"
  },
  {
    question: "How do I network effectively in the finance industry?",
    category: "Finance",
    icon: "💰"
  }
]

export default function DashboardContent() {
  const { data: session, status } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  const userTier = session?.user?.subscriptionTier || 'free'
  const hasFullAccess = pricingConfig.hasAccess(userTier, 'unlimited')

  const handleQuestionClick = (question: string) => {
    setSearchQuery(question)
    setShowSearch(true)
  }

  const handleNewSearch = () => {
    setSearchQuery('')
    setShowSearch(true)
  }

  // Handle loading and authentication states
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (showSearch) {
    return (
      <SearchInterface 
        initialQuery={searchQuery}
        onBack={() => setShowSearch(false)}
      />
    )
  }

  return (
      <div className="space-y-8">
        {/* Upgrade Banner for Free Users */}
        {!hasFullAccess && (
          <UpgradePrompt 
            variant="banner" 
            title="Unlock Premium Features" 
            description="Get unlimited searches, complete contact information, and detailed results"
            dismissible
          />
        )}

        {/* Welcome Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
            Welcome back, {session?.user?.name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            What career question can I help you with today? Ask me anything about jobs, training, business opportunities, or career development.
          </p>
        </div>

        {/* Search Options */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* AI Career Search */}
          <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  AI Career Search
                </h2>
                <p className="text-gray-600 mb-6">
                  Ask any career question and get AI-powered guidance with relevant resources.
                </p>
              </div>
              <Button 
                onClick={handleNewSearch}
                size="lg" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white group"
              >
                <Sparkles className="mr-2 w-5 h-5" />
                Start AI Search
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          {/* Contact Search */}
          <Card className="shadow-lg border-0 bg-gradient-to-r from-green-50 to-teal-50">
            <CardContent className="p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Contact Search
                </h2>
                <p className="text-gray-600 mb-6">
                  Find official contact information for businesses, organizations, and government offices.
                </p>
              </div>
              <Link href="/dashboard/contact-search">
                <Button 
                  size="lg" 
                  className="w-full bg-green-600 hover:bg-green-700 text-white group"
                >
                  <Building2 className="mr-2 w-5 h-5" />
                  Find Contacts
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Popular Questions */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Popular Questions</h2>
            <p className="text-gray-600">Get started with these commonly asked career questions</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {popularQuestions.map((item, index) => (
              <Card 
                key={index}
                className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0"
                onClick={() => handleQuestionClick(item.question)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">{item.icon}</div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-1">{item.question}</p>
                      <p className="text-sm text-gray-500">{item.category}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 mt-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Upgrade Prompt for Free Users */}
        {!hasFullAccess && (
          <div className="max-w-2xl mx-auto">
            <UpgradePrompt 
              title="Ready to Unlock Your Full Potential?"
              description="Get unlimited searches, complete contact information, and premium career resources"
              benefits={[
                "Unlimited AI-powered career searches",
                "Full contact information (phone, email, address)",
                "Complete resource descriptions and details",
                "Priority customer support"
              ]}
            />
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">1000+</div>
              <div className="text-sm text-gray-600">Resources Available</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">50+</div>
              <div className="text-sm text-gray-600">Industries Covered</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">AI-Powered</div>
              <div className="text-sm text-gray-600">Smart Matching</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">24/7</div>
              <div className="text-sm text-gray-600">Available Support</div>
            </CardContent>
          </Card>
        </div>
      </div>
  )
}
