
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Search, 
  Brain, 
  BookOpen, 
  Users, 
  MapPin, 
  Shield,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Matching',
    description: 'Advanced natural language processing understands your career questions and matches you with relevant resources.',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Search,
    title: 'Smart Resource Discovery',
    description: 'Find job boards, training programs, business resources, and certification opportunities tailored to your needs.',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: BookOpen,
    title: 'Comprehensive Database',
    description: 'Access thousands of verified career and business resources across all industries and experience levels.',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    icon: Users,
    title: 'Expert Curation',
    description: 'Every resource is carefully vetted and includes contact information, descriptions, and relevant tags.',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    icon: MapPin,
    title: 'Location-Based Results',
    description: 'Find local opportunities and national resources relevant to your geographic preferences.',
    gradient: 'from-indigo-500 to-blue-500'
  },
  {
    icon: Shield,
    title: 'Personalized Experience',
    description: 'Save favorite resources, track your interests, and get recommendations that evolve with your career.',
    gradient: 'from-teal-500 to-green-500'
  }
]

const howItWorks = [
  {
    step: '1',
    title: 'Ask Your Question',
    description: 'Type your career or business question in natural language',
    icon: '💬'
  },
  {
    step: '2',
    title: 'AI Analysis',
    description: 'Our AI understands your intent and searches our resource database',
    icon: '🧠'
  },
  {
    step: '3',
    title: 'Get Results',
    description: 'Receive personalized recommendations with contact details and next steps',
    icon: '✨'
  }
]

export default function FeaturesSection() {
  return (
    <div className="space-y-24 py-16">
      {/* Features Grid */}
      <section id="features" className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-4 mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Powerful Features
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
            Everything you need for career success
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform combines cutting-edge AI technology with comprehensive career resources to guide you toward your perfect opportunity.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-gray-50 py-16">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-4 mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              How it works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get personalized career guidance in three simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {howItWorks.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center"
              >
                <div className="relative">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl mb-4 mx-auto">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center"
          >
            <Link href="/auth/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white group">
                Start Your Career Journey
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
