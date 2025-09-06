import { NextResponse } from 'next/server'

export async function GET() {
  // Only show in development or if explicitly enabled
  if (process.env.NODE_ENV === 'production' && !process.env.DEBUG_ENV) {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  return NextResponse.json({
    DATABASE_URL: process.env.DATABASE_URL ? 'Set (hidden)' : 'Not set',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set (hidden)' : 'Not set',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'Not set',
    CRON_SECRET: process.env.CRON_SECRET ? 'Set (hidden)' : 'Not set',
    NODE_ENV: process.env.NODE_ENV,
  })
}
