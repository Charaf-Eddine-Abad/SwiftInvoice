import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { expenseSchema } from '@/lib/validations'
import { unlink } from 'fs/promises'
import { join } from 'path'

// GET /api/expenses/[id] - Get a specific expense
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

    const expense = await prisma.expense.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(expense)
  } catch (error) {
    console.error('Error fetching expense:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/expenses/[id] - Update an expense
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
    const validatedData = expenseSchema.parse(body)

    // Check if expense exists and belongs to user
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!existingExpense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      )
    }

    // Delete old file if it exists and is different from new one
    if (existingExpense.receiptUrl && 
        existingExpense.receiptUrl.startsWith('/uploads/') && 
        existingExpense.receiptUrl !== validatedData.receiptUrl) {
      try {
        const filePath = join(process.cwd(), 'public', existingExpense.receiptUrl)
        await unlink(filePath)
        console.log(`Deleted old file: ${filePath}`)
      } catch (fileError) {
        console.error('Error deleting old file:', fileError)
        // Don't fail the update if file deletion fails
      }
    }

    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: {
        date: new Date(validatedData.date),
        amount: validatedData.amount,
        currency: validatedData.currency,
        category: validatedData.category,
        vendor: validatedData.vendor,
        description: validatedData.description,
        receiptUrl: validatedData.receiptUrl,
      }
    })

    return NextResponse.json(updatedExpense)
  } catch (error) {
    console.error('Error updating expense:', error)
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

// DELETE /api/expenses/[id] - Delete an expense
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

    // Check if expense exists and belongs to user
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!existingExpense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      )
    }

    // Delete the associated file if it exists and is a local file
    if (existingExpense.receiptUrl && existingExpense.receiptUrl.startsWith('/uploads/')) {
      try {
        const filePath = join(process.cwd(), 'public', existingExpense.receiptUrl)
        await unlink(filePath)
        console.log(`Deleted file: ${filePath}`)
      } catch (fileError) {
        console.error('Error deleting file:', fileError)
        // Don't fail the expense deletion if file deletion fails
      }
    }

    await prisma.expense.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Expense deleted successfully' })
  } catch (error) {
    console.error('Error deleting expense:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
