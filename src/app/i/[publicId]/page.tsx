'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading invoice...</p>
        </div>
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-destructive text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Invoice Not Found</h1>
          <p className="text-muted-foreground">The invoice you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  const statusText = getStatusText(invoice.status, invoice.dueDate)
  const subtotal = invoice.invoiceItems.reduce((sum, item) => sum + item.total, 0)
  const taxAmount = (subtotal * invoice.tax) / 100
  const finalTotal = subtotal + taxAmount - invoice.discount

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
        <Card className="overflow-hidden">
          {/* Header */}
          <CardContent className="px-8 py-6 border-b border-border">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-foreground">SwiftInvoice</h1>
                <p className="text-muted-foreground mt-1">Professional Invoicing</p>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold text-foreground">INVOICE</h2>
                <p className="text-muted-foreground">#{invoice.invoiceNumber}</p>
              </div>
            </div>
          </CardContent>

          {/* Invoice Details */}
          <CardContent className="px-8 py-6 border-b border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Bill To */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Bill To:</h3>
                <div className="text-foreground">
                  <p className="font-medium">{invoice.client.name}</p>
                  {invoice.client.companyName && (
                    <p className="text-muted-foreground">{invoice.client.companyName}</p>
                  )}
                  {invoice.client.address && (
                    <p className="text-muted-foreground">{invoice.client.address}</p>
                  )}
                  <p className="text-muted-foreground">{invoice.client.email}</p>
                  {invoice.client.taxId && (
                    <p className="text-muted-foreground">Tax ID: {invoice.client.taxId}</p>
                  )}
                </div>
              </div>
              
              {/* Invoice Info */}
              <div className="md:text-right">
                <h3 className="text-lg font-semibold text-foreground mb-3">Invoice Details:</h3>
                <div className="space-y-1 text-foreground">
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
          </CardContent>

          {/* Items Table */}
          <CardContent className="px-8 py-6">
            <div className="overflow-x-auto border border-border rounded-lg">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Unit Price</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border">
                  {invoice.invoiceItems.map((item, index) => (
                    <tr key={index} className="hover:bg-muted/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{item.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground text-right">{item.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground text-right">${item.unitPrice.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground text-right font-medium">${item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>

          {/* Totals */}
          <CardContent className="px-8 py-6 border-t border-border">
            <div className="flex justify-end">
              <div className="w-80">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Tax ({invoice.tax}%):</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Discount:</span>
                    <span>${invoice.discount.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-border pt-2 mt-3">
                    <div className="flex justify-between text-lg font-semibold text-foreground">
                      <span>Total:</span>
                      <span>${finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>


          {/* Footer */}
          <CardContent className="px-8 py-6 border-t border-border">
            <div className="text-center">
              <p className="text-muted-foreground italic">Thank you for your business!</p>
              <p className="text-sm text-muted-foreground mt-2">Generated by SwiftInvoice</p>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}
