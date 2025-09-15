import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  
  // If user is not authenticated, allow access to auth pages
  if (!token) {
    if (request.nextUrl.pathname.startsWith('/auth/') || 
        request.nextUrl.pathname === '/' ||
        request.nextUrl.pathname.startsWith('/api/auth/')) {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // If user is authenticated, check if they need onboarding
  if (token) {
    // Allow access to onboarding and settings pages
    if (request.nextUrl.pathname.startsWith('/onboarding/') || 
        request.nextUrl.pathname.startsWith('/settings')) {
      return NextResponse.next()
    }

    // Check if user has completed onboarding by making an API call
    try {
      const response = await fetch(`${request.nextUrl.origin}/api/organization`, {
        headers: {
          'Cookie': request.headers.get('cookie') || '',
        },
      })

      if (response.ok) {
        const data = await response.json()
        // If no organization exists, redirect to onboarding
        if (!data.organization) {
          return NextResponse.redirect(new URL('/onboarding/organization', request.url))
        }
      }
    } catch (error) {
      console.error('Error checking organization:', error)
    }

    // Redirect authenticated users away from auth pages
    if (request.nextUrl.pathname.startsWith('/auth/')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
