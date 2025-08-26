
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Briefcase, ArrowRight, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

const interests = [
  'Software Engineering', 'Healthcare', 'Finance', 'Education', 'Marketing',
  'Sales', 'Construction', 'Manufacturing', 'Retail', 'Hospitality',
  'Small Business', 'Entrepreneurship', 'Remote Work', 'Freelancing',
  'Career Change', 'Leadership', 'Project Management', 'Data Analysis'
]

export default function OnboardingPage() {
  const { data: session, status } = useSession() || {}
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [location, setLocation] = useState('')
  const [isCompleting, setIsCompleting] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  if (status === 'loading' || !status) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session) {
    return null
  }

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev =>
      prev?.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...(prev || []), interest]
    )
  }

  const handleComplete = async () => {
    setIsCompleting(true)
    
    try {
      // Save user interests and updated location
      if (selectedInterests.length > 0) {
        const interestPromises = selectedInterests.map(interest =>
          fetch('/api/user/interests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ interest, priority: 3 }),
          })
        )
        await Promise.all(interestPromises)
      }

      if (location) {
        await fetch('/api/user/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ location }),
        })
      }

      toast.success('Welcome to CareerPath Pro! 🎉')
      router.push('/dashboard')
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsCompleting(false)
    }
  }

  const progress = (step / 3) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">CareerPath Pro</h1>
          </div>
          <Progress value={progress} className="w-full max-w-md mx-auto" />
          <p className="text-gray-600 mt-4">Step {step} of 3</p>
        </div>

        <Card className="shadow-xl border-0">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <CardHeader>
                <CardTitle className="text-2xl text-center">Welcome aboard, {session.user?.name}! 👋</CardTitle>
                <CardDescription className="text-center text-lg">
                  Let&apos;s personalize your experience to help you find the perfect career opportunities.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">You&apos;re all set!</h3>
                  <p className="text-gray-600">
                    Your account has been created successfully. Now let&apos;s customize your experience to provide the most relevant career guidance.
                  </p>
                </div>
                <Button onClick={() => setStep(2)} className="w-full bg-blue-600 hover:bg-blue-700">
                  Let&apos;s Get Started
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <CardHeader>
                <CardTitle className="text-2xl text-center">What interests you?</CardTitle>
                <CardDescription className="text-center text-lg">
                  Select areas that match your career goals and interests. This helps us provide better recommendations.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {interests.map((interest) => (
                    <div
                      key={interest}
                      className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleInterestToggle(interest)}
                    >
                      <Checkbox
                        id={interest}
                        checked={selectedInterests?.includes(interest) || false}
                        onChange={() => handleInterestToggle(interest)}
                      />
                      <Label htmlFor={interest} className="text-sm cursor-pointer">
                        {interest}
                      </Label>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={() => setStep(3)} className="flex-1 bg-blue-600 hover:bg-blue-700">
                    Continue
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <CardHeader>
                <CardTitle className="text-2xl text-center">Where are you located?</CardTitle>
                <CardDescription className="text-center text-lg">
                  Help us find local opportunities and relevant resources in your area.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="location">Location (Optional)</Label>
                  <Input
                    id="location"
                    type="text"
                    placeholder="e.g., New York, NY or San Francisco, CA"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="text-center"
                  />
                  <p className="text-sm text-gray-500 text-center">
                    This helps us show you location-specific opportunities and local resources.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                    Back
                  </Button>
                  <Button 
                    onClick={handleComplete}
                    disabled={isCompleting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isCompleting ? 'Setting up...' : 'Complete Setup'}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </motion.div>
          )}
        </Card>
      </div>
    </div>
  )
}
