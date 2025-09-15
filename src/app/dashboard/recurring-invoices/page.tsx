'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

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
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-foreground">Recurring Invoices</h1>
            <Button asChild>
              <Link href="/dashboard/recurring-invoices/new">
                Create Recurring Invoice
              </Link>
            </Button>
          </div>

          {/* Main Content */}
        {error && (
          <Card className="mb-6 border-destructive/20 bg-destructive/5">
            <CardContent className="p-4">
              <div className="text-sm text-destructive">{error}</div>
            </CardContent>
          </Card>
        )}

        {recurringInvoices.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-foreground">No recurring invoices</h3>
              <p className="mt-1 text-sm text-muted-foreground">Get started by creating a new recurring invoice.</p>
              <div className="mt-6">
                <Button asChild>
                  <Link href="/dashboard/recurring-invoices/new">
                    Create Recurring Invoice
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {recurringInvoices.map((invoice) => (
              <Card key={invoice.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{invoice.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
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
                      <Button
                        variant={invoice.isActive ? "destructive" : "default"}
                        size="sm"
                        onClick={() => toggleActiveStatus(invoice.id, invoice.isActive)}
                      >
                        {invoice.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Frequency</dt>
                      <dd className="mt-1 text-sm text-foreground">
                        {getFrequencyText(invoice.frequency, invoice.interval)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Next Run</dt>
                      <dd className="mt-1 text-sm text-foreground">
                        {new Date(invoice.nextRunAt).toLocaleDateString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Total Amount</dt>
                      <dd className="mt-1 text-sm text-foreground">
                        ${getTotalAmount(invoice.lineItems, invoice.tax, invoice.discount).toFixed(2)}
                      </dd>
                    </div>
                  </div>

                  {invoice.description && (
                    <div className="mt-4">
                      <dt className="text-sm font-medium text-muted-foreground">Description</dt>
                      <dd className="mt-1 text-sm text-foreground">{invoice.description}</dd>
                    </div>
                  )}

                  <div className="mt-4">
                    <dt className="text-sm font-medium text-muted-foreground mb-2">Line Items</dt>
                    <div className="space-y-1">
                      {invoice.lineItems.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-foreground">{item.description}</span>
                          <span className="text-muted-foreground">
                            {Number(item.quantity)} × ${Number(item.unitPrice).toFixed(2)} = ${Number(item.total).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>

                <div className="px-6 py-3 bg-muted border-t border-border">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Created {new Date(invoice.startDate).toLocaleDateString()}
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/recurring-invoices/${invoice.id}/edit`}>
                          Edit
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteRecurringInvoice(invoice.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
