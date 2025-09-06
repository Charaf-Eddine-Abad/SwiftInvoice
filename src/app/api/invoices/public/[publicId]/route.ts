import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/invoices/public/[publicId] - Get invoice by public ID (no auth required)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const { publicId } = await params

    const invoice = await prisma.invoice.findUnique({
      where: {
        publicId
      },
      include: {
        client: true,
        invoiceItems: true
      }
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Transform the data to ensure proper number types
    const transformedInvoice = {
      ...invoice,
      totalAmount: Number(invoice.totalAmount),
      tax: Number(invoice.tax),
      discount: Number(invoice.discount),
      invoiceItems: invoice.invoiceItems.map(item => ({
        ...item,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        total: Number(item.total)
      }))
    }

    return NextResponse.json(transformedInvoice)
  } catch (error) {
    console.error('Error fetching public invoice:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
