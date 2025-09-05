import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { emailVerificationSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = emailVerificationSchema.parse(body)
    
    // Find the verification record
    const verification = await prisma.emailVerification.findFirst({
      where: {
        email: validatedData.email,
        code: validatedData.code,
        used: false,
        expiresAt: {
          gt: new Date() // Not expired
        }
      },
      include: {
        user: true
      }
    })
    
    if (!verification) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      )
    }
    
    // Mark verification as used and update user
    await prisma.$transaction([
      prisma.emailVerification.update({
        where: { id: verification.id },
        data: { used: true }
      }),
      prisma.user.update({
        where: { id: verification.userId },
        data: {
          emailVerified: true,
          emailVerifiedAt: new Date()
        }
      })
    ])
    
    return NextResponse.json(
      { 
        message: 'Email verified successfully',
        user: {
          id: verification.user.id,
          name: verification.user.name,
          email: verification.user.email,
          emailVerified: true
        }
      },
      { status: 200 }
    )
    
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
