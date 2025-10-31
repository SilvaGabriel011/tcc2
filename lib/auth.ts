/**
 * NextAuth Configuration for AgroInsight
 * 
 * This file configures NextAuth.js authentication with:
 * - Credentials provider (email/password authentication)
 * - Prisma adapter for database persistence
 * - JWT-based sessions
 * - Custom error handling
 * - Role-based authorization support
 * 
 * Flow:
 * 1. User submits email/password
 * 2. authorize() validates credentials
 * 3. JWT token is created with user data
 * 4. Session is established with user info
 */

import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { ErrorHandler, ErrorCodes } from '@/lib/errors'
import bcrypt from 'bcryptjs'

/**
 * NextAuth configuration object
 * Exported to be used in both API routes and server components
 */
export const authOptions: NextAuthOptions = {
  // Prisma adapter connects NextAuth to the database
  // Handles user, session, and account storage automatically
  adapter: PrismaAdapter(prisma),
  
  // Authentication providers - currently only using credentials (email/password)
  providers: [
    CredentialsProvider({
      // Provider identifier
      name: 'credentials',
      
      // Define the form fields for the sign-in page
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      
      /**
       * Authorization logic - validates user credentials
       * 
       * @param credentials - Email and password from sign-in form
       * @returns User object if valid, null if invalid
       */
      async authorize(credentials) {
        try {
          // Validate that both email and password are provided
          if (!credentials?.email || !credentials?.password) {
            const error = ErrorHandler.createError(
              ErrorCodes.VAL_001,  // Validation error code
              { missing: ['email', 'password'] },
              'authorize'
            )
            ErrorHandler.logError(error)
            throw new Error(error.code)
          }

          // Look up user by email in database
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          })

          // User not found - invalid email
          if (!user) {
            const error = ErrorHandler.createError(
              ErrorCodes.AUTH_002,  // User not found error code
              { email: credentials.email },
              'authorize'
            )
            ErrorHandler.logError(error)
            throw new Error(error.code)
          }

          // Verify password using bcrypt
          // Compares plain text password with hashed password in database
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          // Invalid password
          if (!isPasswordValid) {
            const error = ErrorHandler.createError(
              ErrorCodes.AUTH_003,  // Invalid password error code
              { email: credentials.email },
              'authorize'
            )
            ErrorHandler.logError(error)
            throw new Error(error.code)
          }

          // Authentication successful - return user data
          // This data will be stored in the JWT token
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          // Log any errors during authentication
          console.error('Auth error:', error)
          return null  // Return null to indicate authentication failure
        }
      }
    })
  ],
  
  // Use JWT strategy for sessions (stateless, stored in cookies)
  // Alternative is 'database' which stores sessions in the database
  session: {
    strategy: 'jwt'
  },
  
  // Callbacks to customize NextAuth behavior
  callbacks: {
    /**
     * JWT callback - runs whenever a JWT is created or updated
     * Used to add custom data to the token
     * 
     * @param token - The JWT token
     * @param user - User object (only available on sign in)
     * @returns Modified token
     */
    async jwt({ token, user }) {
      // On sign in, add user role to token
      // This allows us to access role in middleware and pages
      if (user) {
        token.role = user.role
      }
      return token
    },
    
    /**
     * Session callback - runs whenever session is accessed
     * Used to add token data to the session object
     * 
     * @param session - The session object
     * @param token - The JWT token
     * @returns Modified session
     */
    async session({ session, token }) {
      // Add user ID and role from token to session
      // This makes them available in client-side code
      if (token) {
        session.user.id = token.sub!  // sub is the user ID
        session.user.role = token.role as string
      }
      return session
    }
  },
  
  // Custom pages configuration
  pages: {
    signIn: '/auth/signin',  // Redirect to custom sign-in page
  },
  
  // Enable debug logging in development mode
  // Helps troubleshoot authentication issues
  debug: process.env.NODE_ENV === 'development'
}
