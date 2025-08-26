
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  User, 
  Bell, 
  CreditCard, 
  MessageCircle, 
  Shield, 
  LogOut,
  ExternalLink,
  FileText
} from 'lucide-react'
import { toast } from 'sonner'
import ChangePasswordForm from './change-password-form'
import NotificationPreferences from './notification-preferences'
import ContactSupport from './contact-support'
import SubscriptionManagement from './subscription-management'

interface UserProfile {
  id: string
  name?: string
  email: string
  location?: string
  industry?: string
  experienceLevel?: string
  subscriptionTier: string
  subscriptionExpires?: string
  stripeCustomerId?: string
  createdAt: string
}

export default function SettingsContent() {
  const { data: session } = useSession() || {}
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      const data = await response.json()
      
      if (response.ok) {
        setProfile(data.user)
      }
    } catch (error) {
      toast.error('Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false })
      toast.success('Logged out successfully')
      router.push('/')
    } catch (error) {
      toast.error('Failed to log out')
    }
  }

  const handleViewPrivacyPolicy = () => {
    // In a real app, you would have a privacy policy page
    window.open('/privacy-policy', '_blank')
  }

  const handleViewTerms = () => {
    // In a real app, you would have a terms of service page
    window.open('/terms-of-service', '_blank')
  }

  if (isLoading || !profile) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Settings & Support
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your account preferences and get help when you need it
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={
            profile.subscriptionTier === 'premium' 
              ? 'bg-yellow-100 text-yellow-800' 
              : 'bg-gray-100 text-gray-700'
          }>
            {profile.subscriptionTier === 'premium' ? 'Premium' : 'Free'} Plan
          </Badge>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="support" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Support
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Account
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-4">
                <p className="text-gray-600">
                  To edit your profile information, visit the{' '}
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-blue-600"
                    onClick={() => router.push('/dashboard/profile')}
                  >
                    Profile page
                  </Button>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <NotificationPreferences />
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription">
          <SubscriptionManagement 
            userProfile={profile} 
            onSubscriptionUpdate={fetchProfile}
          />
        </TabsContent>

        {/* Support Tab */}
        <TabsContent value="support">
          <ContactSupport />
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="space-y-6">
            <ChangePasswordForm />
            
            {/* Additional Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Account Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Coming Soon
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Login History</p>
                    <p className="text-sm text-gray-600">View recent login activity</p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    View History
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account">
          <div className="space-y-6">
            {/* Account Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LogOut className="w-5 h-5" />
                  Account Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Log Out</p>
                    <p className="text-sm text-gray-600">Sign out of your account on this device</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleLogout}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log Out
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Delete Account</p>
                    <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Legal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Legal & Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={handleViewPrivacyPolicy}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Privacy Policy
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={handleViewTerms}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Terms of Service
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </Button>
                
                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500 text-center">
                    Account created: {new Date(profile.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
