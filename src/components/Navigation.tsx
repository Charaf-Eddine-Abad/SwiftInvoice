'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  HomeIcon,
  UsersIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  BellIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  Bars3Icon
} from '@heroicons/react/24/outline'
import ThemeToggle from './ThemeToggle'
import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function Navigation() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { t } = useLanguage()

  const navigation = [
    { name: t('nav.dashboard'), href: '/dashboard', icon: HomeIcon },
    { name: t('nav.clients'), href: '/clients', icon: UsersIcon },
    { name: t('nav.invoices'), href: '/invoices', icon: DocumentTextIcon },
    { name: t('nav.recurring'), href: '/dashboard/recurring-invoices', icon: ClockIcon },
    { name: t('nav.expenses'), href: '/dashboard/expenses', icon: CurrencyDollarIcon },
    { name: t('nav.reminders'), href: '/dashboard/reminders', icon: BellIcon },
    { name: t('nav.payments'), href: '/dashboard/payments', icon: CreditCardIcon },
    { name: t('nav.settings'), href: '/settings', icon: Cog6ToothIcon },
  ]

  if (!session) return null

  return (
    <nav className="bg-background shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-xl font-bold text-primary">
              SwiftInvoice
            </Link>

            {/* Desktop navigation */}
            <div className="hidden md:flex md:space-x-6">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center h-16 -mb-px border-b-2 px-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-primary text-foreground'
                        : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                    }`}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </div>

            {/* Mobile menu */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="px-2">
                    <Bars3Icon className="w-5 h-5" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {navigation.map((item) => (
                    <DropdownMenuItem key={item.name} asChild>
                      <Link href={item.href} className="flex items-center">
                        <item.icon className="w-4 h-4 mr-2" />
                        {item.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut()}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
              {t('nav.signout')}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

