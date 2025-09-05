'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { ArrowLeftIcon, DocumentArrowDownIcon, PencilIcon } from '@heroicons/react/24/outline'

interface InvoiceItem {
  id: string
  description: string
  quantity: number | string
  unitPrice: number | string
  total: number | string
}

interface InvoiceDetail {
  id: string
  invoiceNumber: string
  status: string
  issueDate: string
  dueDate: string
  tax: number | string
  discount: number | string
  totalAmount: number | string
  client: {
    id: string
    name: string
    companyName?: string | null
    address?: string | null
    email: string
    taxId?: string | null
  }
  invoiceItems: InvoiceItem[]
}

export default function InvoiceViewPage() {
  const { data: session, status } = useSession()
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }
    fetchInvoice()
  }, [session, status, router])

  const fetchInvoice = async () => {
    try {
      const res = await fetch(`/api/invoices/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setInvoice(data)
      }
    } catch (e) {
      console.error('Error loading invoice', e)
    } finally {
      setLoading(false)
    }
  }

  const formatMoney = (v: number | string | null | undefined) => {
    const n = Number(v)
    return `$${(Number.isNaN(n) ? 0 : n).toFixed(2)}`
  }

  const downloadPDF = async () => {
    try {
      const response = await fetch(`/api/invoices/${params.id}/pdf`)
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

  if (!session || !invoice) return null

  const subtotal = (invoice.invoiceItems || []).reduce((s, it) => s + Number(it.total || 0), 0)
  const taxAmount = (subtotal * Number(invoice.tax || 0)) / 100
  const finalTotal = subtotal + taxAmount - Number(invoice.discount || 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Link href="/invoices" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
                <ArrowLeftIcon className="h-4 w-4 mr-2" /> Back to Invoices
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 mt-2">Invoice {invoice.invoiceNumber}</h1>
              <p className="text-sm text-gray-500">Status: {invoice.status}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={downloadPDF} className="inline-flex items-center px-3 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm">
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" /> Download PDF
              </button>
              <Link href={`/invoices/${invoice.id}/edit`} className="inline-flex items-center px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm">
                <PencilIcon className="h-4 w-4 mr-2" /> Edit
              </Link>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">Bill To</h3>
                  <p className="mt-1 text-sm text-gray-900">{invoice.client.name}</p>
                  {invoice.client.companyName && <p className="text-sm text-gray-900">{invoice.client.companyName}</p>}
                  {invoice.client.address && <p className="text-sm text-gray-500">{invoice.client.address}</p>}
                  <p className="text-sm text-gray-500">{invoice.client.email}</p>
                  {invoice.client.taxId && <p className="text-sm text-gray-500">Tax ID: {invoice.client.taxId}</p>}
                </div>
                <div className="md:text-right">
                  <p className="text-sm text-gray-500">Issue Date: {new Date(invoice.issueDate).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-500">Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                  <p className="text-lg font-semibold mt-2">Total: {formatMoney(finalTotal)}</p>
                </div>
              </div>

              <div className="overflow-hidden border rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoice.invoiceItems.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 text-sm text-gray-900">{item.description}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-right">{Number(item.quantity)}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-right">{formatMoney(item.unitPrice)}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-right">{formatMoney(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 md:flex md:justify-end">
                <div className="w-full md:w-64 space-y-1">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatMoney(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tax ({Number(invoice.tax || 0)}%)</span>
                    <span>{formatMoney(taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Discount</span>
                    <span>{formatMoney(invoice.discount)}</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold text-gray-900 border-t pt-2 mt-2">
                    <span>Total</span>
                    <span>{formatMoney(finalTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


