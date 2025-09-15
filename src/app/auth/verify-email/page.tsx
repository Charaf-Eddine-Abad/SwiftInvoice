'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { emailVerificationSchema, EmailVerificationInput } from '@/lib/validations'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function VerifyEmailForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailVerificationInput>({
    resolver: zodResolver(emailVerificationSchema),
    defaultValues: {
      email: email,
      code: '',
    }
  })

  const onSubmit = async (data: EmailVerificationInput) => {
    try {
      setIsSubmitting(true)
      setError('')
      setMessage('')

      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage('Email verified successfully! You can now sign in.')
        setTimeout(() => {
          router.push('/auth/signin')
        }, 2000)
      } else {
        setError(result.error || 'Verification failed')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary/10">
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <CardTitle className="text-3xl font-extrabold text-foreground">
              Verify Your Email
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              We've sent a 6-digit verification code to your email address
            </p>
          </CardHeader>
          
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground">
                    Email Address
                  </label>
                  <Input
                    {...register('email')}
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    className="mt-1"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-foreground">
                    Verification Code
                  </label>
                  <Input
                    {...register('code')}
                    type="text"
                    maxLength={6}
                    autoComplete="one-time-code"
                    className="mt-1 text-center text-lg tracking-widest"
                    placeholder="000000"
                  />
                  {errors.code && (
                    <p className="mt-1 text-sm text-destructive">{errors.code.message}</p>
                  )}
                </div>
              </div>

              {message && (
                <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4">
                  <div className="text-sm text-green-700 dark:text-green-400">{message}</div>
                </div>
              )}

              {error && (
                <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                  <div className="text-sm text-red-700 dark:text-red-400">{error}</div>
                </div>
              )}

              <div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? 'Verifying...' : 'Verify Email'}
                </Button>
              </div>

              <div className="text-center">
                <Button variant="ghost" asChild>
                  <Link href="/auth/signin">
                    Back to Sign In
                  </Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailForm />
    </Suspense>
  )
}
