'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import ClientForm from '@/components/ClientForm'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { ClientInput } from '@/lib/validations'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Client {
  id: string
  name: string
  email: string
  companyName?: string
  address?: string
  taxId?: string
  createdAt: string
  updatedAt: string
}

export default function EditClientPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const clientId = params.id as string
  
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (clientId) {
      fetchClient()
    }
  }, [session, status, router, clientId])

  const fetchClient = async () => {
    try {
      const response = await fetch(`/api/clients/${clientId}`)
      if (response.ok) {
        const data = await response.json()
        setClient(data)
      } else if (response.status === 404) {
        router.push('/clients')
      }
    } catch (error) {
      console.error('Error fetching client:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: ClientInput) => {
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push(`/clients/${clientId}`)
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update client')
      }
    } catch (error) {
      console.error('Error updating client:', error)
      throw error
    }
  }

  const handleCancel = () => {
    router.push(`/clients/${clientId}`)
  }

  if (status === 'loading' || loading) {
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
    return null
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">Client not found</h1>
              <p className="mt-2 text-muted-foreground">The client you're trying to edit doesn't exist.</p>
              <Button asChild className="mt-4">
                <Link href="/clients">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Clients
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" asChild className="mr-4">
                <Link href={`/clients/${client.id}`}>
                  <ArrowLeftIcon className="h-6 w-6" />
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Edit Client</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Update {client.name}'s information
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <Card>
            <CardContent className="p-6">
              <ClientForm
                client={client}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
