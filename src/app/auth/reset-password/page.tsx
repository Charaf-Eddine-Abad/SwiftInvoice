'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { passwordResetSchema, PasswordResetInput } from '@/lib/validations'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function ResetPasswordForm() {
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
  } = useForm<PasswordResetInput>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      email: email,
      code: '',
      password: '',
    }
  })

  const onSubmit = async (data: PasswordResetInput) => {
    try {
      setIsSubmitting(true)
      setError('')
      setMessage('')

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage('Password reset successfully! You can now sign in with your new password.')
        setTimeout(() => {
          router.push('/auth/signin')
        }, 2000)
      } else {
        setError(result.error || 'Password reset failed')
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <CardTitle className="text-3xl font-extrabold text-foreground">
              Reset Password
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Enter the code sent to your email and your new password
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
                    Reset Code
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

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-foreground">
                    New Password
                  </label>
                  <Input
                    {...register('password')}
                    type="password"
                    autoComplete="new-password"
                    placeholder="Enter new password"
                    className="mt-1"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
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
                  {isSubmitting ? 'Resetting...' : 'Reset Password'}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
