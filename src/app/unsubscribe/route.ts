import { NextRequest } from 'next/server'
import { kv } from '@vercel/kv'

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email')
  if (!email || !email.includes('@')) {
    return new Response('<p>Invalid unsubscribe link.</p>', {
      status: 400,
      headers: { 'content-type': 'text/html' },
    })
  }
  await kv.set(`unsub:${email.toLowerCase()}`, true)
  return new Response('<p>You have been unsubscribed. You will receive no further emails.</p>', {
    status: 200,
    headers: { 'content-type': 'text/html' },
  })
}
