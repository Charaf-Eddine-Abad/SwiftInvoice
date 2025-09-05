import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { passwordResetRequestSchema } from '@/lib/validations'
import { generateVerificationCode, sendPasswordResetEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = passwordResetRequestSchema.parse(body)
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })
    
    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { message: 'If an account with that email exists, a password reset code has been sent.' },
        { status: 200 }
      )
    }
    
    // Generate reset code
    const resetCode = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
    
    // Create password reset record
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        email: validatedData.email,
        code: resetCode,
        expiresAt: expiresAt,
      }
    })
    
    // Send password reset email
    try {
      await sendPasswordResetEmail(validatedData.email, resetCode)
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError)
      return NextResponse.json(
        { error: 'Failed to send reset email. Please try again.' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        message: 'If an account with that email exists, a password reset code has been sent.'
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
