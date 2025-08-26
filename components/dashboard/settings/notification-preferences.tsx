
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Bell, Mail, Zap, Calendar } from 'lucide-react'
import { toast } from 'sonner'

interface NotificationSettings {
  emailNotifications: boolean
  marketingEmails: boolean
  weeklyDigest: boolean
  instantAlerts: boolean
}

export default function NotificationPreferences() {
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    marketingEmails: false,
    weeklyDigest: true,
    instantAlerts: false
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchNotificationSettings()
  }, [])

  const fetchNotificationSettings = async () => {
    try {
      const response = await fetch('/api/user/notifications')
      const data = await response.json()
      
      if (response.ok) {
        setSettings(data.notifications)
      }
    } catch (error) {
      toast.error('Failed to load notification settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      const response = await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        toast.success('Notification preferences updated!')
      } else {
        toast.error('Failed to update preferences')
      }
    } catch (error) {
      toast.error('Failed to update preferences')
    } finally {
      setIsSaving(false)
    }
  }

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Mail className="w-4 h-4 text-gray-400" />
              <div className="space-y-1">
                <Label htmlFor="emailNotifications" className="text-sm font-medium">
                  Email Notifications
                </Label>
                <p className="text-xs text-gray-600">
                  Receive important updates and alerts via email
                </p>
              </div>
            </div>
            <Switch
              id="emailNotifications"
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Zap className="w-4 h-4 text-gray-400" />
              <div className="space-y-1">
                <Label htmlFor="instantAlerts" className="text-sm font-medium">
                  Instant Alerts
                </Label>
                <p className="text-xs text-gray-600">
                  Get notified immediately when new opportunities match your interests
                </p>
              </div>
            </div>
            <Switch
              id="instantAlerts"
              checked={settings.instantAlerts}
              onCheckedChange={(checked) => updateSetting('instantAlerts', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div className="space-y-1">
                <Label htmlFor="weeklyDigest" className="text-sm font-medium">
                  Weekly Digest
                </Label>
                <p className="text-xs text-gray-600">
                  Receive a weekly summary of new resources and opportunities
                </p>
              </div>
            </div>
            <Switch
              id="weeklyDigest"
              checked={settings.weeklyDigest}
              onCheckedChange={(checked) => updateSetting('weeklyDigest', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Mail className="w-4 h-4 text-gray-400" />
              <div className="space-y-1">
                <Label htmlFor="marketingEmails" className="text-sm font-medium">
                  Marketing Emails
                </Label>
                <p className="text-xs text-gray-600">
                  Receive newsletters and promotional content about career opportunities
                </p>
              </div>
            </div>
            <Switch
              id="marketingEmails"
              checked={settings.marketingEmails}
              onCheckedChange={(checked) => updateSetting('marketingEmails', checked)}
            />
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </CardContent>
    </Card>
  )
}
