'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import ClientForm from '@/components/ClientForm'
import { ClientInput } from '@/lib/validations'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function NewClientPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    router.push('/auth/signin')
    return null
  }

  const handleSubmit = async (data: ClientInput) => {
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push('/clients')
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create client')
      }
    } catch (error) {
      console.error('Error creating client:', error)
      alert('Failed to create client. Please try again.')
    }
  }

  const handleCancel = () => {
    router.push('/clients')
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/clients">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Clients
              </Link>
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Add New Client</h1>
          </div>

          <Card>
            <CardContent className="p-6">
              <ClientForm
                onSubmit={handleSubmit}
                onCancel={handleCancel}
              />
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

