/**
 * Next.js Middleware - Authentication and Authorization
 * 
 * This middleware runs on every request before reaching the page/API route.
 * It handles:
 * - Authentication checks for protected routes (/dashboard, /admin)
 * - Role-based authorization (ADMIN role for /admin routes)
 * - Request logging in development mode
 * - Debug headers injection
 * 
 * Middleware execution order:
 * 1. Request comes in
 * 2. Middleware runs (this file)
 * 3. Route handler executes (page.tsx or route.ts)
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

/**
 * Main middleware function that processes all incoming requests
 * 
 * @param request - The incoming Next.js request object
 * @returns NextResponse - Either a redirect or the next response in the chain
 */
export async function middleware(request: NextRequest) {
  // Extract the pathname from the request URL
  const { pathname } = request.nextUrl

  // Log all requests in development mode for debugging
  // Helps track which routes are being accessed during development
  if (process.env.NODE_ENV === 'development') {
    console.log(`🌐 ${request.method} ${pathname}`)
  }

  // Authentication check for protected routes
  // Dashboard and admin routes require a valid session token
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    try {
      // Retrieve the JWT token from the request
      // NextAuth stores the session as a JWT in cookies
      const token = await getToken({ 
        req: request, 
        secret: process.env.NEXTAUTH_SECRET 
      })

      // If no token exists, user is not authenticated
      // Redirect to sign-in page
      if (!token) {
        console.log(`🔒 Acesso negado para ${pathname} - Token não encontrado`)
        return NextResponse.redirect(new URL('/auth/signin', request.url))
      }

      // Role-based authorization for admin routes
      // Only users with ADMIN role can access /admin routes
      if (pathname.startsWith('/admin') && token.role !== 'ADMIN') {
        console.log(`🔒 Acesso negado para ${pathname} - Permissão insuficiente`)
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }

      // User is authenticated and authorized
      console.log(`✅ Acesso autorizado para ${pathname} - Usuário: ${token.email}`)
    } catch (error) {
      // If any error occurs during authentication (token expired, invalid, etc.)
      // Redirect to sign-in page for safety
      console.error('❌ Erro no middleware de autenticação:', error)
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
  }

  // Create the response object to pass to the next handler
  const response = NextResponse.next()
  
  // Add debug headers in development mode
  // Useful for debugging timing and routing issues
  if (process.env.NODE_ENV === 'development') {
    response.headers.set('X-Debug-Timestamp', new Date().toISOString())
    response.headers.set('X-Debug-Path', pathname)
  }

  return response
}

/**
 * Middleware configuration
 * 
 * Defines which paths the middleware should run on.
 * Uses a negative lookahead regex to exclude certain paths.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - /api/* (API routes - they handle their own auth)
     * - /_next/static/* (static files - no auth needed)
     * - /_next/image/* (image optimization - no auth needed)
     * - /favicon.ico (favicon - no auth needed)
     * - /public/* (public assets - no auth needed)
     * 
     * This ensures middleware only runs on actual page routes that might need protection
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
