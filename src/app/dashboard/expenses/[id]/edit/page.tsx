'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

const EXPENSE_CATEGORIES = [
  'OFFICE_SUPPLIES',
  'TRAVEL',
  'MEALS',
  'SOFTWARE',
  'MARKETING',
  'PROFESSIONAL_SERVICES',
  'UTILITIES',
  'RENT',
  'EQUIPMENT',
  'OTHER'
]

const CATEGORY_LABELS: Record<string, string> = {
  OFFICE_SUPPLIES: 'Office Supplies',
  TRAVEL: 'Travel',
  MEALS: 'Meals',
  SOFTWARE: 'Software',
  MARKETING: 'Marketing',
  PROFESSIONAL_SERVICES: 'Professional Services',
  UTILITIES: 'Utilities',
  RENT: 'Rent',
  EQUIPMENT: 'Equipment',
  OTHER: 'Other'
}

interface Expense {
  id: string
  date: string
  amount: number
  currency: string
  category: string
  vendor: string
  description: string
  receiptUrl: string | null
}

export default function EditExpensePage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expense, setExpense] = useState<Expense | null>(null)

  const [formData, setFormData] = useState({
    date: '',
    amount: '',
    currency: 'USD',
    category: 'OTHER',
    vendor: '',
    description: '',
    receiptUrl: ''
  })

  const [receiptType, setReceiptType] = useState<'url' | 'file'>('url')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchExpense()
    }
  }, [params.id])

  const fetchExpense = async () => {
    try {
      const response = await fetch(`/api/expenses/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch expense')
      const data = await response.json()
      setExpense(data)
      
      // Populate form with existing data
      setFormData({
        date: new Date(data.date).toISOString().split('T')[0],
        amount: data.amount.toString(),
        currency: data.currency,
        category: data.category,
        vendor: data.vendor,
        description: data.description,
        receiptUrl: data.receiptUrl || ''
      })

      // Set receipt type based on existing receipt
      if (data.receiptUrl) {
        setReceiptType(data.receiptUrl.startsWith('/uploads/') ? 'file' : 'url')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch expense')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let receiptUrl = formData.receiptUrl

      // Handle file upload if a file is selected
      if (receiptType === 'file' && receiptFile) {
        const uploadFormData = new FormData()
        uploadFormData.append('file', receiptFile)
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData
        })
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          receiptUrl = uploadData.url
        } else {
          throw new Error('Failed to upload receipt file')
        }
      }

      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
        receiptUrl: receiptUrl || undefined
      }

      console.log('Updating expense data:', expenseData)

      const response = await fetch(`/api/expenses/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Expense update error:', errorData)
        throw new Error(errorData.error || 'Failed to update expense')
      }

      router.push('/dashboard/expenses')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!expense) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading expense...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Edit Expense</h1>
              <p className="mt-2 text-gray-600">Update expense details</p>
            </div>
            <Link
              href="/dashboard/expenses"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Back to Expenses
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Expense Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Amount *
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="amount"
                    required
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    className="pl-7 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                  Currency
                </label>
                <select
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                </select>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category *
                </label>
                <select
                  id="category"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  {EXPENSE_CATEGORIES.map(category => (
                    <option key={category} value={category}>
                      {CATEGORY_LABELS[category]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="vendor" className="block text-sm font-medium text-gray-700">
                  Vendor *
                </label>
                <input
                  type="text"
                  id="vendor"
                  required
                  value={formData.vendor}
                  onChange={(e) => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., Amazon, Office Depot, etc."
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description *
                </label>
                <textarea
                  id="description"
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Describe what this expense was for..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Receipt (Optional)
                </label>
                
                {/* Receipt Type Selection */}
                <div className="flex space-x-4 mb-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="receiptType"
                      value="url"
                      checked={receiptType === 'url'}
                      onChange={(e) => setReceiptType(e.target.value as 'url' | 'file')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">URL Link</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="receiptType"
                      value="file"
                      checked={receiptType === 'file'}
                      onChange={(e) => setReceiptType(e.target.value as 'url' | 'file')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Upload File</span>
                  </label>
                </div>

                {/* Current Receipt Display */}
                {expense.receiptUrl && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-600 mb-2">Current receipt:</p>
                    {expense.receiptUrl.startsWith('/uploads/') ? (
                      <a
                        href={expense.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        📄 View current file
                      </a>
                    ) : (
                      <a
                        href={expense.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        🔗 {expense.receiptUrl}
                      </a>
                    )}
                  </div>
                )}

                {/* URL Input */}
                {receiptType === 'url' && (
                  <div>
                    <input
                      type="url"
                      id="receiptUrl"
                      value={formData.receiptUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, receiptUrl: e.target.value }))}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="https://example.com/receipt.pdf"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Link to a digital receipt or document
                    </p>
                  </div>
                )}

                {/* File Upload */}
                {receiptType === 'file' && (
                  <div>
                    <input
                      type="file"
                      id="receiptFile"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Upload a receipt file (PDF, JPG, PNG, DOC, DOCX)
                    </p>
                    {receiptFile && (
                      <p className="mt-1 text-sm text-green-600">
                        Selected: {receiptFile.name}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <Link
              href="/dashboard/expenses"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
