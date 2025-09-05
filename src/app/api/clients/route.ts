import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { clientSchema } from '@/lib/validations'

// GET /api/clients - Get all clients for the authenticated user
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const clients = await prisma.client.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(clients)
    
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/clients - Create a new client
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
    const validatedData = clientSchema.parse(body)
    
    const client = await prisma.client.create({
      data: {
        ...validatedData,
        userId: session.user.id,
      }
    })
    
    return NextResponse.json(client, { status: 201 })
    
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

