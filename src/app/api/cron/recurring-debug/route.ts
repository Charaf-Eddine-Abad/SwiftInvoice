import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/cron/recurring-debug - Debug recurring invoices
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
      databaseConnection: 'unknown' as string,
      recurringInvoicesCount: 0,
      error: null as string | null
    }

    // Test Prisma connection
    try {
      debugInfo.hasPrismaClient = !!prisma
      
      // Try a simple database query
      await prisma.$queryRaw`SELECT 1`
      debugInfo.databaseConnection = 'connected'
      
      // Try to count recurring invoices
      const count = await prisma.recurringInvoice.count()
      debugInfo.recurringInvoicesCount = count
      
    } catch (error) {
      debugInfo.databaseConnection = 'failed'
      debugInfo.error = error instanceof Error ? error.message : 'Unknown error'
    }

    return NextResponse.json({
      message: 'Recurring invoices debug information collected',
      debug: debugInfo
    })

  } catch (error) {
    console.error('Error in recurring debug cron job:', error)
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
