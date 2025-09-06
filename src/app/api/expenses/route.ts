import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { expenseSchema, expenseFilterSchema } from '@/lib/validations'

// GET /api/expenses - Get all expenses for the user with optional filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as { user: { id: string } } | null

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const filters = {
      category: searchParams.get('category') || undefined,
      vendor: searchParams.get('vendor') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      minAmount: searchParams.get('minAmount') ? parseFloat(searchParams.get('minAmount')!) : undefined,
      maxAmount: searchParams.get('maxAmount') ? parseFloat(searchParams.get('maxAmount')!) : undefined,
    }

    // Validate filters
    const validatedFilters = expenseFilterSchema.parse(filters)

    // Build where clause
    const where: any = {
      userId: session.user.id
    }

    if (validatedFilters.category) {
      where.category = validatedFilters.category
    }

    if (validatedFilters.vendor) {
      where.vendor = {
        contains: validatedFilters.vendor,
        mode: 'insensitive'
      }
    }

    if (validatedFilters.startDate || validatedFilters.endDate) {
      where.date = {}
      if (validatedFilters.startDate) {
        where.date.gte = new Date(validatedFilters.startDate)
      }
      if (validatedFilters.endDate) {
        where.date.lte = new Date(validatedFilters.endDate)
      }
    }

    if (validatedFilters.minAmount !== undefined || validatedFilters.maxAmount !== undefined) {
      where.amount = {}
      if (validatedFilters.minAmount !== undefined) {
        where.amount.gte = validatedFilters.minAmount
      }
      if (validatedFilters.maxAmount !== undefined) {
        where.amount.lte = validatedFilters.maxAmount
      }
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: {
        date: 'desc'
      }
    })

    // Calculate summary statistics
    const totalAmount = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0)
    const categoryStats = expenses.reduce((acc, expense) => {
      const category = expense.category
      if (!acc[category]) {
        acc[category] = { count: 0, total: 0 }
      }
      acc[category].count++
      acc[category].total += Number(expense.amount)
      return acc
    }, {} as Record<string, { count: number; total: number }>)

    return NextResponse.json({
      expenses,
      summary: {
        totalAmount,
        totalCount: expenses.length,
        categoryStats
      }
    })
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/expenses - Create a new expense
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
    const validatedData = expenseSchema.parse(body)

    const expense = await prisma.expense.create({
      data: {
        userId: session.user.id,
        date: new Date(validatedData.date),
        amount: validatedData.amount,
        currency: validatedData.currency,
        category: validatedData.category,
        vendor: validatedData.vendor,
        description: validatedData.description,
        receiptUrl: validatedData.receiptUrl,
      }
    })

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    console.error('Error creating expense:', error)
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
