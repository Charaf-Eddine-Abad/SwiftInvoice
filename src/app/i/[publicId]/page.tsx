'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface Invoice {
  id: string
  invoiceNumber: string
  status: string
  issueDate: string
  dueDate: string
  totalAmount: number
  tax: number
  discount: number
  client: {
    name: string
    companyName: string | null
    address: string | null
    email: string
    taxId: string | null
  }
  invoiceItems: Array<{
    description: string
    quantity: number
    unitPrice: number
    total: number
  }>
}

export default function PublicInvoicePage() {
  const params = useParams()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await fetch(`/api/invoices/public/${params.publicId}`)
        if (!response.ok) {
          throw new Error('Invoice not found')
        }
        const data = await response.json()
        setInvoice(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load invoice')
      } finally {
        setLoading(false)
      }
    }

    if (params.publicId) {
      fetchInvoice()
    }
  }, [params.publicId])

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

  const getStatusText = (status: string, dueDate: string) => {
    const due = new Date(dueDate)
    const now = new Date()
    const daysDiff = Math.ceil((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))

    if (status === 'PAID') return 'PAID'
    if (status === 'OVERDUE' || daysDiff > 0) return 'OVERDUE'
    if (daysDiff === 0) return 'DUE TODAY'
    return 'DUE'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invoice...</p>
        </div>
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invoice Not Found</h1>
          <p className="text-gray-600">The invoice you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  const statusText = getStatusText(invoice.status, invoice.dueDate)
  const subtotal = invoice.invoiceItems.reduce((sum, item) => sum + item.total, 0)
  const taxAmount = (subtotal * invoice.tax) / 100
  const finalTotal = subtotal + taxAmount - invoice.discount

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white">SwiftInvoice</h1>
                <p className="text-blue-100 mt-1">Professional Invoicing</p>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold text-white">INVOICE</h2>
                <p className="text-blue-100">#{invoice.invoiceNumber}</p>
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Bill To */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill To:</h3>
                <div className="text-gray-700">
                  <p className="font-medium">{invoice.client.name}</p>
                  {invoice.client.companyName && (
                    <p className="text-gray-600">{invoice.client.companyName}</p>
                  )}
                  {invoice.client.address && (
                    <p className="text-gray-600">{invoice.client.address}</p>
                  )}
                  <p className="text-gray-600">{invoice.client.email}</p>
                  {invoice.client.taxId && (
                    <p className="text-gray-600">Tax ID: {invoice.client.taxId}</p>
                  )}
                </div>
              </div>
              
              {/* Invoice Info */}
              <div className="md:text-right">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Invoice Details:</h3>
                <div className="space-y-1 text-gray-700">
                  <p><span className="font-medium">Issue Date:</span> {new Date(invoice.issueDate).toLocaleDateString()}</p>
                  <p><span className="font-medium">Due Date:</span> {new Date(invoice.dueDate).toLocaleDateString()}</p>
                  <p><span className="font-medium">Status:</span> 
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-2 ${getStatusColor(statusText)}`}>
                      {statusText}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="px-8 py-6">
            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoice.invoiceItems.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{item.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">${item.unitPrice.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">${item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-end">
              <div className="w-80">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tax ({invoice.tax}%):</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Discount:</span>
                    <span>${invoice.discount.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 mt-3">
                    <div className="flex justify-between text-lg font-semibold text-gray-900">
                      <span>Total:</span>
                      <span>${finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="px-8 py-6 bg-blue-50 border-t border-blue-200">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Options</h3>
              <div className="space-y-4">
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors"
                  onClick={() => alert('Payment processing coming soon!')}
                >
                  Pay Now (Coming Soon)
                </button>
                <p className="text-sm text-gray-600">
                  Secure payment processing will be available soon. Contact us for alternative payment methods.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-gray-100 border-t border-gray-200">
            <div className="text-center">
              <p className="text-gray-600 italic">Thank you for your business!</p>
              <p className="text-sm text-gray-500 mt-2">Generated by SwiftInvoice</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
