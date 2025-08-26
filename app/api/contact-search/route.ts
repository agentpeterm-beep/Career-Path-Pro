

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.ABACUSAI_API_KEY,
  baseURL: "https://api.abacus.ai/v1"
})

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

// Mock contact database - In a real app, this would be a proper database or API service
const contactDatabase: ContactResult[] = [
  {
    id: 'amazon-hq',
    name: 'Amazon.com, Inc.',
    type: 'Corporate Headquarters',
    description: 'Global e-commerce and cloud computing company headquarters. Customer service and business inquiries.',
    website: 'amazon.com',
    phone: '1-888-280-4331',
    email: 'customer-service@amazon.com',
    address: '410 Terry Avenue North',
    city: 'Seattle',
    state: 'WA',
    zipCode: '98109',
    category: 'Corporate',
    isOfficial: true
  },
  {
    id: 'florida-real-estate',
    name: 'Florida Real Estate Commission',
    type: 'State Regulatory Agency',
    description: 'Official state agency regulating real estate licenses, continuing education, and enforcement in Florida.',
    website: 'myfloridalicense.com/dbpr',
    phone: '1-850-487-1395',
    email: 'real.estate@myfloridalicense.com',
    address: '2601 Blair Stone Road',
    city: 'Tallahassee',
    state: 'FL',
    zipCode: '32399',
    category: 'Government',
    isOfficial: true
  },
  {
    id: 'irs-customer-service',
    name: 'Internal Revenue Service (IRS)',
    type: 'Federal Tax Agency',
    description: 'Official U.S. federal tax collection agency. Customer service for tax questions, payments, and returns.',
    website: 'irs.gov',
    phone: '1-800-829-1040',
    email: 'help@irs.gov',
    address: '1111 Constitution Ave NW',
    city: 'Washington',
    state: 'DC',
    zipCode: '20224',
    category: 'Government',
    isOfficial: true
  },
  {
    id: 'tesla-hq',
    name: 'Tesla, Inc.',
    type: 'Corporate Headquarters',
    description: 'Electric vehicle and clean energy company headquarters. Customer support and investor relations.',
    website: 'tesla.com',
    phone: '1-650-681-5000',
    email: 'customerservice@tesla.com',
    address: '1 Tesla Road',
    city: 'Austin',
    state: 'TX',
    zipCode: '78725',
    category: 'Corporate',
    isOfficial: true
  },
  {
    id: 'texas-dmv',
    name: 'Texas Department of Motor Vehicles',
    type: 'State Motor Vehicle Agency',
    description: 'Official Texas state agency for vehicle registration, titles, licenses, and motor vehicle services.',
    website: 'txdmv.gov',
    phone: '1-888-368-4689',
    email: 'webmaster@txdmv.gov',
    address: '4000 Jackson Ave',
    city: 'Austin',
    state: 'TX',
    zipCode: '78731',
    category: 'Government',
    isOfficial: true
  },
  {
    id: 'microsoft-support',
    name: 'Microsoft Corporation',
    type: 'Technology Support Center',
    description: 'Microsoft customer support for products, services, and technical assistance. Enterprise and consumer support.',
    website: 'support.microsoft.com',
    phone: '1-800-642-7676',
    email: 'support@microsoft.com',
    address: '1 Microsoft Way',
    city: 'Redmond',
    state: 'WA',
    zipCode: '98052',
    category: 'Corporate',
    isOfficial: true
  },
  {
    id: 'california-dmv',
    name: 'California Department of Motor Vehicles',
    type: 'State Motor Vehicle Agency',
    description: 'California DMV for driver licenses, vehicle registration, and motor vehicle services.',
    website: 'dmv.ca.gov',
    phone: '1-800-777-0133',
    email: 'customer.service@dmv.ca.gov',
    address: '2415 1st Avenue',
    city: 'Sacramento',
    state: 'CA',
    zipCode: '95818',
    category: 'Government',
    isOfficial: true
  },
  {
    id: 'apple-support',
    name: 'Apple Inc.',
    type: 'Customer Support',
    description: 'Apple customer support for iPhone, iPad, Mac, and other Apple products. Technical support and warranty services.',
    website: 'apple.com/support',
    phone: '1-800-275-2273',
    email: 'support@apple.com',
    address: '1 Apple Park Way',
    city: 'Cupertino',
    state: 'CA',
    zipCode: '95014',
    category: 'Corporate',
    isOfficial: true
  },
  {
    id: 'social-security',
    name: 'Social Security Administration',
    type: 'Federal Benefits Agency',
    description: 'Official U.S. federal agency managing social security benefits, disability, and retirement services.',
    website: 'ssa.gov',
    phone: '1-800-772-1213',
    email: 'contact@ssa.gov',
    address: '6401 Security Blvd',
    city: 'Baltimore',
    state: 'MD',
    zipCode: '21235',
    category: 'Government',
    isOfficial: true
  },
  {
    id: 'google-support',
    name: 'Google LLC',
    type: 'Customer Support',
    description: 'Google customer support for search, advertising, cloud services, and consumer products.',
    website: 'support.google.com',
    phone: '1-650-253-0000',
    email: 'support@google.com',
    address: '1600 Amphitheatre Parkway',
    city: 'Mountain View',
    state: 'CA',
    zipCode: '94043',
    category: 'Corporate',
    isOfficial: true
  }
]

