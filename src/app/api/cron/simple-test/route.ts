import { NextRequest, NextResponse } from 'next/server'

// POST /api/cron/simple-test - Simple cron test without database
export async function POST(request: NextRequest) {
  try {
    // Verify the request is from a cron job
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    // Allow test-secret for development/testing
    if (!cronSecret || (authHeader !== `Bearer ${cronSecret}` && authHeader !== 'Bearer test-secret')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const testData = {
      message: 'Simple cron test successful! 🎉',
      timestamp: new Date().toISOString(),
      serverTime: new Date().toLocaleString(),
      environment: process.env.NODE_ENV,
      hasCronSecret: !!process.env.CRON_SECRET,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      randomId: Math.random().toString(36).substring(7),
      testResults: {
        server: 'running',
        cron: 'working',
        auth: 'passed'
      }
    }

    console.log('Simple cron test executed:', testData)

    return NextResponse.json(testData, { status: 200 })
  } catch (error) {
    console.error('Simple cron test error:', error)
    
    return NextResponse.json(
      { 
        error: 'Simple cron test failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}
