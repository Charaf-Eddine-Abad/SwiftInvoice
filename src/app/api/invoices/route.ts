import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { invoiceSchema } from '@/lib/validations'

// GET /api/invoices - Get all invoices for the authenticated user
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const invoices = await prisma.invoice.findMany({
      where: { userId: session.user.id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            companyName: true,
          }
        },
        invoiceItems: true,
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(invoices)
    
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/invoices - Create a new invoice
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const validatedData = invoiceSchema.parse(body)
    
    // Calculate total amount from items
    const itemsTotal = validatedData.items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice)
    }, 0)
    
    // Calculate final total with tax and discount
    const finalTotal = itemsTotal + validatedData.tax - validatedData.discount
    
    // Create invoice with items in a transaction with retry logic for unique constraint
    let invoice
    let retries = 0
    const maxRetries = 3
    
    while (retries < maxRetries) {
      try {
        invoice = await prisma.$transaction(async (tx) => {
          // Generate unique invoice number with retry logic for uniqueness
          let invoiceNumber
          let attempts = 0
          const maxAttempts = 10
          
          do {
            attempts++
            const invoiceCount = await tx.invoice.count({
              where: { userId: session.user.id }
            })
            invoiceNumber = `INV-${String(invoiceCount + attempts).padStart(4, '0')}`
            
            // Check if this invoice number already exists for this user
            const existingInvoice = await tx.invoice.findFirst({
              where: { 
                userId: session.user.id,
                invoiceNumber 
              }
            })
            
            if (!existingInvoice) {
              break // Found a unique number
            }
          } while (attempts < maxAttempts)
          
          if (attempts >= maxAttempts) {
            // Fallback to timestamp-based number if we can't find a sequential one
            const timestamp = Date.now()
            const userPrefix = session.user.id.slice(-4).toUpperCase()
            invoiceNumber = `INV-${userPrefix}-${timestamp}`
          }
          
          const newInvoice = await tx.invoice.create({
            data: {
              userId: session.user.id,
              clientId: validatedData.clientId,
              invoiceNumber,
              issueDate: new Date(validatedData.issueDate),
              dueDate: new Date(validatedData.dueDate),
              totalAmount: finalTotal,
              tax: validatedData.tax,
              discount: validatedData.discount,
            }
          })
          
          // Create invoice items
          const invoiceItems = await Promise.all(
            validatedData.items.map(item =>
              tx.invoiceItem.create({
                data: {
                  invoiceId: newInvoice.id,
                  description: item.description,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  total: item.quantity * item.unitPrice,
                }
              })
            )
          )
          
          return { ...newInvoice, invoiceItems }
        })
        
        // If we get here, the transaction succeeded
        break
        
      } catch (error) {
        retries++
        if (retries >= maxRetries) {
          throw error
        }
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 100 * retries))
      }
    }
    
    return NextResponse.json(invoice, { status: 201 })
    
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

