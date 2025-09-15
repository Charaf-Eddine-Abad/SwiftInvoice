'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function PaymentsPage() {
  const [showDialog, setShowDialog] = useState(false)

  const paymentProviders = [
    {
      name: 'Stripe',
      description: 'Accept credit cards, digital wallets, and more',
      logo: '💳',
      color: 'bg-purple-600',
      features: ['Credit/Debit Cards', 'Apple Pay', 'Google Pay', 'ACH Transfers']
    },
    {
      name: 'PayPal',
      description: 'Global payment processing with buyer protection',
      logo: '🅿️',
      color: 'bg-blue-600',
      features: ['PayPal Balance', 'Credit Cards', 'Bank Transfers', 'Buy Now Pay Later']
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-foreground mb-8">Payment Processing</h1>

          {/* Main Content */}
          {/* Coming Soon Banner */}
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-primary">Payment Processing Coming Soon</h3>
                  <p className="text-primary/80 mt-1">
                    We're working on integrating secure payment processing. This feature will be available in a future update.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Providers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paymentProviders.map((provider) => (
              <Card key={provider.name} className="overflow-hidden">
                {/* Provider Header */}
                <div className={`${provider.color} px-6 py-4`}>
                  <div className="flex items-center">
                    <div className="text-3xl mr-3">{provider.logo}</div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{provider.name}</h3>
                      <p className="text-blue-100 text-sm">{provider.description}</p>
                    </div>
                  </div>
                </div>

                {/* Provider Content */}
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-foreground mb-2">Supported Payment Methods:</h4>
                    <ul className="space-y-1">
                      {provider.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-muted-foreground">
                          <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Connect Button */}
                  <Button
                    onClick={() => setShowDialog(true)}
                    className="w-full"
                    variant="secondary"
                    disabled
                  >
                    Connect {provider.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Benefits Section */}
          <Card className="mt-12">
            <CardHeader>
              <CardTitle>Why Payment Processing?</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h4 className="font-medium text-foreground mb-2">Faster Payments</h4>
                <p className="text-sm text-muted-foreground">Get paid instantly with online payment processing</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h4 className="font-medium text-foreground mb-2">Secure & Reliable</h4>
                <p className="text-sm text-muted-foreground">Bank-level security with fraud protection</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="font-medium text-foreground mb-2">Easy Integration</h4>
                <p className="text-sm text-muted-foreground">Seamless setup with your existing invoices</p>
              </div>
            </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Coming Soon Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary/10">
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <DialogTitle>Payments Coming Soon</DialogTitle>
            <DialogDescription>
              We're working hard to bring you secure payment processing. This feature will be available in a future update.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setShowDialog(false)}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}