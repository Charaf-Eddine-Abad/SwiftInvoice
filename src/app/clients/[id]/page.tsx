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
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
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
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Client not found</h1>
              <p className="mt-2 text-gray-600">The client you're looking for doesn't exist.</p>
              <Link
                href="/clients"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Clients
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link
                  href="/clients"
                  className="mr-4 text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeftIcon className="h-6 w-6" />
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Client Details
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Link
                  href={`/clients/${client.id}/edit`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Client
                </Link>
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete Client
                </button>
              </div>
            </div>
          </div>

          {/* Client Information */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Client Information
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Personal details and contact information.
              </p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <EnvelopeIcon className="h-4 w-4 mr-2" />
                    Email address
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {client.email}
                  </dd>
                </div>
                
                {client.companyName && (
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                      Company
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {client.companyName}
                    </dd>
                  </div>
                )}
                
                {client.address && (
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      Address
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {client.address}
                    </dd>
                  </div>
                )}
                
                {client.taxId && (
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <IdentificationIcon className="h-4 w-4 mr-2" />
                      Tax ID
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {client.taxId}
                    </dd>
                  </div>
                )}
                
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Created
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
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
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Delete Client
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete <strong>{client.name}</strong>? This action cannot be undone and will also delete all associated invoices.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
