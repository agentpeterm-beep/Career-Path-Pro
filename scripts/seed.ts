
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface ResourceData {
  title: string
  description: string
  website?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  resource_type: string
  industry?: string
  contactEmail?: string
  tags: string[]
  isNational?: boolean
}

async function main() {
  console.log('🌱 Starting seed process...')

  // Create test user with admin privileges
  const hashedPassword = await bcrypt.hash('johndoe123', 10)
  
  const testUser = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      name: 'John Doe',
      password: hashedPassword,
      location: 'New York, NY',
      industry: 'Technology',
      experienceLevel: 'Mid-Level',
      subscriptionTier: 'premium',
      subscriptionExpires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    },
  })

  console.log(`✅ Created/updated test user: ${testUser.email}`)

  // Load and process resources data
  const resourcesPath = path.join(process.cwd(), 'data', 'resources.json')
  const resourcesData = JSON.parse(fs.readFileSync(resourcesPath, 'utf8'))

  console.log(`📚 Loading ${resourcesData.length} resources...`)

  // Process each resource
  for (const resource of resourcesData) {
    // Extract address components if available
    let city, state, zipCode
    if (resource.address) {
      const addressParts = resource.address.split(',')
      if (addressParts.length >= 2) {
        const lastPart = addressParts[addressParts.length - 1]?.trim()
        const stateZipMatch = lastPart?.match(/([A-Z]{2})\s+(\d{5}(-\d{4})?)/)
        if (stateZipMatch) {
          state = stateZipMatch[1]
          zipCode = stateZipMatch[2]
          city = addressParts[addressParts.length - 2]?.trim()
        }
      }
    }

    await prisma.resource.create({
      data: {
        title: resource.title,
        description: resource.description,
        website: resource.website || null,
        phone: resource.phone || null,
        address: resource.address || null,
        city: city || null,
        state: state || null,
        zipCode: zipCode || null,
        resourceType: resource.resource_type,
        industry: resource.industry || null,
        contactEmail: resource.contactEmail || null,
        tags: resource.tags || [],
        isNational: resource.isNational ?? true,
        isActive: true,
      },
    })
  }

  // Add some sample user interests for the test user
  const sampleInterests = [
    'software engineering',
    'project management',
    'artificial intelligence',
    'small business development',
    'remote work opportunities'
  ]

  for (let i = 0; i < sampleInterests.length; i++) {
    await prisma.userInterest.create({
      data: {
        userId: testUser.id,
        interest: sampleInterests[i],
        priority: Math.floor(Math.random() * 5) + 1,
      },
    })
  }

  // Add some sample search queries for analytics
  const sampleQueries = [
    'How to find remote software engineering jobs?',
    'Best resources for starting a small business',
    'Certification programs for project managers',
    'Healthcare career opportunities',
    'Trade school options for electricians'
  ]

  for (const query of sampleQueries) {
    await prisma.searchQuery.create({
      data: {
        userId: testUser.id,
        query: query,
        resultsCount: Math.floor(Math.random() * 10) + 1,
        wasHelpful: Math.random() > 0.3, // 70% helpful
      },
    })
  }

  // Save some resources for the test user
  const resources = await prisma.resource.findMany({ take: 5 })
  for (const resource of resources) {
    await prisma.savedResource.upsert({
      where: {
        userId_resourceId: {
          userId: testUser.id,
          resourceId: resource.id,
        },
      },
      update: {},
      create: {
        userId: testUser.id,
        resourceId: resource.id,
        notes: `Saved this resource for future reference - ${resource.title}`,
      },
    })
  }

  console.log('✅ Database seeded successfully!')
  console.log(`📊 Created ${resourcesData.length} resources`)
  console.log(`👤 Created test user with ${sampleInterests.length} interests`)
  console.log(`🔍 Added ${sampleQueries.length} sample search queries`)
  console.log(`💾 Added ${resources.length} saved resources`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
