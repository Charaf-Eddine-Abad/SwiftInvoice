import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for user preferences
const preferencesSchema = z.object({
  defaultTaxRate: z.number().min(0).max(100),
  defaultDiscount: z.number().min(0)
})

// GET /api/user-preferences - Get user's preferences
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // For now, we'll store preferences in the user table
    // In the future, you might want to create a separate UserPreferences table
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        defaultTaxRate: true,
        defaultDiscount: true
      }
    })

    return NextResponse.json({ 
      preferences: {
        defaultTaxRate: user?.defaultTaxRate || 10,
        defaultDiscount: user?.defaultDiscount || 0
      }
    })
  } catch (error) {
    console.error('Error fetching preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/user-preferences - Update user's preferences
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = preferencesSchema.parse(body)

    // Update user preferences
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        defaultTaxRate: validatedData.defaultTaxRate,
        defaultDiscount: validatedData.defaultDiscount
      }
    })

    return NextResponse.json({ 
      message: 'Preferences saved successfully',
      preferences: {
        defaultTaxRate: updatedUser.defaultTaxRate,
        defaultDiscount: updatedUser.defaultDiscount
      }
    })
  } catch (error) {
    console.error('Error saving preferences:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

