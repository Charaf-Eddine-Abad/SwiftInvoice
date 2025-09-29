import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

export async function GET(request: NextRequest) {
  const results = {
    database: 'unknown',
    session: 'unknown',
    invoiceCount: 0,
    userCount: 0,
    error: null as string | null
  }

  try {
    // Test database connection
    try {
      const dbTest = await prisma.$queryRaw`SELECT 1 as test`
      results.database = 'connected'
    } catch (e) {
      results.database = 'failed'
      results.error = `DB: ${e instanceof Error ? e.message : 'Unknown'}`
    }

    // Test session
    try {
      const session = await getServerSession(authOptions)
      results.session = session?.user?.id ? 'valid' : 'invalid'
    } catch (e) {
      results.session = 'error'
    }

    // Count records
    try {
      results.userCount = await prisma.user.count()
      results.invoiceCount = await prisma.invoice.count()
    } catch (e) {
      results.error = (results.error || '') + ` Count: ${e instanceof Error ? e.message : 'Unknown'}`
    }

  } catch (error) {
    results.error = error instanceof Error ? error.message : 'Unknown error'
  }

  return NextResponse.json(results)
}
