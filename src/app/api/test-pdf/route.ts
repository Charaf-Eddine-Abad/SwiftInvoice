import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get the first invoice for this user
    const invoice = await prisma.invoice.findFirst({
      where: {
        userId: session.user.id
      },
      include: {
        client: true,
        invoiceItems: true,
        user: {
          include: {
            organization: true,
            invoiceCustomization: true,
          }
        },
      }
    })
    
    if (!invoice) {
      return NextResponse.json(
        { error: 'No invoices found for this user' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      message: 'Invoice found',
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        hasClient: !!invoice.client,
        hasItems: invoice.invoiceItems.length > 0,
        hasOrganization: !!invoice.user?.organization,
        hasCustomization: !!invoice.user?.invoiceCustomization,
        itemsCount: invoice.invoiceItems.length
      }
    })
    
  } catch (error) {
    console.error('Error in test PDF endpoint:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
