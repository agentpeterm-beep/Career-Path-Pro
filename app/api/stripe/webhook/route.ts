
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { PrismaClient } from '@prisma/client'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

const prisma = new PrismaClient()
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = Buffer.from(await request.arrayBuffer())
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      
      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(updatedSubscription)
        break
        
      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(deletedSubscription)
        break
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  let user = null

  // Find user by userId from metadata or by customer email
  if (userId) {
    user = await prisma.user.findUnique({ where: { id: userId } })
  } else if (session.customer_email) {
    user = await prisma.user.findUnique({ where: { email: session.customer_email } })
  }

  if (!user) {
    console.error('User not found for checkout session', { userId, email: session.customer_email })
    return
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionTier: 'premium',
      subscriptionStatus: 'active',
      stripeCustomerId: session.customer as string,
      subscriptionId: session.subscription as string,
    },
  })

  console.log(`Updated user ${user.id} to premium plan`)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const user = await prisma.user.findFirst({
    where: { subscriptionId: subscription.id },
  })

  if (!user) return

  // Determine plan based on subscription status
  let plan = 'free'
  if (subscription.status === 'active') {
    plan = 'premium'
  }

  const subscriptionData = subscription as any

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionTier: plan,
      subscriptionStatus: subscription.status,
      subscriptionExpires: subscriptionData.current_period_end 
        ? new Date(subscriptionData.current_period_end * 1000) 
        : null,
    },
  })

  console.log(`Updated user ${user.id} subscription status to ${subscription.status}`)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const user = await prisma.user.findFirst({
    where: { subscriptionId: subscription.id },
  })

  if (!user) return

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionTier: 'free',
      subscriptionStatus: 'canceled',
      subscriptionExpires: null,
    },
  })

  console.log(`Canceled subscription for user ${user.id}`)
}
