declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
    }
  }

  interface User {
    id: string
    name: string
    email: string
  }

  // TypeScript 5.9 cannot resolve the export type alias chain in next-auth v4
  interface NextAuthOptions {
    providers?: unknown[]
    session?: {
      strategy?: 'jwt' | 'database'
      maxAge?: number
      updateAge?: number
    }
    pages?: {
      signIn?: string
      signOut?: string
      error?: string
      verifyRequest?: string
      newUser?: string
    }
    callbacks?: {
      jwt?: (params: {
        token: import('next-auth/jwt').JWT
        user?: User | null
        account?: Record<string, unknown> | null
        profile?: Record<string, unknown> | null
        isNewUser?: boolean
      }) => Promise<import('next-auth/jwt').JWT> | import('next-auth/jwt').JWT
      session?: (params: {
        session: Session
        token: import('next-auth/jwt').JWT
        user?: User
      }) => Promise<Session> | Session
      signIn?: (params: {
        user: User
        account?: unknown
        profile?: unknown
        email?: { verificationRequest?: boolean }
        credentials?: unknown
      }) => Promise<boolean | string> | boolean | string
      redirect?: (params: { url: string; baseUrl: string }) => Promise<string> | string
    }
    adapter?: unknown
    events?: unknown
    logger?: unknown
    theme?: unknown
    secret?: string
    debug?: boolean
  }
}

declare module 'next-auth/next' {
  // Override getServerSession to return properly typed Session when called with NextAuthOptions
  function getServerSession(
    options: import('next-auth').NextAuthOptions
  ): Promise<import('next-auth').Session | null>

  // TypeScript 5.9 cannot resolve the default export callable signature
  export default function NextAuth(
    options: import('next-auth').NextAuthOptions
  ): (request: import('next/server').NextRequest, ...args: unknown[]) => Promise<Response>
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
  }

  // TypeScript 5.9 cannot resolve explicit function exports from next-auth/jwt
  export function getToken<R extends boolean = false>(params: {
    req: unknown
    raw?: R
    secret?: string
    secureCookie?: boolean
    cookieName?: string
    decode?: unknown
    logger?: unknown
    salt?: string
  }): Promise<R extends true ? string : JWT | null>
}
