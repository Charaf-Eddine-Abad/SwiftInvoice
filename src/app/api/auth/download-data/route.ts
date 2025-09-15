import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all user data
    const userData = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        organization: true,
        invoiceCustomization: true,
        clients: true,
        invoices: {
          include: {
            client: true,
            invoiceItems: true
          }
        },
        expenses: true,
        recurringInvoices: {
          include: {
            client: true
          }
        },
        reminderPolicies: true
      }
    })

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Remove sensitive data
    const sanitizedData = {
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        emailVerified: userData.emailVerified,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      },
      organization: userData.organization,
      invoiceCustomization: userData.invoiceCustomization,
      clients: userData.clients,
      invoices: userData.invoices,
      expenses: userData.expenses,
      recurringInvoices: userData.recurringInvoices,
      reminderPolicies: userData.reminderPolicies,
      exportDate: new Date().toISOString(),
      dataVersion: '1.0'
    }

    // Create JSON response
    const jsonData = JSON.stringify(sanitizedData, null, 2)
    
    return new NextResponse(jsonData, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="my-data.json"'
      }
    })

  } catch (error) {
    console.error('Error downloading data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

