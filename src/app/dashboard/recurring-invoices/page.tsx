'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface RecurringInvoice {
  id: string
  name: string
  description: string | null
  frequency: 'WEEKLY' | 'MONTHLY'
  interval: number
  startDate: string
  nextRunAt: string
  isActive: boolean
  tax: number
  discount: number
  client: {
    id: string
    name: string
    companyName: string | null
  }
  lineItems: Array<{
    id: string
    description: string
    quantity: number
    unitPrice: number
    total: number
  }>
}

export default function RecurringInvoicesPage() {
  const [recurringInvoices, setRecurringInvoices] = useState<RecurringInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRecurringInvoices()
  }, [])

  const fetchRecurringInvoices = async () => {
    try {
      const response = await fetch('/api/recurring-invoices')
      if (!response.ok) throw new Error('Failed to fetch recurring invoices')
      const data = await response.json()
      setRecurringInvoices(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const toggleActiveStatus = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/recurring-invoices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })
      if (!response.ok) throw new Error('Failed to update status')
      fetchRecurringInvoices()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status')
    }
  }

  const deleteRecurringInvoice = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recurring invoice?')) return
    
    try {
      const response = await fetch(`/api/recurring-invoices/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete recurring invoice')
      fetchRecurringInvoices()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete recurring invoice')
    }
  }

  const getFrequencyText = (frequency: string, interval: number) => {
    if (frequency === 'WEEKLY') {
      return interval === 1 ? 'Weekly' : `Every ${interval} weeks`
    } else {
      return interval === 1 ? 'Monthly' : `Every ${interval} months`
    }
  }

  const getTotalAmount = (lineItems: any[], tax: number, discount: number) => {
    const subtotal = lineItems.reduce((sum, item) => sum + Number(item.total), 0)
    const taxAmount = (subtotal * Number(tax)) / 100
    return subtotal + taxAmount - Number(discount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading recurring invoices...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Recurring Invoices</h1>
              <p className="mt-2 text-gray-600">Manage your automated invoice generation</p>
            </div>
            <div className="flex space-x-3">
              <Link
                href="/dashboard"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Back to Dashboard
              </Link>
              <Link
                href="/dashboard/recurring-invoices/new"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Create Recurring Invoice
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {recurringInvoices.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No recurring invoices</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new recurring invoice.</p>
            <div className="mt-6">
              <Link
                href="/dashboard/recurring-invoices/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Create Recurring Invoice
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {recurringInvoices.map((invoice) => (
              <div key={invoice.id} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{invoice.name}</h3>
                      <p className="text-sm text-gray-500">
                        Client: {invoice.client.name}
                        {invoice.client.companyName && ` (${invoice.client.companyName})`}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        invoice.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {invoice.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => toggleActiveStatus(invoice.id, invoice.isActive)}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                          invoice.isActive
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {invoice.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Frequency</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {getFrequencyText(invoice.frequency, invoice.interval)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Next Run</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(invoice.nextRunAt).toLocaleDateString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        ${getTotalAmount(invoice.lineItems, invoice.tax, invoice.discount).toFixed(2)}
                      </dd>
                    </div>
                  </div>

                  {invoice.description && (
                    <div className="mt-4">
                      <dt className="text-sm font-medium text-gray-500">Description</dt>
                      <dd className="mt-1 text-sm text-gray-900">{invoice.description}</dd>
                    </div>
                  )}

                  <div className="mt-4">
                    <dt className="text-sm font-medium text-gray-500 mb-2">Line Items</dt>
                    <div className="space-y-1">
                      {invoice.lineItems.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-900">{item.description}</span>
                          <span className="text-gray-500">
                            {Number(item.quantity)} × ${Number(item.unitPrice).toFixed(2)} = ${Number(item.total).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Created {new Date(invoice.startDate).toLocaleDateString()}
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        href={`/dashboard/recurring-invoices/${invoice.id}/edit`}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => deleteRecurringInvoice(invoice.id)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
