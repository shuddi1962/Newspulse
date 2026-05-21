// app/api/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/insforge'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const email = formData.get('email') as string
    if (!email || !email.includes('@')) {
      return NextResponse.redirect(new URL('/?error=invalid-email', req.url))
    }

    await db.subscribers.add(email)
    return NextResponse.redirect(new URL('/?subscribed=true', req.url))
  } catch {
    return NextResponse.redirect(new URL('/?error=subscription-failed', req.url))
  }
}
