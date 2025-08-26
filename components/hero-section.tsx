
'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Search, Users, TrendingUp, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function HeroSection() {
  return (
    <section className="relative py-20 lg:py-32">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Find Your Perfect
                <span className="text-blue-600 block">Career Path</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Discover career opportunities and business resources tailored to your goals with our AI-powered guidance platform. Get personalized recommendations from thousands of verified resources.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white group">
                  Start Your Journey
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex gap-8 pt-8"
            >
              <div>
                <div className="text-2xl font-bold text-gray-900">1000+</div>
                <div className="text-gray-600">Career Resources</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">50+</div>
                <div className="text-gray-600">Industries Covered</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">AI-Powered</div>
                <div className="text-gray-600">Matching System</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Feature Cards */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <Card className="p-6 shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Search className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Smart Search</h3>
                    <p className="text-gray-600">AI understands your questions and finds perfect matches</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Expert Resources</h3>
                    <p className="text-gray-600">Curated database of trusted career and business resources</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Personalized Guidance</h3>
                    <p className="text-gray-600">Tailored recommendations based on your interests and goals</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
