
'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  Search, 
  Send, 
  ArrowLeft, 
  ExternalLink,
  Phone,
  MapPin,
  Bookmark,
  Share2,
  Loader2,
  Mic,
  MicOff
} from 'lucide-react'
import { toast } from 'sonner'
import { ResourceDisplay, filterSearchResults } from '@/components/premium-gate'
import { pricingConfig } from '@/lib/pricing-config'
import UpgradePrompt from '@/components/upgrade-prompt'

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

interface SearchResult {
  guidance: string
  resources: Resource[]
  query: string
  totalResults: number
}

interface SearchInterfaceProps {
  initialQuery?: string
  onBack: () => void
}

export default function SearchInterface({ initialQuery = '', onBack }: SearchInterfaceProps) {
  const { data: session } = useSession() || {}
  const [query, setQuery] = useState(initialQuery)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null)
  const [searchStatus, setSearchStatus] = useState('')
  const [progress, setProgress] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const userTier = session?.user?.subscriptionTier || 'free'
  const hasFullAccess = pricingConfig.hasAccess(userTier, 'unlimited')

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery)
    }
  }, [initialQuery])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognitionAPI()
      
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        setIsListening(true)
        toast.info('🎤 Listening... Speak your question now')
      }

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setQuery(transcript)
        setIsListening(false)
        toast.success(`Heard: "${transcript}"`)
        // Automatically search after voice input
        setTimeout(() => handleSearch(transcript), 500)
      }

      recognition.onerror = (event: any) => {
        setIsListening(false)
        console.error('Speech recognition error:', event.error)
        switch (event.error) {
          case 'no-speech':
            toast.error('No speech detected. Please try again.')
            break
          case 'network':
            toast.error('Network error. Please check your connection.')
            break
          case 'not-allowed':
            toast.error('Microphone access denied. Please allow microphone access.')
            break
          default:
            toast.error('Speech recognition failed. Please try again.')
        }
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      setRecognition(recognition)
    }
  }, [])

  const toggleVoiceRecognition = () => {
    if (!recognition) {
      toast.error('Voice recognition not supported in this browser')
      return
    }

    if (isListening) {
      recognition.stop()
      setIsListening(false)
    } else {
      recognition.start()
    }
  }

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setSearchResult(null)
    setProgress(0)
    setSearchStatus('Starting search...')

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      })

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let partialRead = ''

      while (true) {
        const { done, value } = await reader?.read() || { done: true, value: undefined }
        if (done) break

        partialRead += decoder.decode(value, { stream: true })
        let lines = partialRead.split('\n')
        partialRead = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              setIsSearching(false)
              return
            }
            try {
              const parsed = JSON.parse(data)
              if (parsed.status === 'analyzing') {
                setProgress(20)
                setSearchStatus(parsed.message)
              } else if (parsed.status === 'searching') {
                setProgress(40)
                setSearchStatus(parsed.message)
              } else if (parsed.status === 'processing') {
                setProgress(60)
                setSearchStatus(parsed.message)
              } else if (parsed.status === 'matching') {
                setProgress(80)
                setSearchStatus(parsed.message)
              } else if (parsed.status === 'completed') {
                setProgress(100)
                setSearchStatus('Search completed!')
                
                // Filter results based on user's subscription tier
                const filteredResults = {
                  ...parsed.result,
                  resources: filterSearchResults(parsed.result.resources, userTier, hasFullAccess ? undefined : 5)
                }
                
                setSearchResult(filteredResults)
                setIsSearching(false)
                
                if (!hasFullAccess && parsed.result.resources.length > filteredResults.resources.length) {
                  toast.success(`Found ${parsed.result.resources.length} resources! Showing ${filteredResults.resources.length} - upgrade to Premium for full access.`)
                } else {
                  toast.success(`Found ${filteredResults.resources.length} resources!`)
                }
              } else if (parsed.status === 'error') {
                throw new Error(parsed.message || 'Search failed')
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Search error:', error)
      toast.error('Sorry, something went wrong with your search. Please try again.')
      setIsSearching(false)
    }
  }

  const handleSaveResource = async (resourceId: string) => {
    try {
      const response = await fetch('/api/user/saved-resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceId }),
      })
      
      if (response.ok) {
        toast.success('Resource saved!')
      } else {
        toast.error('Failed to save resource')
      }
    } catch (error) {
      toast.error('Failed to save resource')
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">AI Career Search</h1>
      </div>

      {/* Upgrade Banner for Free Users */}
      {!hasFullAccess && (
        <UpgradePrompt 
          variant="banner" 
          title="Unlock Complete Search Results" 
          description="Get unlimited searches and full contact information for all resources"
          dismissible
        />
      )}

      {/* Search Input */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Ask any career question... e.g., 'How do I find remote tech jobs?' or click the mic to speak"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isSearching && !isListening && handleSearch()}
                className="pl-10"
                disabled={isSearching || isListening}
              />
            </div>
            <Button
              onClick={toggleVoiceRecognition}
              disabled={isSearching}
              variant="outline"
              size="icon"
              className={`${isListening ? 'bg-red-100 border-red-300 text-red-600' : 'hover:bg-green-50'}`}
              title={isListening ? 'Stop listening' : 'Voice search'}
            >
              {isListening ? (
                <MicOff className="w-4 h-4 animate-pulse" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </Button>
            <Button 
              onClick={() => handleSearch()}
              disabled={!query.trim() || isSearching || isListening}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Progress indicator */}
          {isSearching && (
            <div className="mt-4 space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-gray-600">{searchStatus}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResult && (
        <div className="space-y-6">
          {/* AI Guidance */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <span>🧠</span> AI Guidance
              </h2>
              <p className="text-blue-800">{searchResult.guidance}</p>
            </CardContent>
          </Card>

          {/* Results Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Found {searchResult.totalResults} relevant resources
            </h2>
          </div>

          {/* Resources Grid */}
          <div className="grid gap-6">
            {searchResult.resources.map((resource) => (
              <div key={resource.id} className="relative">
                <ResourceDisplay 
                  resource={resource} 
                  userTier={userTier}
                  showPreview={true}
                />
                
                {/* Additional metadata and actions */}
                <Card className="mt-4 bg-gray-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {resource.resourceType}
                        </span>
                        {resource.isNational && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            National
                          </span>
                        )}
                        {resource.industry && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                            {resource.industry}
                          </span>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSaveResource(resource.id)}
                        >
                          <Bookmark className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleShare(resource)}
                        >
                          <Share2 className="w-4 h-4 mr-1" />
                          Share
                        </Button>
                      </div>
                    </div>
                    
                    {/* Tags */}
                    {resource.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {resource.tags.slice(0, 5).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {resource.tags.length > 5 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                            +{resource.tags.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* No results message */}
          {searchResult.resources.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-600">
                  No specific resources found for your query, but our AI guidance above should help point you in the right direction!
                </p>
              </CardContent>
            </Card>
          )}

          {/* Upgrade Prompt for Free Users */}
          {!hasFullAccess && searchResult.resources.length > 0 && (
            <UpgradePrompt 
              title="Want Complete Details for All Results?"
              description="Upgrade to Premium for unlimited searches and full contact information"
              benefits={[
                "See complete contact details (phone, email, address)",
                "Get full resource descriptions",
                "Unlimited AI-powered searches",
                "Priority support and faster responses"
              ]}
            />
          )}
        </div>
      )}
    </div>
  )
}
