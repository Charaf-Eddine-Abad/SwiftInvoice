import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { passwordResetSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = passwordResetSchema.parse(body)
    
    // Find the password reset record
    const passwordReset = await prisma.passwordReset.findFirst({
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
    
    if (!passwordReset) {
      return NextResponse.json(
        { error: 'Invalid or expired reset code' },
        { status: 400 }
      )
    }
    
    // Hash new password
    const hashedPassword = await hashPassword(validatedData.password)
    
    // Update password and mark reset as used
    await prisma.$transaction([
      prisma.passwordReset.update({
        where: { id: passwordReset.id },
        data: { used: true }
      }),
      prisma.user.update({
        where: { id: passwordReset.userId },
        data: {
          password: hashedPassword
        }
      })
    ])
    
    return NextResponse.json(
      { 
        message: 'Password reset successfully'
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
