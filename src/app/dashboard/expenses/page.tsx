'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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

interface ExpenseSummary {
  totalAmount: number
  totalCount: number
  categoryStats: Record<string, { count: number; total: number }>
}

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

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [summary, setSummary] = useState<ExpenseSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [filters, setFilters] = useState({
    category: '',
    vendor: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: ''
  })

  // Initial load
  useEffect(() => {
    fetchExpenses(true)
  }, [])

  // Debounced search effect
  useEffect(() => {
    setSearching(true)
    const timeoutId = setTimeout(() => {
      fetchExpenses(false)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [filters])

  const fetchExpenses = async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true)
      }
      
      const params = new URLSearchParams()
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.trim() !== '') params.append(key, value.trim())
      })

      const response = await fetch(`/api/expenses?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch expenses')
      
      const data = await response.json()
      
      // Smooth state updates to prevent UI "refresh" feeling
      setExpenses(data.expenses || [])
      setSummary(data.summary || { totalAmount: 0, totalCount: 0, categoryStats: {} })
      setError(null) // Clear any previous errors
    } catch (err) {
      console.error('Error fetching expenses:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
      // Don't clear expenses on error, keep previous results
    } finally {
      if (isInitialLoad) {
        setLoading(false)
      }
      setSearching(false)
    }
  }

  const deleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return
    
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete expense')
      fetchExpenses(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete expense')
    }
  }

  const clearFilters = () => {
    setFilters({
      category: '',
      vendor: '',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: ''
    })
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  if (loading && expenses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading expenses...</p>
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
            <h1 className="text-3xl font-bold text-foreground">Expenses</h1>
            <Button asChild>
              <Link href="/dashboard/expenses/new">
                Add Expense
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

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-muted-foreground truncate">Total Amount</dt>
                      <dd className="text-lg font-medium text-foreground">${summary.totalAmount.toFixed(2)}</dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-muted-foreground truncate">Total Expenses</dt>
                      <dd className="text-lg font-medium text-foreground">{summary.totalCount}</dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-muted-foreground truncate">Categories</dt>
                      <dd className="text-lg font-medium text-foreground">{Object.keys(summary.categoryStats).length}</dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Filters</CardTitle>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear all filters
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-foreground">
                Category
              </label>
              <select
                id="category"
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="mt-1 block w-full border-input rounded-md shadow-sm focus:ring-ring focus:border-ring sm:text-sm bg-background"
              >
                <option value="">All categories</option>
                {EXPENSE_CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {CATEGORY_LABELS[category]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="vendor" className="block text-sm font-medium text-foreground">
                Vendor
              </label>
              <Input
                type="text"
                id="vendor"
                value={filters.vendor}
                onChange={(e) => setFilters(prev => ({ ...prev, vendor: e.target.value }))}
                placeholder="Search by vendor"
              />
            </div>

            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-foreground">
                Start Date
              </label>
              <Input
                type="date"
                id="startDate"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-foreground">
                End Date
              </label>
              <Input
                type="date"
                id="endDate"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>

            <div>
              <label htmlFor="minAmount" className="block text-sm font-medium text-foreground">
                Min Amount
              </label>
              <Input
                type="number"
                id="minAmount"
                min="0"
                step="0.01"
                value={filters.minAmount}
                onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                placeholder="0.00"
              />
            </div>

            <div>
              <label htmlFor="maxAmount" className="block text-sm font-medium text-foreground">
                Max Amount
              </label>
              <Input
                type="number"
                id="maxAmount"
                min="0"
                step="0.01"
                value={filters.maxAmount}
                onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                placeholder="0.00"
              />
            </div>
          </div>
          </CardContent>
        </Card>

        {/* Search Indicator */}
        {searching && expenses.length > 0 && (
          <div className="mb-4 flex items-center justify-center">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span>Searching...</span>
            </div>
          </div>
        )}

        {/* Expenses List */}
        {expenses.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-foreground">No expenses found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {hasActiveFilters ? 'Try adjusting your filters or' : 'Get started by adding your first expense.'}
              </p>
              <div className="mt-6">
                <Button asChild>
                  <Link href="/dashboard/expenses/new">
                    Add Expense
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div>
            {/* Results Count */}
            <div className="mb-4 text-sm text-muted-foreground">
              {hasActiveFilters ? (
                <span>Found {expenses.length} expense{expenses.length !== 1 ? 's' : ''} matching your filters</span>
              ) : (
                <span>Showing {expenses.length} expense{expenses.length !== 1 ? 's' : ''}</span>
              )}
            </div>

            <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
              <ul className="divide-y divide-border">
              {expenses.map((expense) => (
                <li key={expense.id} className="hover:bg-muted/50 transition-colors">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground truncate">
                              {expense.description}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {expense.vendor} • {CATEGORY_LABELS[expense.category]}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-foreground">
                              ${Number(expense.amount).toFixed(2)} {expense.currency}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(expense.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex items-center space-x-2">
                        {expense.receiptUrl && (
                          <a
                            href={expense.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 text-sm"
                          >
                            Receipt
                          </a>
                        )}
                        <Link
                          href={`/dashboard/expenses/${expense.id}/edit`}
                          className="text-primary hover:text-primary/80 text-sm"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => deleteExpense(expense.id)}
                          className="text-destructive hover:text-destructive/80 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
