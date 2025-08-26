
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Mail, 
  MapPin, 
  Briefcase, 
  TrendingUp,
  Crown,
  Calendar,
  Settings,
  Star,
  Target,
  X
} from 'lucide-react'
import { toast } from 'sonner'

interface UserProfile {
  id: string
  name?: string
  email: string
  location?: string
  industry?: string
  experienceLevel?: string
  subscriptionTier: string
  subscriptionExpires?: string
  createdAt: string
}

interface UserInterest {
  id: string
  interest: string
  priority: number
  createdAt: string
}

export default function ProfileContent() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [interests, setInterests] = useState<UserInterest[]>([])
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isEditingInterests, setIsEditingInterests] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    industry: '',
    experienceLevel: ''
  })

  useEffect(() => {
    fetchProfile()
    fetchInterests()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      const data = await response.json()
      
      if (response.ok) {
        setProfile(data.user)
        setFormData({
          name: data.user?.name || '',
          location: data.user?.location || '',
          industry: data.user?.industry || '',
          experienceLevel: data.user?.experienceLevel || ''
        })
      }
    } catch (error) {
      toast.error('Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchInterests = async () => {
    try {
      const response = await fetch('/api/user/interests')
      const data = await response.json()
      
      if (response.ok) {
        setInterests(data.interests || [])
      }
    } catch (error) {
      console.error('Failed to load interests')
    }
  }

  const handleUpdateProfile = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.user)
        setIsEditingProfile(false)
        toast.success('Profile updated successfully!')
      } else {
        toast.error('Failed to update profile')
      }
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  const handleRemoveInterest = async (interestId: string) => {
    try {
      const response = await fetch(`/api/user/interests?id=${interestId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setInterests(prev => prev.filter(interest => interest.id !== interestId))
        toast.success('Interest removed')
      }
    } catch (error) {
      toast.error('Failed to remove interest')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Settings</h1>
        <p className="text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Basic Information
              </CardTitle>
              <Button
                variant={isEditingProfile ? 'outline' : 'default'}
                size="sm"
                onClick={() => {
                  if (isEditingProfile) {
                    handleUpdateProfile()
                  } else {
                    setIsEditingProfile(true)
                  }
                }}
              >
                <Settings className="w-4 h-4 mr-2" />
                {isEditingProfile ? 'Save Changes' : 'Edit Profile'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isEditingProfile ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{profile?.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{profile?.name || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{profile?.location || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{profile?.industry || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{profile?.experienceLevel || 'Not provided'}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={profile?.email} disabled className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g., New York, NY"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Select value={formData.industry} onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="construction">Construction</SelectItem>
                        <SelectItem value="hospitality">Hospitality</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Experience Level</Label>
                    <Select value={formData.experienceLevel} onValueChange={(value) => setFormData(prev => ({ ...prev, experienceLevel: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry-level">Entry Level</SelectItem>
                        <SelectItem value="mid-level">Mid Level</SelectItem>
                        <SelectItem value="senior-level">Senior Level</SelectItem>
                        <SelectItem value="executive">Executive</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="career-change">Career Change</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleUpdateProfile} className="bg-blue-600 hover:bg-blue-700">
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interests */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Career Interests
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingInterests(!isEditingInterests)}
              >
                {isEditingInterests ? 'Done' : 'Manage'}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <Badge
                    key={interest.id}
                    variant="secondary"
                    className="flex items-center gap-1 text-sm py-1 px-3"
                  >
                    {interest.interest}
                    {isEditingInterests && (
                      <button
                        onClick={() => handleRemoveInterest(interest.id)}
                        className="ml-1 text-gray-500 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </Badge>
                ))}
                {interests.length === 0 && (
                  <p className="text-gray-600 text-sm">
                    No interests added yet. Complete searches to help us learn your preferences.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                  profile?.subscriptionTier === 'premium' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {profile?.subscriptionTier === 'premium' ? (
                    <>
                      <Star className="w-4 h-4" />
                      Premium Plan
                    </>
                  ) : (
                    <>
                      Free Plan
                    </>
                  )}
                </div>
              </div>

              {profile?.subscriptionTier === 'premium' && profile?.subscriptionExpires && (
                <div className="text-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Expires: {new Date(profile.subscriptionExpires).toLocaleDateString()}
                </div>
              )}

              {profile?.subscriptionTier === 'free' && (
                <div className="space-y-3">
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>✓ Basic search functionality</p>
                    <p>✓ Save up to 10 resources</p>
                    <p>✗ Advanced filters</p>
                    <p>✗ Priority support</p>
                  </div>
                  <Button size="sm" className="w-full bg-yellow-600 hover:bg-yellow-700">
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade to Premium
                  </Button>
                </div>
              )}

              {profile?.subscriptionTier === 'premium' && (
                <div className="text-sm text-gray-600 space-y-2">
                  <p>✓ Unlimited searches</p>
                  <p>✓ Unlimited saved resources</p>
                  <p>✓ Advanced filters</p>
                  <p>✓ Priority support</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Account Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Member since</span>
                <span className="font-medium">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Saved resources</span>
                <span className="font-medium">{interests.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
