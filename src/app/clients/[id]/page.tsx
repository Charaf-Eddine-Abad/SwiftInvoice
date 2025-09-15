'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { 
  ArrowLeftIcon,
  PencilIcon, 
  TrashIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  IdentificationIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

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

export default function ClientDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const clientId = params.id as string
  
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

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

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.push('/clients')
      } else {
        console.error('Failed to delete client')
      }
    } catch (error) {
      console.error('Error deleting client:', error)
    }
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
            <Card>
              <CardContent className="text-center p-8">
                <h1 className="text-2xl font-bold text-foreground">Client not found</h1>
                <p className="mt-2 text-muted-foreground">The client you're looking for doesn't exist.</p>
                <Button asChild className="mt-4">
                  <Link href="/clients">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back to Clients
                  </Link>
                </Button>
              </CardContent>
            </Card>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Button variant="ghost" asChild>
                  <Link href="/clients">
                    <ArrowLeftIcon className="h-6 w-6" />
                  </Link>
                </Button>
                <div className="ml-4">
                  <h1 className="text-3xl font-bold text-foreground">{client.name}</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Client Details
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button variant="outline" asChild>
                  <Link href={`/clients/${client.id}/edit`}>
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit Client
                  </Link>
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteConfirm(true)}
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete Client
                </Button>
              </div>
            </div>
          </div>

          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle>
                Client Information
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Personal details and contact information.
              </p>
            </CardHeader>
            <CardContent>
              <dl>
                <div className="bg-muted px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-muted-foreground flex items-center">
                    <EnvelopeIcon className="h-4 w-4 mr-2" />
                    Email address
                  </dt>
                  <dd className="mt-1 text-sm text-foreground sm:mt-0 sm:col-span-2">
                    {client.email}
                  </dd>
                </div>
                
                {client.companyName && (
                  <div className="bg-background px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-muted-foreground flex items-center">
                      <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                      Company
                    </dt>
                    <dd className="mt-1 text-sm text-foreground sm:mt-0 sm:col-span-2">
                      {client.companyName}
                    </dd>
                  </div>
                )}
                
                {client.address && (
                  <div className="bg-muted px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-muted-foreground flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      Address
                    </dt>
                    <dd className="mt-1 text-sm text-foreground sm:mt-0 sm:col-span-2">
                      {client.address}
                    </dd>
                  </div>
                )}
                
                {client.taxId && (
                  <div className="bg-background px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-muted-foreground flex items-center">
                      <IdentificationIcon className="h-4 w-4 mr-2" />
                      Tax ID
                    </dt>
                    <dd className="mt-1 text-sm text-foreground sm:mt-0 sm:col-span-2">
                      {client.taxId}
                    </dd>
                  </div>
                )}
                
                <div className="bg-muted px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-muted-foreground flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Created
                  </dt>
                  <dd className="mt-1 text-sm text-foreground sm:mt-0 sm:col-span-2">
                    {new Date(client.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Delete Client
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{client.name}</strong>? This action cannot be undone and will also delete all associated invoices.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
