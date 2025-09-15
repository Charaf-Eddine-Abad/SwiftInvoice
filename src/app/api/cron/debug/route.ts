import { NextRequest, NextResponse } from 'next/server'

// POST /api/cron/debug - Debug cron job environment
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

    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      hasCronSecret: !!process.env.CRON_SECRET,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasPrismaClient: false,
      databaseConnection: 'unknown',
      error: null
    }

    // Test Prisma connection
    try {
      const { prisma } = await import('@/lib/prisma')
      debugInfo.hasPrismaClient = !!prisma
      
      // Try a simple database query
      await prisma.$queryRaw`SELECT 1`
      debugInfo.databaseConnection = 'connected'
    } catch (error) {
      debugInfo.databaseConnection = 'failed'
      debugInfo.error = error instanceof Error ? error.message : 'Unknown error'
    }

    return NextResponse.json({
      message: 'Debug information collected',
      debug: debugInfo
    })

  } catch (error) {
    console.error('Error in debug cron job:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
