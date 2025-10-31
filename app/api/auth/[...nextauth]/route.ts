/**
 * NextAuth.js API Route Handler
 * 
 * This file creates the NextAuth API route that handles all authentication endpoints:
 * - POST /api/auth/signin - User sign in
 * - POST /api/auth/signout - User sign out  
 * - GET /api/auth/session - Get current session
 * - POST /api/auth/callback/[...provider] - OAuth callbacks
 * - GET /api/auth/providers - Get available providers
 * 
 * The [...nextauth] dynamic route pattern catches all NextAuth-related API calls.
 * Configuration is delegated to authOptions in @/lib/auth.
 * 
 * This file is required by NextAuth.js to handle authentication in API routes.
 */

import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

// Create NextAuth handler with configuration from auth.ts
const handler = NextAuth(authOptions)

// Export handler for both GET and POST methods
// NextAuth.js uses both methods for different authentication flows
export { handler as GET, handler as POST }
