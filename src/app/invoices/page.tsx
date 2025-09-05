'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  DocumentArrowDownIcon 
} from '@heroicons/react/24/outline'

interface Invoice {
  id: string
  invoiceNumber: string
  client: {
    id: string
    name: string
    companyName?: string
  }
  status: string
  issueDate: string
  dueDate: string
  totalAmount: number | string
  createdAt: string
}

export default function InvoicesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchInvoices()
  }, [session, status, router])

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices')
      if (response.ok) {
        const data = await response.json()
        setInvoices(data)
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setInvoices(invoices.filter(invoice => invoice.id !== invoiceId))
        setDeleteConfirm(null)
      } else {
        console.error('Failed to delete invoice')
      }
    } catch (error) {
      console.error('Error deleting invoice:', error)
    }
  }

  const downloadPDF = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`)
      if (response.ok) {
        const htmlContent = await response.text()
        
        // Create a new window with the HTML content
        const printWindow = window.open('', '_blank')
        if (printWindow) {
          printWindow.document.write(htmlContent)
          printWindow.document.close()
          
          // Wait for content to load, then trigger print
          printWindow.onload = () => {
            printWindow.print()
            // Close the window after printing
            setTimeout(() => {
              printWindow.close()
            }, 1000)
          }
        }
      }
    } catch (error) {
      console.error('Error downloading PDF:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800'
      case 'SENT':
        return 'bg-blue-100 text-blue-800'
      case 'OVERDUE':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatAmount = (value: number | string | null | undefined) => {
    const n = Number(value)
    if (Number.isNaN(n)) return '$0.00'
    return `$${n.toFixed(2)}`
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
            <Link
              href="/invoices/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create New Invoice
            </Link>
          </div>

          {invoices.length > 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <li key={invoice.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {invoice.invoiceNumber}
                            </p>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => downloadPDF(invoice.id)}
                                className="text-green-600 hover:text-green-900"
                                title="Download PDF"
                              >
                                <DocumentArrowDownIcon className="h-4 w-4" />
                              </button>
                              <Link
                                href={`/invoices/${invoice.id}`}
                                className="text-blue-600 hover:text-blue-900"
                                title="View Invoice"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </Link>
                              <Link
                                href={`/invoices/${invoice.id}/edit`}
                                className="text-gray-600 hover:text-gray-900"
                                title="Edit Invoice"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </Link>
                              <button
                                onClick={() => setDeleteConfirm(invoice.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete Invoice"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <div className="flex items-center space-x-4">
                              <span>{invoice.client.name}</span>
                              {invoice.client.companyName && (
                                <span>• {invoice.client.companyName}</span>
                              )}
                              <span>• {formatAmount(invoice.totalAmount)}</span>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                                {invoice.status}
                              </span>
                            </div>
                          </div>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <span>Issue: {new Date(invoice.issueDate).toLocaleDateString()}</span>
                            <span className="mx-2">•</span>
                            <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first invoice.
              </p>
              <div className="mt-6">
                <Link
                  href="/invoices/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Invoice
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Delete Invoice
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete this invoice? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
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

