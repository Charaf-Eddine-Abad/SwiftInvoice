'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'
import { LanguageProvider } from '@/contexts/LanguageContext'

interface ProvidersProps {
  children: ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </SessionProvider>
  )
}

