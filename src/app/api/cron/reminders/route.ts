import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendInvoiceReminderEmail } from '@/lib/reminder-email'

// POST /api/cron/reminders - Process invoice reminders
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

    // Get all active reminder policies
    const reminderPolicies = await prisma.reminderPolicy.findMany({
      where: {
        isActive: true
      },
      include: {
        user: true
      }
    })

    for (const policy of reminderPolicies) {
      for (const reminderDay of policy.reminderDays) {
        // Calculate the date for this reminder
        const reminderDate = new Date(now)
        reminderDate.setDate(now.getDate() - reminderDay)

        // Find overdue invoices that need reminders
        const overdueInvoices = await prisma.invoice.findMany({
          where: {
            userId: policy.userId,
            status: {
              in: ['SENT', 'OVERDUE']
            },
            dueDate: {
              lte: reminderDate
            }
          },
          include: {
            client: true,
            user: true
          }
        })

        for (const invoice of overdueInvoices) {
          try {
            // Check if we've already sent a reminder for this invoice on this day
            // (You might want to add a ReminderLog table to track this)
            
            // Send reminder email
            await sendInvoiceReminderEmail(
              invoice.client.email,
              invoice,
              reminderDay
            )

            // Update invoice status to OVERDUE if it's past due date
            if (invoice.status === 'SENT' && invoice.dueDate < now) {
              await prisma.invoice.update({
                where: { id: invoice.id },
                data: { status: 'OVERDUE' }
              })
            }

            results.push({
              invoiceId: invoice.id,
              invoiceNumber: invoice.invoiceNumber,
              clientEmail: invoice.client.email,
              reminderDay,
              status: 'success'
            })

          } catch (error) {
            console.error(`Error sending reminder for invoice ${invoice.id}:`, error)
            results.push({
              invoiceId: invoice.id,
              invoiceNumber: invoice.invoiceNumber,
              clientEmail: invoice.client.email,
              reminderDay,
              status: 'error',
              error: error instanceof Error ? error.message : 'Unknown error'
            })
          }
        }
      }
    }

    return NextResponse.json({
      message: `Processed reminders for ${results.length} invoices`,
      results
    })

  } catch (error) {
    console.error('Error in reminders cron job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
