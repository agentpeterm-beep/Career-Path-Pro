
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  ExternalLink,
  Phone,
  MapPin,
  Trash2,
  Search,
  BookmarkCheck,
  Share2
} from 'lucide-react'
import { toast } from 'sonner'

interface Resource {
  id: string
  title: string
  description: string
  website?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  resourceType: string
  industry?: string
  tags: string[]
  isNational: boolean
}

interface SavedResource {
  id: string
  savedAt: string
  notes?: string
  resource: Resource
}

export default function SavedResourcesContent() {
  const [savedResources, setSavedResources] = useState<SavedResource[]>([])
  const [filteredResources, setFilteredResources] = useState<SavedResource[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSavedResources()
  }, [])

  useEffect(() => {
    if (!searchQuery) {
      setFilteredResources(savedResources)
    } else {
      const filtered = savedResources.filter(item =>
        item.resource?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.resource?.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.resource?.resourceType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.resource?.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      setFilteredResources(filtered)
    }
  }, [searchQuery, savedResources])

  const fetchSavedResources = async () => {
    try {
      const response = await fetch('/api/user/saved-resources')
      const data = await response.json()
      
      if (response.ok) {
        setSavedResources(data.savedResources || [])
      } else {
        toast.error('Failed to load saved resources')
      }
    } catch (error) {
      toast.error('Failed to load saved resources')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveResource = async (resourceId: string) => {
    try {
      const response = await fetch(`/api/user/saved-resources?resourceId=${resourceId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setSavedResources(prev => prev.filter(item => item.resource?.id !== resourceId))
        toast.success('Resource removed from saved list')
      } else {
        toast.error('Failed to remove resource')
      }
    } catch (error) {
      toast.error('Failed to remove resource')
    }
  }

  const handleShare = async (resource: Resource) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: resource.title,
          text: resource.description,
          url: resource.website || window.location.href,
        })
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: copy to clipboard
      const shareText = `${resource.title}\n${resource.description}\n${resource.website || ''}`
      navigator.clipboard?.writeText(shareText)
      toast.success('Resource details copied to clipboard!')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Saved Resources</h1>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading your saved resources...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Saved Resources</h1>
        <p className="text-gray-600">
          Your collection of bookmarked career and business resources
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search your saved resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Resources List */}
      {filteredResources.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookmarkCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {savedResources.length === 0 ? 'No saved resources yet' : 'No resources match your search'}
            </h3>
            <p className="text-gray-600 mb-4">
              {savedResources.length === 0 
                ? 'Start exploring and save resources that interest you'
                : 'Try adjusting your search terms'
              }
            </p>
            {savedResources.length === 0 && (
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Search className="w-4 h-4 mr-2" />
                Search Resources
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Showing {filteredResources.length} of {savedResources.length} saved resources
          </div>
          
          {filteredResources.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{item.resource?.title}</h3>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {item.resource?.resourceType}
                      </span>
                      {item.resource?.isNational && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          National
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-4">{item.resource?.description}</p>
                  </div>
                </div>

                {/* Personal Notes */}
                {item.notes && (
                  <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                    <p className="text-sm text-yellow-800">
                      <span className="font-medium">Your note:</span> {item.notes}
                    </p>
                  </div>
                )}

                {/* Contact Info */}
                <div className="flex flex-wrap gap-4 mb-4">
                  {item.resource?.website && (
                    <a
                      href={item.resource.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Visit Website
                    </a>
                  )}
                  {item.resource?.phone && (
                    <a
                      href={`tel:${item.resource.phone}`}
                      className="flex items-center gap-1 text-green-600 hover:text-green-700 text-sm"
                    >
                      <Phone className="w-4 h-4" />
                      {item.resource.phone}
                    </a>
                  )}
                  {item.resource?.address && (
                    <span className="flex items-center gap-1 text-gray-600 text-sm">
                      <MapPin className="w-4 h-4" />
                      {item.resource.city && item.resource.state 
                        ? `${item.resource.city}, ${item.resource.state}` 
                        : item.resource.address}
                    </span>
                  )}
                </div>

                {/* Tags */}
                {item.resource?.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.resource.tags.slice(0, 5).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    Saved on {new Date(item.savedAt).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleShare(item.resource)}
                    >
                      <Share2 className="w-4 h-4 mr-1" />
                      Share
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveResource(item.resource?.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
