import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// Debug endpoint to test PDF generation prerequisites
export async function GET(request: NextRequest) {
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
    const userId = session?.user?.id
    debug.session = !!userId
    
    if (!userId) {
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
      let user: any
      try {
        user = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            organization: true,
            invoiceCustomization: true
          }
        })
      } catch (userIncludeError) {
        // Fallback: if org/customization tables missing
        const msg = userIncludeError instanceof Error ? userIncludeError.message : String(userIncludeError)
        if (msg.includes('does not exist') && (msg.includes('organizations') || msg.includes('invoice_customizations'))) {
          debug.errors.push('User include failed due to missing tables; using fallback user query')
          user = await prisma.user.findUnique({ where: { id: userId } })
        } else {
          throw userIncludeError
        }
      }
      debug.user = !!user
      
      if (!user) {
        debug.errors.push('User not found in database')
        return NextResponse.json(debug, { status: 200 })
      }

      // Test 4: Get first invoice for this user
      debug.step = 'invoice_query'
      let invoice: any
      try {
        invoice = await prisma.invoice.findFirst({
          where: { userId: userId },
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
      } catch (invIncludeError) {
        const msg = invIncludeError instanceof Error ? invIncludeError.message : String(invIncludeError)
        if (msg.includes('does not exist') && (msg.includes('organizations') || msg.includes('invoice_customizations'))) {
          debug.errors.push('Invoice include failed due to missing tables; using fallback invoice query')
          invoice = await prisma.invoice.findFirst({
            where: { userId: userId },
            include: {
              client: true,
              invoiceItems: true
            }
          })
        } else {
          throw invIncludeError
        }
      }

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
