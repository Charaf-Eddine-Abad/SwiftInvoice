import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/cron/recurring-simple - Simplified recurring invoices test
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

    const now = new Date()
    const results = []
    
    // Step 1: Find all active recurring invoices
    console.log('Step 1: Finding active recurring invoices...')
    const activeRecurringInvoices = await prisma.recurringInvoice.findMany({
      where: {
        isActive: true
      }
    })
    
    console.log(`Found ${activeRecurringInvoices.length} active recurring invoices`)
    
    // Step 2: Check which ones are due
    const dueRecurringInvoices = activeRecurringInvoices.filter(invoice => {
      return new Date(invoice.nextRunAt) <= now
    })
    
    console.log(`Found ${dueRecurringInvoices.length} due recurring invoices`)
    
    // Step 3: Process each due invoice (simplified)
    for (const recurringInvoice of dueRecurringInvoices) {
      try {
        console.log(`Processing recurring invoice ${recurringInvoice.id}...`)
        
        // Just return success for now - don't actually create invoices
        results.push({
          recurringInvoiceId: recurringInvoice.id,
          name: recurringInvoice.name,
          nextRunAt: recurringInvoice.nextRunAt,
          status: 'success (test mode)'
        })
        
      } catch (error) {
        console.error(`Error processing recurring invoice ${recurringInvoice.id}:`, error)
        results.push({
          recurringInvoiceId: recurringInvoice.id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      message: `Processed ${dueRecurringInvoices.length} recurring invoices (test mode)`,
      results,
      debug: {
        totalActive: activeRecurringInvoices.length,
        totalDue: dueRecurringInvoices.length,
        currentTime: now.toISOString()
      }
    })

  } catch (error) {
    console.error('Error in simplified recurring invoices cron job:', error)
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
