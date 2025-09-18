'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { ThemeProvider } from 'next-themes'

interface ProvidersProps {
  children: ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}

