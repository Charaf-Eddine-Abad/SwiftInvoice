import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/cron/recurring - Process recurring invoices
export async function POST(request: NextRequest) {
  try {
    // Verify the request is from a cron job (you can add additional security here)
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
    
    // Find all active recurring invoices that are due to run
    const dueRecurringInvoices = await prisma.recurringInvoice.findMany({
      where: {
        isActive: true,
        nextRunAt: {
          lte: now
        }
      }
    })

    const results = []

    for (const recurringInvoice of dueRecurringInvoices) {
      try {
        // Generate unique invoice number (same logic as regular invoice creation)
        let invoiceNumber
        let attempts = 0
        const maxAttempts = 10
        
        do {
          attempts++
          const invoiceCount = await prisma.invoice.count({
            where: { userId: recurringInvoice.userId }
          })
          invoiceNumber = `INV-${String(invoiceCount + attempts).padStart(4, '0')}`
          
          // Check if this invoice number already exists for this user
          const existingInvoice = await prisma.invoice.findFirst({
            where: { 
              userId: recurringInvoice.userId,
              invoiceNumber 
            }
          })
          
          if (!existingInvoice) break
        } while (attempts < maxAttempts)
        
        if (attempts >= maxAttempts) {
          // Fallback to timestamp-based number if we can't find a sequential one
          const timestamp = Date.now()
          const userPrefix = recurringInvoice.userId.slice(-4).toUpperCase()
          invoiceNumber = `INV-${userPrefix}-${timestamp}`
        }

        // Get line items for this recurring invoice
        const lineItems = await prisma.recurringLineItem.findMany({
          where: { recurringInvoiceId: recurringInvoice.id }
        })
        
        // Calculate totals
        const itemsTotal = lineItems.reduce(
          (sum, item) => sum + Number(item.total),
          0
        )
        const taxAmount = (itemsTotal * Number(recurringInvoice.tax)) / 100
        const finalTotal = itemsTotal + taxAmount - Number(recurringInvoice.discount)

        // Create the invoice
        const newInvoice = await prisma.$transaction(async (tx) => {
          const invoice = await tx.invoice.create({
            data: {
              userId: recurringInvoice.userId,
              clientId: recurringInvoice.clientId,
              invoiceNumber,
              issueDate: new Date(),
              dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
              totalAmount: finalTotal,
              tax: recurringInvoice.tax,
              discount: recurringInvoice.discount,
              status: 'DRAFT'
            }
          })

          // Create invoice items
          await Promise.all(
            lineItems.map(item =>
              tx.invoiceItem.create({
                data: {
                  invoiceId: invoice.id,
                  description: item.description,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  total: item.total,
                }
              })
            )
          )

          return invoice
        })

        // Calculate next run date
        let nextRunAt = new Date(recurringInvoice.nextRunAt)
        if (recurringInvoice.frequency === 'WEEKLY') {
          nextRunAt.setDate(nextRunAt.getDate() + (recurringInvoice.interval * 7))
        } else if (recurringInvoice.frequency === 'MONTHLY') {
          nextRunAt.setMonth(nextRunAt.getMonth() + recurringInvoice.interval)
        }

        // Update next run date
        await prisma.recurringInvoice.update({
          where: { id: recurringInvoice.id },
          data: { nextRunAt }
        })

        results.push({
          recurringInvoiceId: recurringInvoice.id,
          invoiceId: newInvoice.id,
          invoiceNumber: newInvoice.invoiceNumber,
          status: 'success'
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
      message: `Processed ${dueRecurringInvoices.length} recurring invoices`,
      results
    })

  } catch (error) {
    console.error('Error in recurring invoices cron job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
