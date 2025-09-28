'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  PlusIcon, 
  DocumentTextIcon, 
  UsersIcon, 
  CurrencyDollarIcon,
  ClockIcon,
  BellIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline'

interface DashboardStats {
  totalInvoices: number
  totalClients: number
  totalRevenue: number
  recentInvoices: Array<{
    id: string
    invoiceNumber: string
    client: { name: string }
    totalAmount: number | string
    status: string
    dueDate: string
  }>
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchDashboardData()
  }, [session, status, router])

  const fetchDashboardData = async () => {
    try {
      const [invoicesResponse, clientsResponse] = await Promise.all([
        fetch('/api/invoices'),
        fetch('/api/clients')
      ])

      if (invoicesResponse.ok && clientsResponse.ok) {
        const [invoices, clients] = await Promise.all([
          invoicesResponse.json(),
          clientsResponse.json()
        ])

        const totalRevenue = invoices.reduce((sum: number, invoice: any) => {
          return sum + Number(invoice.totalAmount)
        }, 0)

        setStats({
          totalInvoices: invoices.length,
          totalClients: clients.length,
          totalRevenue,
          recentInvoices: invoices.slice(0, 5)
        })
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
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

  if (!session) {
    return null
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-foreground mb-8">Dashboard</h1>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DocumentTextIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-muted-foreground truncate">
                        Total Invoices
                      </dt>
                      <dd className="text-lg font-medium text-foreground">
                        {stats?.totalInvoices || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UsersIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-muted-foreground truncate">
                        Total Clients
                      </dt>
                      <dd className="text-lg font-medium text-foreground">
                        {stats?.totalClients || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CurrencyDollarIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-muted-foreground truncate">
                        Total Revenue
                      </dt>
                      <dd className="text-lg font-medium text-foreground">
                        ${Number(stats?.totalRevenue || 0).toFixed(2)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button asChild>
                  <Link href="/clients/new">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add New Client
                  </Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/invoices/new">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create New Invoice
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Phase 2 Features */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-foreground mb-4">Advanced Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link href="/dashboard/recurring-invoices">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <ClockIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-muted-foreground truncate">
                            Recurring Invoices
                          </dt>
                          <dd className="text-sm text-foreground">
                            Automate invoice generation
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/expenses">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <CurrencyDollarIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-muted-foreground truncate">
                            Expense Tracking
                          </dt>
                          <dd className="text-sm text-foreground">
                            Track business expenses
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/reminders">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <BellIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-muted-foreground truncate">
                            Reminder Policies
                          </dt>
                          <dd className="text-sm text-foreground">
                            Automated reminders
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/payments">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <CreditCardIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-muted-foreground truncate">
                            Payment Processing
                          </dt>
                          <dd className="text-sm text-foreground">
                            Coming soon
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* Recent Invoices */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Invoices</CardTitle>
                <Link
                  href="/invoices"
                  className="text-sm font-medium text-primary hover:text-primary/80"
                >
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              
              {stats?.recentInvoices && stats.recentInvoices.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Invoice
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Client
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Due Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-border">
                      {stats.recentInvoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-muted/50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                            <Link
                              href={`/invoices/${invoice.id}`}
                              className="text-primary hover:text-primary/80"
                            >
                              {invoice.invoiceNumber}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                            {invoice.client.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                            ${Number(invoice.totalAmount).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                              {invoice.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                            {new Date(invoice.dueDate).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <DocumentTextIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium text-foreground">No invoices yet</h3>
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
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

