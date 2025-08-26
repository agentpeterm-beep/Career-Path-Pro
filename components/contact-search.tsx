

'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Send, 
  ArrowLeft, 
  ExternalLink,
  Phone,
  MapPin,
  Mail,
  Globe,
  Building2,
  Loader2,
  Mic,
  MicOff,
  Crown,
  Lock
} from 'lucide-react'
import { toast } from 'sonner'
import { pricingConfig } from '@/lib/pricing-config'
import UpgradePrompt from '@/components/upgrade-prompt'

interface ContactResult {
  id: string
  name: string
  type: string
  description: string
  website?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  category: string
  isOfficial: boolean
}

interface ContactSearchResult {
  query: string
  contacts: ContactResult[]
  totalResults: number
}

interface ContactSearchProps {
  onBack: () => void
}

export default function ContactSearch({ onBack }: ContactSearchProps) {
  const { data: session } = useSession() || {}
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResult, setSearchResult] = useState<ContactSearchResult | null>(null)
  const [searchStatus, setSearchStatus] = useState('')
  const [progress, setProgress] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const userTier = session?.user?.subscriptionTier || 'free'
  const hasFullAccess = pricingConfig.hasAccess(userTier, 'unlimited')

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
        toast.info('🎤 Listening... Speak your search now')
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
    setSearchStatus('Starting contact search...')

    try {
      const response = await fetch('/api/contact-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      })

      if (!response.ok) {
        throw new Error('Contact search failed')
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
                setProgress(25)
                setSearchStatus(parsed.message)
              } else if (parsed.status === 'searching') {
                setProgress(50)
                setSearchStatus(parsed.message)
              } else if (parsed.status === 'verifying') {
                setProgress(75)
                setSearchStatus(parsed.message)
              } else if (parsed.status === 'completed') {
                setProgress(100)
                setSearchStatus('Search completed!')
                setSearchResult(parsed.result)
                setIsSearching(false)
                
                if (parsed.result.contacts.length > 0) {
                  toast.success(`Found ${parsed.result.contacts.length} contacts!`)
                } else {
                  toast.info('No contacts found. Try a different search term.')
                }
              } else if (parsed.status === 'error') {
                throw new Error(parsed.message || 'Contact search failed')
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Contact search error:', error)
      toast.error('Sorry, something went wrong with your contact search. Please try again.')
      setIsSearching(false)
    }
  }

  const renderContactCard = (contact: ContactResult) => {
    return (
      <Card key={contact.id} className="h-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-lg font-semibold leading-tight">
                {contact.name}
              </CardTitle>
            </div>
            <div className="flex gap-1">
              {contact.isOfficial && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  Official
                </Badge>
              )}
              {!hasFullAccess && (
                <Badge variant="outline" className="text-xs">
                  <Lock className="w-3 h-3 mr-1" />
                  Limited
                </Badge>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600">{contact.type} • {contact.category}</p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-sm">
            {hasFullAccess 
              ? contact.description 
              : `${contact.description?.substring(0, 100)}${contact.description?.length > 100 ? '...' : ''}`
            }
          </p>
          
          {hasFullAccess ? (
            // Full Information for Premium Users
            <div className="space-y-3">
              {contact.website && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <a 
                    href={contact.website.startsWith('http') ? contact.website : `https://${contact.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline truncate"
                  >
                    {contact.website}
                  </a>
                  <ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0" />
                </div>
              )}
              
              {contact.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <a href={`tel:${contact.phone}`} className="text-green-600 hover:underline">
                    {contact.phone}
                  </a>
                </div>
              )}
              
              {contact.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <a href={`mailto:${contact.email}`} className="text-purple-600 hover:underline truncate">
                    {contact.email}
                  </a>
                </div>
              )}
              
              {contact.address && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-gray-600">
                    {contact.address}
                    {contact.city && <><br />{contact.city}, {contact.state} {contact.zipCode}</>}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Limited Preview for Free Users
            <div className="pt-4 border-t">
              <div className="text-center space-y-2">
                <p className="text-xs text-gray-500">
                  <Lock className="w-3 h-3 inline mr-1" />
                  Complete contact details available with Premium
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                  {contact.website && <div className="flex items-center gap-1"><Globe className="w-3 h-3" />Website</div>}
                  {contact.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" />Phone</div>}
                  {contact.email && <div className="flex items-center gap-1"><Mail className="w-3 h-3" />Email</div>}
                  {contact.address && <div className="flex items-center gap-1"><MapPin className="w-3 h-3" />Address</div>}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const exampleSearches = [
    { text: "Amazon business address", category: "Corporate" },
    { text: "Florida Real Estate Commission contact", category: "Government" },
    { text: "IRS customer service phone number", category: "Government" },
    { text: "Tesla headquarters contact information", category: "Corporate" },
    { text: "Texas Department of Motor Vehicles", category: "Government" },
    { text: "Microsoft customer support", category: "Corporate" }
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            Contact Search
          </h1>
          <p className="text-sm text-gray-600">Find official contact information for businesses and organizations</p>
        </div>
      </div>

      {/* Upgrade Banner for Free Users */}
      {!hasFullAccess && (
        <UpgradePrompt 
          variant="banner" 
          title="Get Full Contact Details" 
          description="Upgrade to Premium for complete contact information including phone, email, and address"
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
                placeholder="e.g., 'Amazon business address' or 'Texas Real Estate Licensing Board'"
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

      {/* Example Searches */}
      {!searchResult && !isSearching && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Example Searches</CardTitle>
            <p className="text-sm text-gray-600">Try searching for any business, organization, or government office</p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {exampleSearches.map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-start text-left h-auto p-3"
                  onClick={() => {
                    setQuery(example.text)
                    handleSearch(example.text)
                  }}
                >
                  <div>
                    <div className="font-medium text-sm">{example.text}</div>
                    <div className="text-xs text-gray-500">{example.category}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {searchResult && (
        <div className="space-y-6">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Found {searchResult.totalResults} contact{searchResult.totalResults !== 1 ? 's' : ''}
            </h2>
          </div>

          {/* Contacts Grid */}
          {searchResult.contacts.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {searchResult.contacts.map((contact) => renderContactCard(contact))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  No contacts found for "{searchResult.query}". Try searching with different terms like:
                </p>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>• Company name + "contact" or "customer service"</p>
                  <p>• Government agency + state name</p>
                  <p>• Organization + "phone number" or "address"</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upgrade Prompt for Free Users */}
          {!hasFullAccess && searchResult.contacts.length > 0 && (
            <UpgradePrompt 
              title="Unlock Complete Contact Information"
              description="Get phone numbers, email addresses, and physical addresses for all contacts"
              benefits={[
                "Full phone numbers and direct lines",
                "Email addresses and contact forms",
                "Complete physical addresses",
                "Unlimited contact searches"
              ]}
            />
          )}
        </div>
      )}
    </div>
  )
}

