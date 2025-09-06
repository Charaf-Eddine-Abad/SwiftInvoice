'use client'

import { useState } from 'react'

export default function TestCronPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testRecurringCron = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/cron/recurring', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-secret'
        }
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Failed to run cron job')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const testRemindersCron = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/cron/reminders', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-secret'
        }
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Failed to run cron job')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Cron Job Testing</h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Recurring Invoices</h2>
              <p className="text-sm text-gray-600 mb-4">
                This will check for recurring invoices that are due and create new invoices from them.
              </p>
              <button
                onClick={testRecurringCron}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Running...' : 'Test Recurring Invoices Cron'}
              </button>
            </div>

            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Reminders</h2>
              <p className="text-sm text-gray-600 mb-4">
                This will check for overdue invoices and send reminder emails.
              </p>
              <button
                onClick={testRemindersCron}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Running...' : 'Test Reminders Cron'}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-sm text-red-700">
                  <strong>Error:</strong> {error}
                </div>
              </div>
            )}

            {result && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="text-sm text-green-700">
                  <strong>Result:</strong>
                  <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">Note:</h3>
            <p className="text-sm text-yellow-700">
              Make sure you have set the <code>CRON_SECRET</code> environment variable. 
              If you haven't, add it to your <code>.env</code> file:
            </p>
            <pre className="mt-2 text-xs bg-white p-2 rounded border">
              CRON_SECRET=your-secret-here
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
