'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reminder Policies</h1>
              <p className="mt-2 text-gray-600">Configure automated invoice reminders</p>
            </div>
            <div className="flex space-x-3">
              <Link
                href="/dashboard"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Back to Dashboard
              </Link>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Create Policy
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">How Reminder Policies Work</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Reminder policies automatically send email reminders to clients for overdue invoices. 
                  You can set multiple reminder days (e.g., 0 days = due date, 3 days = 3 days overdue).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reminder Policies List */}
        {reminderPolicies.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V1H4v4zM15 3h5v6h-5V3z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No reminder policies</h3>
            <p className="mt-1 text-sm text-gray-500">Create your first reminder policy to start sending automated reminders.</p>
            <div className="mt-6">
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Create Reminder Policy
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {reminderPolicies.map((policy) => (
              <div key={policy.id} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{policy.name}</h3>
                      <p className="text-sm text-gray-500">
                        {getReminderText(policy.reminderDays)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        policy.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {policy.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => deleteReminderPolicy(policy.id)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-3 bg-gray-50">
                  <div className="text-sm text-gray-500">
                    Created {new Date(policy.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create Reminder Policy</h3>
                
                <form onSubmit={handleCreatePolicy} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Policy Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="e.g., Standard Reminders"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reminder Days *
                    </label>
                    <div className="space-y-2">
                      {formData.reminderDays.map((day, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            value={day}
                            onChange={(e) => updateReminderDay(index, parseInt(e.target.value) || 0)}
                            className="block w-20 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                          <span className="text-sm text-gray-500">
                            {day === 0 ? 'days (due date)' : day === 1 ? 'day overdue' : 'days overdue'}
                          </span>
                          {formData.reminderDays.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeReminderDay(index)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={addReminderDay}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-900"
                    >
                      + Add another day
                    </button>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                      Active
                    </label>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Creating...' : 'Create Policy'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
