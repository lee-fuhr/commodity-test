/**
 * Stripe Checkout API Route
 * Copy this to each tool's app/api/checkout/route.ts
 *
 * Customize TOOL_NAME and TOOL_PRICE for each tool
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// ========================================
// CUSTOMIZE THESE FOR EACH TOOL
// ========================================
const TOOL_NAME = 'Website Messaging Audit'; // Change per tool
// Import TOOL_PRICE from @shared/config/pricing rather than hardcoding.
// Example: import { PRICING } from '@shared/config/pricing'; const TOOL_PRICE = PRICING['website-audit'].base
const TOOL_PRICE = 400; // In dollars — replace with import from @shared/config/pricing per tool
// ========================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { analysisId, email, promoCode } = body;

    if (!analysisId) {
      return NextResponse.json(
        { success: false, error: 'Missing analysis ID' },
        { status: 400 }
      );
    }

    // Calculate price (handle promo codes if needed)
    let finalPrice = TOOL_PRICE;
    let discount = 0;

    if (promoCode === 'LAUNCH30') {
      discount = Math.round(TOOL_PRICE * 0.3);
      finalPrice = TOOL_PRICE - discount;
    }

    // Get the base URL for redirects
    const origin = request.headers.get('origin') || 'https://leefuhr.com';

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: TOOL_NAME,
              description: `One-time analysis · Instant access · 30-day guarantee`,
            },
            unit_amount: finalPrice * 100, // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/results/${analysisId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/preview/${analysisId}`,
      customer_email: email,
      metadata: {
        tool: TOOL_NAME,
        analysisId,
        originalPrice: TOOL_PRICE.toString(),
        discount: discount.toString(),
        promoCode: promoCode || '',
      },
      // Allow promo codes in Stripe Checkout
      allow_promotion_codes: true,
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
