import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { recurringInvoiceSchema } from '@/lib/validations'

// GET /api/recurring-invoices/[id] - Get a specific recurring invoice
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions) as { user: { id: string } } | null

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    const recurringInvoice = await prisma.recurringInvoice.findFirst({
      where: {
        id,
        userId: session.user.id
      },
      include: {
        client: true,
        lineItems: true
      }
    })

    if (!recurringInvoice) {
      return NextResponse.json(
        { error: 'Recurring invoice not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(recurringInvoice)
  } catch (error) {
    console.error('Error fetching recurring invoice:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/recurring-invoices/[id] - Update a recurring invoice
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions) as { user: { id: string } } | null

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = recurringInvoiceSchema.parse(body)

    // Check if recurring invoice exists and belongs to user
    const existingRecurringInvoice = await prisma.recurringInvoice.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!existingRecurringInvoice) {
      return NextResponse.json(
        { error: 'Recurring invoice not found' },
        { status: 404 }
      )
    }

    // Calculate next run date
    const startDate = new Date(validatedData.startDate)
    let nextRunAt = new Date(startDate)
    
    if (validatedData.frequency === 'WEEKLY') {
      nextRunAt.setDate(startDate.getDate() + (validatedData.interval * 7))
    } else if (validatedData.frequency === 'MONTHLY') {
      nextRunAt.setMonth(startDate.getMonth() + validatedData.interval)
    }

    // Update recurring invoice with line items in a transaction
    const updatedRecurringInvoice = await prisma.$transaction(async (tx) => {
      // Delete existing line items
      await tx.recurringLineItem.deleteMany({
        where: {
          recurringInvoiceId: id
        }
      })

      // Update recurring invoice
      const updatedInvoice = await tx.recurringInvoice.update({
        where: { id },
        data: {
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

      // Create new line items
      const lineItems = await Promise.all(
        validatedData.lineItems.map(item =>
          tx.recurringLineItem.create({
            data: {
              recurringInvoiceId: id,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.quantity * item.unitPrice,
            }
          })
        )
      )

      return { ...updatedInvoice, lineItems }
    })

    return NextResponse.json(updatedRecurringInvoice)
  } catch (error) {
    console.error('Error updating recurring invoice:', error)
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

// DELETE /api/recurring-invoices/[id] - Delete a recurring invoice
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions) as { user: { id: string } } | null

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check if recurring invoice exists and belongs to user
    const existingRecurringInvoice = await prisma.recurringInvoice.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!existingRecurringInvoice) {
      return NextResponse.json(
        { error: 'Recurring invoice not found' },
        { status: 404 }
      )
    }

    // Delete recurring invoice (line items will be deleted automatically due to cascade)
    await prisma.recurringInvoice.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Recurring invoice deleted successfully' })
  } catch (error) {
    console.error('Error deleting recurring invoice:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/recurring-invoices/[id] - Toggle active status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions) as { user: { id: string } } | null

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { isActive } = body

    // Check if recurring invoice exists and belongs to user
    const existingRecurringInvoice = await prisma.recurringInvoice.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!existingRecurringInvoice) {
      return NextResponse.json(
        { error: 'Recurring invoice not found' },
        { status: 404 }
      )
    }

    // Update active status
    const updatedRecurringInvoice = await prisma.recurringInvoice.update({
      where: { id },
      data: { isActive }
    })

    return NextResponse.json(updatedRecurringInvoice)
  } catch (error) {
    console.error('Error updating recurring invoice status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
