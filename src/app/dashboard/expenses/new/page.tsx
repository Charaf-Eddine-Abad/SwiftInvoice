'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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

export default function NewExpensePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    currency: 'USD',
    category: 'OTHER',
    vendor: '',
    description: '',
    receiptUrl: ''
  })

  const [receiptType, setReceiptType] = useState<'url' | 'file'>('url')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)

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

      console.log('Sending expense data:', expenseData)

      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Expense creation error:', errorData)
        throw new Error(errorData.error || 'Failed to create expense')
      }

      router.push('/dashboard/expenses')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Add Expense</h1>
              <p className="mt-2 text-muted-foreground">Track a new business expense</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/dashboard/expenses">
                Back to Expenses
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Card className="mb-6 border-destructive/20 bg-destructive/5">
            <CardContent className="p-4">
              <div className="text-sm text-destructive">{error}</div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Expense Details</CardTitle>
            </CardHeader>
            <CardContent>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-foreground">
                  Date *
                </label>
                <Input
                  type="date"
                  id="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-foreground">
                  Amount *
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-muted-foreground sm:text-sm">$</span>
                  </div>
                  <Input
                    type="number"
                    id="amount"
                    required
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    className="pl-7"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-foreground">
                  Currency
                </label>
                <select
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                  className="mt-1 block w-full border-input rounded-md shadow-sm focus:ring-ring focus:border-ring bg-background"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                </select>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-foreground">
                  Category *
                </label>
                <select
                  id="category"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="mt-1 block w-full border-input rounded-md shadow-sm focus:ring-ring focus:border-ring bg-background"
                >
                  {EXPENSE_CATEGORIES.map(category => (
                    <option key={category} value={category}>
                      {CATEGORY_LABELS[category]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="vendor" className="block text-sm font-medium text-foreground">
                  Vendor *
                </label>
                <Input
                  type="text"
                  id="vendor"
                  required
                  value={formData.vendor}
                  onChange={(e) => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
                  className="mt-1"
                  placeholder="e.g., Amazon, Office Depot, etc."
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-foreground">
                  Description *
                </label>
                <textarea
                  id="description"
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1 block w-full border-input rounded-md shadow-sm focus:ring-ring focus:border-ring bg-background text-foreground"
                  placeholder="Describe what this expense was for..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
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
                      className="h-4 w-4 text-primary focus:ring-primary border-input"
                    />
                    <span className="ml-2 text-sm text-foreground">URL Link</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="receiptType"
                      value="file"
                      checked={receiptType === 'file'}
                      onChange={(e) => setReceiptType(e.target.value as 'url' | 'file')}
                      className="h-4 w-4 text-primary focus:ring-primary border-input"
                    />
                    <span className="ml-2 text-sm text-foreground">Upload File</span>
                  </label>
                </div>

                {/* URL Input */}
                {receiptType === 'url' && (
                  <div>
                    <Input
                      type="url"
                      id="receiptUrl"
                      value={formData.receiptUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, receiptUrl: e.target.value }))}
                      placeholder="https://example.com/receipt.pdf"
                    />
                    <p className="mt-1 text-sm text-muted-foreground">
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
                      className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    />
                    <p className="mt-1 text-sm text-muted-foreground">
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
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" asChild>
              <Link href="/dashboard/expenses">
                Cancel
              </Link>
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
