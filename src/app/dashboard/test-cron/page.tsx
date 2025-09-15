'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Cron Job Testing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-foreground mb-4">Recurring Invoices</h2>
              <p className="text-sm text-muted-foreground mb-4">
                This will check for recurring invoices that are due and create new invoices from them.
              </p>
              <Button
                onClick={testRecurringCron}
                disabled={loading}
              >
                {loading ? 'Running...' : 'Test Recurring Invoices Cron'}
              </Button>
            </div>

            <div>
              <h2 className="text-lg font-medium text-foreground mb-4">Reminders</h2>
              <p className="text-sm text-muted-foreground mb-4">
                This will check for overdue invoices and send reminder emails.
              </p>
              <Button
                onClick={testRemindersCron}
                disabled={loading}
                variant="default"
              >
                {loading ? 'Running...' : 'Test Reminders Cron'}
              </Button>
            </div>

            {error && (
              <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="p-4">
                  <div className="text-sm text-destructive">
                    <strong>Error:</strong> {error}
                  </div>
                </CardContent>
              </Card>
            )}

            {result && (
              <Card className="border-green-500/20 bg-green-500/5">
                <CardContent className="p-4">
                  <div className="text-sm text-green-700">
                    <strong>Result:</strong>
                    <pre className="mt-2 text-xs bg-background p-2 rounded border border-border overflow-auto">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-yellow-500/20 bg-yellow-500/5">
              <CardContent className="p-4">
                <h3 className="text-sm font-medium text-yellow-800 mb-2">Note:</h3>
                <p className="text-sm text-yellow-700">
                  Make sure you have set the <code>CRON_SECRET</code> environment variable. 
                  If you haven't, add it to your <code>.env</code> file:
                </p>
                <pre className="mt-2 text-xs bg-background p-2 rounded border border-border">
                  CRON_SECRET=your-secret-here
                </pre>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
