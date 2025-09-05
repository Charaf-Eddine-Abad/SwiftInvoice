'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import ClientForm from '@/components/ClientForm'
import { ClientInput } from '@/lib/validations'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function NewClientPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
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
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <Link
              href="/clients"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Clients
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Add New Client</h1>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <ClientForm
                onSubmit={handleSubmit}
                onCancel={handleCancel}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

