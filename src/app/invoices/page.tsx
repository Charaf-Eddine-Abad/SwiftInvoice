'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
        
        // Find the invoice to get the invoice number
        const invoice = invoices.find(inv => inv.id === invoiceId)
        
        // Create a blob and download as HTML file
        const blob = new Blob([htmlContent], { type: 'text/html' })
        const url = window.URL.createObjectURL(blob)
        
        // Create a temporary link and trigger download
        const link = document.createElement('a')
        link.href = url
        link.download = `invoice-${invoice?.invoiceNumber || 'unknown'}.html`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // Clean up the URL object
        window.URL.revokeObjectURL(url)
        
        // Also open in new tab for printing
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
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to generate PDF:', response.status, response.statusText, errorData)
        alert(`Failed to generate PDF (${response.status}): ${errorData.error || response.statusText}`)
      }
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Error downloading PDF. Please check your connection and try again.')
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
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-foreground">Invoices</h1>
            <Button asChild>
              <Link href="/invoices/new">
                <PlusIcon className="h-4 w-4 mr-2" />
                Create New Invoice
              </Link>
            </Button>
          </div>

          {invoices.length > 0 ? (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <Card key={invoice.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-foreground truncate">
                            {invoice.invoiceNumber}
                          </p>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => downloadPDF(invoice.id)}
                              title="Download PDF"
                            >
                              <DocumentArrowDownIcon className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/invoices/${invoice.id}`} title="View Invoice">
                                <EyeIcon className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/invoices/${invoice.id}/edit`} title="Edit Invoice">
                                <PencilIcon className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConfirm(invoice.id)}
                              className="text-destructive hover:text-destructive"
                              title="Delete Invoice"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-muted-foreground">
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
                        <div className="mt-1 flex items-center text-sm text-muted-foreground">
                          <span>Issue: {new Date(invoice.issueDate).toLocaleDateString()}</span>
                          <span className="mx-2">•</span>
                          <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <div className="mx-auto h-12 w-12 text-muted-foreground">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="mt-2 text-sm font-medium text-foreground">No invoices</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Get started by creating your first invoice.
                </p>
                <div className="mt-6">
                  <Button asChild>
                    <Link href="/invoices/new">
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create Invoice
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Invoice</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this invoice? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => handleDelete(deleteConfirm!)}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

