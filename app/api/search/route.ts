
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    const { query } = await request.json()
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        const decoder = new TextDecoder()

        try {
          // Step 1: Stream initial progress
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            status: 'analyzing',
            message: 'Understanding your question...'
          })}\n\n`))

          // Step 2: Get user context if available
          let userContext = ''
          let userInterests: string[] = []
          
          if (session?.user?.id) {
            const user = await prisma.user.findUnique({
              where: { id: session.user.id },
              include: {
                userInterests: {
                  orderBy: { priority: 'desc' },
                  take: 5
                }
              }
            })
            
            if (user) {
              userInterests = user.userInterests?.map(interest => interest.interest) || []
              userContext = `User location: ${user.location || 'Not specified'}. User industry: ${user.industry || 'Not specified'}. User experience: ${user.experienceLevel || 'Not specified'}. User interests: ${userInterests.join(', ')}.`
            }
          }

          // Step 3: Stream searching progress
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            status: 'searching',
            message: 'Finding relevant resources...'
          })}\n\n`))

          // Step 4: Create AI prompt for resource matching
          const systemPrompt = `You are an expert career and business counselor. Your task is to understand the user's career question and provide relevant guidance along with specific resource recommendations.

Available Resource Types:
- Job Search Websites (Indeed, LinkedIn, etc.)
- Trade Organizations & Apprenticeship Programs
- SBA & Business Development Resources
- Learning Platforms & Certification Programs
- Industry-Specific Career Resources

User Context: ${userContext}

Based on the user's question, provide:
1. A brief, helpful response to their question (2-3 sentences)
2. A list of specific resource types that would be most relevant
3. Search keywords that should be used to find matching resources in the database

Respond in this JSON format:
{
  "guidance": "Brief helpful response to the user's question",
  "relevantResourceTypes": ["Job Search Website", "Learning Platform", etc.],
  "searchKeywords": ["keyword1", "keyword2", "keyword3"],
  "industryFilter": "specific industry if mentioned, otherwise null",
  "locationRelevant": true/false
}

Respond with raw JSON only. Do not include code blocks, markdown, or any other formatting.`

          const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: `User question: "${query}"` }
          ]

          // Call the LLM API
          const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
            },
            body: JSON.stringify({
              model: 'gpt-4.1-mini',
              messages: messages,
              response_format: { type: "json_object" },
              max_tokens: 1000,
              stream: true,
            }),
          })

          if (!response.ok) {
            throw new Error(`LLM API error: ${response.statusText}`)
          }

          // Step 5: Process streaming response
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            status: 'processing',
            message: 'Analyzing your question with AI...'
          })}\n\n`))

          const reader = response.body?.getReader()
          if (!reader) throw new Error('No response body')

          let buffer = ''
          let partialRead = ''

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            partialRead += decoder.decode(value, { stream: true })
            let lines = partialRead.split('\n')
            partialRead = lines.pop() || ''

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') {
                  break
                }
                try {
                  const parsed = JSON.parse(data)
                  buffer += parsed.choices?.[0]?.delta?.content || ''
                  
                  // Stream progress updates
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    status: 'processing',
                    message: 'Processing AI analysis...'
                  })}\n\n`))
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }

          // Parse the complete AI response
          const aiResponse = JSON.parse(buffer)
          
          // Step 6: Search database for matching resources
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            status: 'matching',
            message: 'Finding matching resources...'
          })}\n\n`))

          // Build dynamic search query
          const searchConditions: any = {
            isActive: true,
            OR: []
          }

          // Add keyword searches
          if (aiResponse.searchKeywords?.length > 0) {
            for (const keyword of aiResponse.searchKeywords) {
              searchConditions.OR.push({
                tags: {
                  hasSome: [keyword.toLowerCase()]
                }
              })
              searchConditions.OR.push({
                title: {
                  contains: keyword,
                  mode: 'insensitive'
                }
              })
              searchConditions.OR.push({
                description: {
                  contains: keyword,
                  mode: 'insensitive'
                }
              })
            }
          }

          // Add resource type filter
          if (aiResponse.relevantResourceTypes?.length > 0) {
            searchConditions.OR.push({
              resourceType: {
                in: aiResponse.relevantResourceTypes
              }
            })
          }

          // Add industry filter if specified
          if (aiResponse.industryFilter) {
            searchConditions.industry = {
              contains: aiResponse.industryFilter,
              mode: 'insensitive'
            }
          }

          // Search for resources
          const resources = await prisma.resource.findMany({
            where: searchConditions.OR.length > 0 ? searchConditions : { isActive: true },
            take: 20,
            orderBy: [
              { isNational: 'desc' },
              { createdAt: 'desc' }
            ]
          })

          // Step 7: Log the search query
          if (session?.user?.id) {
            await prisma.searchQuery.create({
              data: {
                userId: session.user.id,
                query,
                resultsCount: resources.length,
              }
            })
          }

          // Step 8: Return final results
          const finalResult = {
            guidance: aiResponse.guidance,
            resources: resources.map(resource => ({
              id: resource.id,
              title: resource.title,
              description: resource.description,
              website: resource.website,
              phone: resource.phone,
              address: resource.address,
              city: resource.city,
              state: resource.state,
              resourceType: resource.resourceType,
              industry: resource.industry,
              tags: resource.tags,
              isNational: resource.isNational,
            })),
            query,
            totalResults: resources.length
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            status: 'completed',
            result: finalResult
          })}\n\n`))

          controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
        } catch (error) {
          console.error('Search error:', error)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            status: 'error',
            message: 'Sorry, something went wrong processing your question. Please try again.'
          })}\n\n`))
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
