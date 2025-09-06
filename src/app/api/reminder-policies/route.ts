import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { reminderPolicySchema } from '@/lib/validations'

// GET /api/reminder-policies - Get all reminder policies for the user
export async function GET() {
  try {
    const session = await getServerSession(authOptions) as { user: { id: string } } | null

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const reminderPolicies = await prisma.reminderPolicy.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(reminderPolicies)
  } catch (error) {
    console.error('Error fetching reminder policies:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/reminder-policies - Create a new reminder policy
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
    const validatedData = reminderPolicySchema.parse(body)

    const reminderPolicy = await prisma.reminderPolicy.create({
      data: {
        userId: session.user.id,
        name: validatedData.name,
        reminderDays: validatedData.reminderDays,
        isActive: validatedData.isActive,
      }
    })

    return NextResponse.json(reminderPolicy, { status: 201 })
  } catch (error) {
    console.error('Error creating reminder policy:', error)
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