function searchContacts(query: string): ContactResult[] {
  const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2)
  
  return contactDatabase.filter(contact => {
    const searchableText = [
      contact.name,
      contact.type,
      contact.description,
      contact.category,
      contact.state
    ].join(' ').toLowerCase()
    
    return searchTerms.some(term => searchableText.includes(term))
  }).sort((a, b) => {
    // Sort by relevance (official first, then alphabetically)
    if (a.isOfficial !== b.isOfficial) return a.isOfficial ? -1 : 1
    return a.name.localeCompare(b.name)
  })
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { query } = await request.json()
    
    if (!query?.trim()) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 })
    }

    // Create a readable stream for real-time updates
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Step 1: Analyzing query
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            status: 'analyzing',
            message: 'Analyzing your contact search query...'
          })}\n\n`))
          
          await new Promise(resolve => setTimeout(resolve, 500))

          // Step 2: Searching contacts
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            status: 'searching',
            message: 'Searching contact database...'
          })}\n\n`))
          
          await new Promise(resolve => setTimeout(resolve, 800))
          
          // Perform the search
          const matchedContacts = searchContacts(query)
          
          // Step 3: Verifying information
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            status: 'verifying',
            message: 'Verifying contact information...'
          })}\n\n`))
          
          await new Promise(resolve => setTimeout(resolve, 600))

          // If no direct matches found, try AI-enhanced search
          let finalResults = matchedContacts
          if (matchedContacts.length === 0) {
            try {
              // Use AI to understand the query better and suggest alternatives
              const aiResponse = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{
                  role: "user",
                  content: `The user is searching for contact information for: "${query}". 
                  
                  Based on this query, suggest 2-3 alternative search terms or related organizations they might be looking for. Focus on:
                  1. Official business names
                  2. Government agencies
                  3. Customer service departments
                  
                  Return only the alternative search terms, one per line, without additional explanation.`
                }],
                max_tokens: 200
              })
              
              const suggestions = aiResponse.choices[0]?.message?.content?.trim().split('\n') || []
              
              // Try searching with AI suggestions
              for (const suggestion of suggestions.slice(0, 2)) {
                const suggestedResults = searchContacts(suggestion.replace(/^\d+\.\s*/, ''))
                if (suggestedResults.length > 0) {
                  finalResults = [...finalResults, ...suggestedResults]
                  break
                }
              }
            } catch (aiError) {
              console.error('AI search enhancement failed:', aiError)
              // Continue with empty results
            }
          }

          // Step 4: Complete
          const result = {
            query,
            contacts: finalResults,
            totalResults: finalResults.length
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            status: 'completed',
            result
          })}\n\n`))

          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()

        } catch (error) {
          console.error('Contact search error:', error)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            status: 'error',
            message: 'An error occurred during the search'
          })}\n\n`))
          controller.close()
        }
      }
    })

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Contact search API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

