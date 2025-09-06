'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import InvoiceForm from '@/components/InvoiceForm'
import { InvoiceInput, InvoiceFormInput } from '@/lib/validations'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

interface Client {
  id: string
  name: string
  companyName?: string
}

export default function NewInvoicePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchClients()
  }, [session, status, router])

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients')
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: InvoiceFormInput) => {
    try {
      // Ensure tax and discount are numbers
      const processedData = {
        ...data,
        tax: data.tax || 0,
        discount: data.discount || 0,
      }
      
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processedData),
      })

      if (response.ok) {
        router.push('/invoices')
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create invoice')
      }
    } catch (error) {
      console.error('Error creating invoice:', error)
      alert('Failed to create invoice. Please try again.')
    }
  }

  const handleCancel = () => {
    router.push('/invoices')
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

  if (clients.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-8">
              <Link
                href="/invoices"
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Invoices
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Create New Invoice</h1>
            </div>

            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="text-center py-8">
                  <div className="mx-auto h-12 w-12 text-gray-400">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No clients available</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You need to create at least one client before you can create an invoice.
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/clients/new"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Add Your First Client
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <Link
              href="/invoices"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Invoices
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Create New Invoice</h1>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <InvoiceForm
                clients={clients}
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

