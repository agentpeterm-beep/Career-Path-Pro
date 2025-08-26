
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { priceId } = await request.json()

    // Default to premium price if not specified
    const finalPriceId = priceId || process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      success_url: `https://openook-careers.abacusai.app/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://openook-careers.abacusai.app/pricing`,
      allow_promotion_codes: true,
      automatic_tax: {
        enabled: true,
      },
      customer_creation: 'always',
      ...(session?.user?.id && {
        metadata: {
          userId: session.user.id,
        },
      }),
    })

    return NextResponse.json({ id: checkoutSession.id })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
