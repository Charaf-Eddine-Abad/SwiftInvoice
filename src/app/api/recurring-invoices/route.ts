import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { recurringInvoiceSchema } from '@/lib/validations'

// GET /api/recurring-invoices - Get all recurring invoices for the user
export async function GET() {
  try {
    const session = await getServerSession(authOptions) as { user: { id: string } } | null

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const recurringInvoices = await prisma.recurringInvoice.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        client: true,
        lineItems: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(recurringInvoices)
  } catch (error) {
    console.error('Error fetching recurring invoices:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/recurring-invoices - Create a new recurring invoice
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as { user: { id: string } } | null

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = recurringInvoiceSchema.parse(body)

    // Calculate next run date
    const startDate = new Date(validatedData.startDate)
    let nextRunAt = new Date(startDate)
    
    if (validatedData.frequency === 'WEEKLY') {
      nextRunAt.setDate(startDate.getDate() + (validatedData.interval * 7))
    } else if (validatedData.frequency === 'MONTHLY') {
      nextRunAt.setMonth(startDate.getMonth() + validatedData.interval)
    }

    // Create recurring invoice with line items in a transaction
    const recurringInvoice = await prisma.$transaction(async (tx) => {
      const newRecurringInvoice = await tx.recurringInvoice.create({
        data: {
          userId: session.user.id,
          clientId: validatedData.clientId,
          name: validatedData.name,
          description: validatedData.description,
          frequency: validatedData.frequency,
          interval: validatedData.interval,
          startDate: startDate,
          nextRunAt: nextRunAt,
          tax: validatedData.tax,
          discount: validatedData.discount,
        }
      })

      const lineItems = await Promise.all(
        validatedData.lineItems.map(item =>
          tx.recurringLineItem.create({
            data: {
              recurringInvoiceId: newRecurringInvoice.id,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.quantity * item.unitPrice,
            }
          })
        )
      )

      return { ...newRecurringInvoice, lineItems }
    })

    return NextResponse.json(recurringInvoice, { status: 201 })
  } catch (error) {
    console.error('Error creating recurring invoice:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
