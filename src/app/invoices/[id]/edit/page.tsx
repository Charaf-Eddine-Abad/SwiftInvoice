'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import InvoiceForm from '@/components/InvoiceForm'
import { InvoiceInput, InvoiceFormInput } from '@/lib/validations'

interface Client {
  id: string
  name: string
  companyName?: string
}

export default function EditInvoicePage() {
  const { data: session, status } = useSession()
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [initialInvoice, setInitialInvoice] = useState<InvoiceInput | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }
    Promise.all([fetchClients(), fetchInvoice()]).finally(() => setLoading(false))
  }, [session, status, router])

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients')
      if (res.ok) {
        setClients(await res.json())
      }
    } catch (e) {
      console.error('Error fetching clients', e)
    }
  }

  const fetchInvoice = async () => {
    try {
      const res = await fetch(`/api/invoices/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setInitialInvoice({
          clientId: data.clientId,
          issueDate: new Date(data.issueDate).toISOString().split('T')[0],
          dueDate: new Date(data.dueDate).toISOString().split('T')[0],
          tax: Number(data.tax || 0),
          discount: Number(data.discount || 0),
          items: (data.invoiceItems || []).map((it: any) => ({
            description: it.description,
            quantity: Number(it.quantity),
            unitPrice: Number(it.unitPrice),
          })),
        })
      }
    } catch (e) {
      console.error('Error fetching invoice', e)
    }
  }

  const handleSubmit = async (payload: InvoiceFormInput) => {
    try {
      // Ensure tax and discount are numbers
      const processedPayload = {
        ...payload,
        tax: payload.tax || 0,
        discount: payload.discount || 0,
      }
      
      const res = await fetch(`/api/invoices/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processedPayload),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to update invoice')
      }
      router.push(`/invoices/${params.id}`)
    } catch (e) {
      console.error(e)
      alert('Failed to update invoice. Please try again.')
    }
  }

  const handleCancel = () => router.push(`/invoices/${params.id}`)

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

  if (!session || !initialInvoice) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Invoice</h1>
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <InvoiceForm
                invoice={initialInvoice}
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


