
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Users, 
  Crown, 
  CreditCard, 
  Settings, 
  Search,
  MoreHorizontal,
  Eye,
  UserCheck,
  UserX,
  TestTube,
  Mail,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface User {
  id: string
  name: string
  email: string
  subscriptionTier: string
  subscriptionExpires?: string
  createdAt: string
  stripeCustomerId?: string
  subscriptionId?: string
}

interface Stats {
  totalUsers: number
  freeUsers: number
  premiumUsers: number
  totalRevenue: number
  newUsersToday: number
  subscriptionsToday: number
}

export default function AdminPage() {
  const { data: session, status } = useSession() || {}
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    freeUsers: 0,
    premiumUsers: 0,
    totalRevenue: 0,
    newUsersToday: 0,
    subscriptionsToday: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTier, setFilterTier] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [testMode, setTestMode] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Simple admin check - in a real app, you'd check roles/permissions
    const adminEmails = ['admin@example.com', 'your-email@example.com']
    if (!adminEmails.includes(session.user?.email || '')) {
      toast.error('Access denied: Admin privileges required')
      router.push('/dashboard')
      return
    }

    fetchData()
  }, [session, status, router])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [usersResponse, statsResponse] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/stats')
      ])

      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData.users || [])
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
      toast.error('Failed to load admin data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateSubscription = async (userId: string, newTier: string) => {
    try {
      const response = await fetch('/api/admin/update-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, tier: newTier, testMode })
      })

      if (response.ok) {
        toast.success(`Subscription updated to ${newTier}`)
        fetchData() // Refresh data
      } else {
        throw new Error('Failed to update subscription')
      }
    } catch (error) {
      toast.error('Failed to update subscription')
    }
  }

  const handleTestUserFlow = async () => {
    try {
      const response = await fetch('/api/admin/test-flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testMode })
      })

      const data = await response.json()
      
      if (response.ok) {
        toast.success('Test flow completed successfully')
        // You could display test results here
        console.log('Test results:', data)
      } else {
        throw new Error(data.error || 'Test flow failed')
      }
    } catch (error) {
      toast.error('Test flow failed')
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTier = filterTier === 'all' || user.subscriptionTier === filterTier
    return matchesSearch && matchesTier
  })

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage users and subscriptions</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <TestTube className="w-4 h-4" />
              <span className="text-sm">Test Mode:</span>
              <Button
                variant={testMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTestMode(!testMode)}
              >
                {testMode ? 'ON' : 'OFF'}
              </Button>
            </div>
            <Button onClick={fetchData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  <p className="text-xs text-gray-600">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Crown className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{stats.premiumUsers}</p>
                  <p className="text-xs text-gray-600">Premium Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">${stats.totalRevenue}</p>
                  <p className="text-xs text-gray-600">Total Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <UserCheck className="h-8 w-8 text-indigo-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{stats.newUsersToday}</p>
                  <p className="text-xs text-gray-600">New Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Testing Panel */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="w-5 h-5" />
              Testing & Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button onClick={handleTestUserFlow} variant="outline">
                <TestTube className="w-4 h-4 mr-2" />
                Test Complete User Flow
              </Button>
              <Button variant="outline">
                <Mail className="w-4 h-4 mr-2" />
                Test Email Notifications
              </Button>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Webhook Settings
              </Button>
            </div>
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Test Mode {testMode ? 'Enabled' : 'Disabled'}:</strong> {' '}
                {testMode 
                  ? 'All payments will use Stripe test mode. No real charges will be made.'
                  : 'Live mode - real payments will be processed!'
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterTier} onValueChange={setFilterTier}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.name || 'No name'}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <Badge variant={user.subscriptionTier === 'premium' ? 'default' : 'secondary'}>
                          {user.subscriptionTier}
                        </Badge>
                        {user.subscriptionExpires && (
                          <p className="text-xs text-gray-600 mt-1">
                            Expires: {format(new Date(user.subscriptionExpires), 'MMM dd, yyyy')}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.subscriptionTier === 'premium' ? 'default' : 'outline'}
                        className={user.subscriptionTier === 'premium' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {user.subscriptionTier === 'premium' ? 'Active' : 'Free'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Select 
                          value={user.subscriptionTier} 
                          onValueChange={(value) => handleUpdateSubscription(user.id, value)}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free">Free</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No users found matching your criteria
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
