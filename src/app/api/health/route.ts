import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Simple health check
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    }

    return NextResponse.json(healthData, { status: 200 })
  } catch (error) {
    console.error('Health check error:', error)
    
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Test endpoint for cron jobs
    const body = await request.json().catch(() => ({}))
    
    const testData = {
      message: 'Cron job test successful',
      timestamp: new Date().toISOString(),
      receivedData: body,
      serverTime: new Date().toLocaleString(),
      randomId: Math.random().toString(36).substring(7)
    }

    return NextResponse.json(testData, { status: 200 })
  } catch (error) {
    console.error('Test endpoint error:', error)
    
    return NextResponse.json(
      { 
        error: 'Test failed',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}
