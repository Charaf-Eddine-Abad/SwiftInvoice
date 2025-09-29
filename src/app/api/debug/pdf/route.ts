import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// Debug endpoint to test PDF generation prerequisites
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id?: string }> }
) {
  const debug = {
    step: 'init',
    session: false,
    database: false,
    invoice: false,
    user: false,
    errors: [] as string[]
  }

  try {
    // Test 1: Session
    debug.step = 'session'
    const session = await getServerSession(authOptions)
    debug.session = !!session?.user?.id
    
    if (!debug.session) {
      debug.errors.push('No valid session found')
      return NextResponse.json(debug, { status: 200 })
    }

    // Test 2: Database connection
    debug.step = 'database_connection'
    try {
      const testQuery = await prisma.$queryRaw`SELECT 1`
      debug.database = true
    } catch (dbError) {
      debug.database = false
      debug.errors.push(`Database connection failed: ${dbError instanceof Error ? dbError.message : 'Unknown'}`);
      return NextResponse.json(debug, { status: 200 })
    }

    // Test 3: User data
    debug.step = 'user_data'
    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          organization: true,
          invoiceCustomization: true
        }
      })
      debug.user = !!user
      
      if (!user) {
        debug.errors.push('User not found in database')
        return NextResponse.json(debug, { status: 200 })
      }

      // Test 4: Get first invoice for this user
      debug.step = 'invoice_query'
      const invoice = await prisma.invoice.findFirst({
        where: { userId: session.user.id },
        include: {
          client: true,
          invoiceItems: true,
          user: {
            include: {
              organization: true,
              invoiceCustomization: true
            }
          }
        }
      })

      debug.invoice = !!invoice
      
      if (invoice) {
        // Try to get specific details
        const invoiceDetails = {
          id: invoice.id,
          hasClient: !!invoice.client,
          clientName: invoice.client?.name || 'No client',
          itemsCount: invoice.invoiceItems?.length || 0,
          hasOrg: !!invoice.user?.organization,
          hasCustomization: !!invoice.user?.invoiceCustomization,
          invoiceNumber: invoice.invoiceNumber || 'No number'
        }
        
        return NextResponse.json({
          ...debug,
          invoiceDetails,
          success: true,
          message: 'All checks passed. Try printing invoice with ID: ' + invoice.id
        }, { status: 200 })
      } else {
        debug.errors.push('No invoices found for user')
      }

    } catch (userError) {
      debug.errors.push(`User query failed: ${userError instanceof Error ? userError.message : 'Unknown'}`)
    }

    return NextResponse.json(debug, { status: 200 })

  } catch (error) {
    debug.errors.push(`Fatal error: ${error instanceof Error ? error.message : 'Unknown'}`)
    return NextResponse.json(debug, { status: 200 })
  }
}
