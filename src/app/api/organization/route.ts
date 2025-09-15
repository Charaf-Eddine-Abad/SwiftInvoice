import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for organization data
const organizationSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  industry: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().default('US'),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional().or(z.literal('')),
  taxId: z.string().optional(),
  currency: z.string().default('USD'),
  timezone: z.string().default('UTC'),
  language: z.string().default('en'),
})

// GET /api/organization - Get user's organization
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const organization = await prisma.organization.findUnique({
      where: { userId: session.user.id }
    })

    return NextResponse.json({ organization })
  } catch (error) {
    console.error('Error fetching organization:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/organization - Create or update organization
export async function POST(request: NextRequest) {
  return handleOrganizationRequest(request, 'POST')
}

// PUT /api/organization - Update organization
export async function PUT(request: NextRequest) {
  return handleOrganizationRequest(request, 'PUT')
}

async function handleOrganizationRequest(request: NextRequest, method: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = organizationSchema.parse(body)

    // Check if organization already exists
    const existingOrg = await prisma.organization.findUnique({
      where: { userId: session.user.id }
    })

    let organization
    if (existingOrg) {
      // Update existing organization
      organization = await prisma.organization.update({
        where: { userId: session.user.id },
        data: validatedData
      })
    } else {
      // Create new organization
      organization = await prisma.organization.create({
        data: {
          ...validatedData,
          userId: session.user.id
        }
      })
    }

    return NextResponse.json({ 
      message: 'Organization saved successfully',
      organization 
    })
  } catch (error) {
    console.error('Error saving organization:', error)
    
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
