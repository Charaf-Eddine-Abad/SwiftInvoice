import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { userRegistrationSchema } from '@/lib/validations'
import { generateVerificationCode, sendVerificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = userRegistrationSchema.parse(body)
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }
    
    // Hash password
    const hashedPassword = await hashPassword(validatedData.password)
    
    // Generate verification code
    const verificationCode = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
    
    // Create user with email verification
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        emailVerified: false,
        emailVerifications: {
          create: {
            email: validatedData.email,
            code: verificationCode,
            expiresAt: expiresAt,
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        createdAt: true,
      }
    })
    
    // Send verification email
    try {
      await sendVerificationEmail(validatedData.email, verificationCode)
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      // Don't fail registration if email fails, but log the error
    }
    
    return NextResponse.json(
      { 
        message: 'User created successfully. Please check your email for verification code.',
        user,
        requiresVerification: true
      },
      { status: 201 }
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

