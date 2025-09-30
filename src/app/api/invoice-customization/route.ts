import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Helpers
const isDataUrl = (value: string) => /^data:image\/(png|jpeg|jpg|gif|webp);base64,[A-Za-z0-9+/=]+$/.test(value)
const isHttpUrl = (value: string) => {
  try { new URL(value); return true } catch { return false }
}

// Flexible validation (fields may be missing; we'll apply defaults)
const baseCustomizationSchema = z.object({
  logoUrl: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
  fontFamily: z.string().min(1, 'Font family is required'),
  templateStyle: z.enum(['modern', 'classic', 'minimal', 'professional']).optional(),
  showLogo: z.boolean().optional(),
  showCompanyInfo: z.boolean().optional(),
  footerText: z.string().optional(),
})

function withDefaults(input: z.infer<typeof baseCustomizationSchema>) {
  const logoUrl = input.logoUrl ?? ''
  if (logoUrl && !(isHttpUrl(logoUrl) || isDataUrl(logoUrl))) {
    throw new z.ZodError([{ code: 'custom', message: 'Invalid logo URL', path: ['logoUrl'] } as any])
  }
  return {
    logoUrl,
    primaryColor: input.primaryColor ?? '#2563eb',
    secondaryColor: input.secondaryColor ?? '#1e40af',
    accentColor: input.accentColor ?? '#3b82f6',
    fontFamily: input.fontFamily,
    templateStyle: input.templateStyle ?? 'modern',
    showLogo: input.showLogo ?? true,
    showCompanyInfo: input.showCompanyInfo ?? true,
    footerText: input.footerText ?? '',
  }
}

function isMissingCustomizationTable(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err)
  return msg.includes('invoice_customizations') && msg.includes('does not exist')
}

async function ensureCustomizationTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "invoice_customizations" (
      id text PRIMARY KEY,
      user_id text UNIQUE NOT NULL,
      logo_url text,
      primary_color text NOT NULL DEFAULT '#2563eb',
      secondary_color text NOT NULL DEFAULT '#1e40af',
      accent_color text NOT NULL DEFAULT '#3b82f6',
      font_family text NOT NULL DEFAULT 'Inter',
      template_style text NOT NULL DEFAULT 'modern',
      show_logo boolean NOT NULL DEFAULT true,
      show_company_info boolean NOT NULL DEFAULT true,
      footer_text text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `)
}

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

    let customization = null as any
    try {
      customization = await prisma.invoiceCustomization.findUnique({
        where: { userId: session.user.id }
      })
    } catch (e) {
      if (isMissingCustomizationTable(e)) {
        // Table missing in production DB. Return null (defaults will be used client-side).
        console.warn('invoice_customizations table missing; returning null customization')
        customization = null
      } else {
        throw e
      }
    }

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
    const parsed = baseCustomizationSchema.parse(body)
    const validatedData = withDefaults(parsed)

    // Check if customization already exists
    let existingCustomization = null as any
    try {
      existingCustomization = await prisma.invoiceCustomization.findUnique({
        where: { userId: session.user.id }
      })
    } catch (e) {
      if (isMissingCustomizationTable(e)) {
        // Attempt to create table once, then continue
        console.warn('invoice_customizations table missing; creating table now')
        await ensureCustomizationTable()
        existingCustomization = null
      } else {
        throw e
      }
    }

    let customization
    if (existingCustomization) {
      customization = await prisma.invoiceCustomization.update({
        where: { userId: session.user.id },
        data: validatedData
      })
    } else {
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

