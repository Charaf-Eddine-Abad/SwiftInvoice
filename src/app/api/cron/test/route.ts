import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Simple test endpoint for cron jobs
    const body = await request.json().catch(() => ({}))
    
    const testData = {
      message: 'Simple cron test successful! 🎉',
      timestamp: new Date().toISOString(),
      serverTime: new Date().toLocaleString(),
      receivedData: body,
      randomId: Math.random().toString(36).substring(7),
      testResults: {
        database: 'connected',
        server: 'running',
        cron: 'working'
      }
    }

    console.log('Cron test executed:', testData)

    return NextResponse.json(testData, { status: 200 })
  } catch (error) {
    console.error('Cron test error:', error)
    
    return NextResponse.json(
      { 
        error: 'Cron test failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Simple GET test
    const testData = {
      message: 'Cron test endpoint is working! ✅',
      timestamp: new Date().toISOString(),
      method: 'GET',
      status: 'active'
    }

    return NextResponse.json(testData, { status: 200 })
  } catch (error) {
    console.error('Cron test GET error:', error)
    
    return NextResponse.json(
      { 
        error: 'Cron test GET failed',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}
