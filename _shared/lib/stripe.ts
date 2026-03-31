/**
 * Shared Stripe utilities for LFI tools
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

interface CreateCheckoutParams {
  toolName: string;
  price: number; // in dollars
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}

/**
 * Create a Stripe Checkout session
 */
export async function createCheckoutSession({
  toolName,
  price,
  successUrl,
  cancelUrl,
  customerEmail,
  metadata = {},
}: CreateCheckoutParams) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: toolName,
            description: `One-time analysis from Lee Fuhr Inc`,
          },
          unit_amount: price * 100, // Stripe uses cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: customerEmail,
    metadata: {
      tool: toolName,
      ...metadata,
    },
  });

  return session;
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}

/**
 * Get session details after successful payment
 */
export async function getSessionDetails(sessionId: string) {
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['customer', 'payment_intent'],
  });
}

export { stripe };
