import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for invoice customization
const customizationSchema = z.object({
  logoUrl: z.string().url().optional().or(z.literal('')),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
  fontFamily: z.string().min(1, 'Font family is required'),
  templateStyle: z.enum(['modern', 'classic', 'minimal', 'professional']),
  showLogo: z.boolean(),
  showCompanyInfo: z.boolean(),
  footerText: z.string().optional(),
})

// GET /api/invoice-customization - Get user's invoice customization
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const customization = await prisma.invoiceCustomization.findUnique({
      where: { userId: session.user.id }
    })

    return NextResponse.json({ customization })
  } catch (error) {
    console.error('Error fetching invoice customization:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/invoice-customization - Create or update invoice customization
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
    const validatedData = customizationSchema.parse(body)

    // Check if customization already exists
    const existingCustomization = await prisma.invoiceCustomization.findUnique({
      where: { userId: session.user.id }
    })

    let customization
    if (existingCustomization) {
      // Update existing customization
      customization = await prisma.invoiceCustomization.update({
        where: { userId: session.user.id },
        data: validatedData
      })
    } else {
      // Create new customization
      customization = await prisma.invoiceCustomization.create({
        data: {
          ...validatedData,
          userId: session.user.id
        }
      })
    }

    return NextResponse.json({ 
      message: 'Invoice customization saved successfully',
      customization 
    })
  } catch (error) {
    console.error('Error saving invoice customization:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

