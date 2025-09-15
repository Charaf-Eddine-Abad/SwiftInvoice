'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface ReminderPolicy {
  id: string
  name: string
  reminderDays: number[]
  isActive: boolean
  createdAt: string
}

export default function RemindersPage() {
  const [reminderPolicies, setReminderPolicies] = useState<ReminderPolicy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    reminderDays: [0, 3, 7] as number[],
    isActive: true
  })

  useEffect(() => {
    fetchReminderPolicies()
  }, [])

  const fetchReminderPolicies = async () => {
    try {
      const response = await fetch('/api/reminder-policies')
      if (!response.ok) throw new Error('Failed to fetch reminder policies')
      const data = await response.json()
      setReminderPolicies(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/reminder-policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create reminder policy')
      }

      setShowCreateForm(false)
      setFormData({ name: '', reminderDays: [0, 3, 7], isActive: true })
      fetchReminderPolicies()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const deleteReminderPolicy = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reminder policy?')) return
    
    try {
      const response = await fetch(`/api/reminder-policies/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete reminder policy')
      fetchReminderPolicies()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete reminder policy')
    }
  }

  const addReminderDay = () => {
    setFormData(prev => ({
      ...prev,
      reminderDays: [...prev.reminderDays, 0]
    }))
  }

  const removeReminderDay = (index: number) => {
    if (formData.reminderDays.length > 1) {
      setFormData(prev => ({
        ...prev,
        reminderDays: prev.reminderDays.filter((_, i) => i !== index)
      }))
    }
  }

  const updateReminderDay = (index: number, value: number) => {
    setFormData(prev => ({
      ...prev,
      reminderDays: prev.reminderDays.map((day, i) => i === index ? value : day)
    }))
  }

  const getReminderText = (days: number[]) => {
    const sortedDays = [...days].sort((a, b) => a - b)
    return sortedDays.map(day => {
      if (day === 0) return 'Due date'
      if (day === 1) return '1 day overdue'
      return `${day} days overdue`
    }).join(', ')
  }

  if (loading && reminderPolicies.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reminder policies...</p>
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
            <h1 className="text-3xl font-bold text-foreground">Reminder Policies</h1>
            <Button onClick={() => setShowCreateForm(true)}>
              Create Policy
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

        {/* Info Banner */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-primary">How Reminder Policies Work</h3>
                <div className="mt-2 text-sm text-primary/80">
                  <p>
                    Reminder policies automatically send email reminders to clients for overdue invoices. 
                    You can set multiple reminder days (e.g., 0 days = due date, 3 days = 3 days overdue).
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reminder Policies List */}
        {reminderPolicies.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V1H4v4zM15 3h5v6h-5V3z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-foreground">No reminder policies</h3>
              <p className="mt-1 text-sm text-muted-foreground">Create your first reminder policy to start sending automated reminders.</p>
              <div className="mt-6">
                <Button onClick={() => setShowCreateForm(true)}>
                  Create Reminder Policy
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {reminderPolicies.map((policy) => (
              <Card key={policy.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="px-6 py-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-foreground">{policy.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {getReminderText(policy.reminderDays)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          policy.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-muted text-muted-foreground'
                        }`}>
                          {policy.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteReminderPolicy(policy.id)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-3 bg-muted/50">
                    <div className="text-sm text-muted-foreground">
                      Created {new Date(policy.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Form Modal */}
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Reminder Policy</DialogTitle>
              <DialogDescription>
                Set up automated email reminders for overdue invoices.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreatePolicy} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground">
                  Policy Name *
                </label>
                <Input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Standard Reminders"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Reminder Days *
                </label>
                <div className="space-y-2">
                  {formData.reminderDays.map((day, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        type="number"
                        min="0"
                        value={day}
                        onChange={(e) => updateReminderDay(index, parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">
                        {day === 0 ? 'days (due date)' : day === 1 ? 'day overdue' : 'days overdue'}
                      </span>
                      {formData.reminderDays.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeReminderDay(index)}
                          className="text-destructive hover:text-destructive/80 p-1 h-8 w-8"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addReminderDay}
                  className="mt-2 text-primary hover:text-primary/80"
                >
                  + Add another day
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
                />
                <label htmlFor="isActive" className="text-sm text-foreground">
                  Active
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Policy'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>
    </div>
  )
}
