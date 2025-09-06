import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { reminderPolicySchema } from '@/lib/validations'

// GET /api/reminder-policies/[id] - Get a specific reminder policy
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

    const reminderPolicy = await prisma.reminderPolicy.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!reminderPolicy) {
      return NextResponse.json(
        { error: 'Reminder policy not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(reminderPolicy)
  } catch (error) {
    console.error('Error fetching reminder policy:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/reminder-policies/[id] - Update a reminder policy
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
    const validatedData = reminderPolicySchema.parse(body)

    // Check if reminder policy exists and belongs to user
    const existingReminderPolicy = await prisma.reminderPolicy.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!existingReminderPolicy) {
      return NextResponse.json(
        { error: 'Reminder policy not found' },
        { status: 404 }
      )
    }

    const updatedReminderPolicy = await prisma.reminderPolicy.update({
      where: { id },
      data: {
        name: validatedData.name,
        reminderDays: validatedData.reminderDays,
        isActive: validatedData.isActive,
      }
    })

    return NextResponse.json(updatedReminderPolicy)
  } catch (error) {
    console.error('Error updating reminder policy:', error)
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

// DELETE /api/reminder-policies/[id] - Delete a reminder policy
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

    // Check if reminder policy exists and belongs to user
    const existingReminderPolicy = await prisma.reminderPolicy.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!existingReminderPolicy) {
      return NextResponse.json(
        { error: 'Reminder policy not found' },
        { status: 404 }
      )
    }

    await prisma.reminderPolicy.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Reminder policy deleted successfully' })
  } catch (error) {
    console.error('Error deleting reminder policy:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
