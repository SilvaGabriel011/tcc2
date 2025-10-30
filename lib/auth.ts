import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { ErrorHandler, ErrorCodes } from '@/lib/errors'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            const error = ErrorHandler.createError(
              ErrorCodes.VAL_001,
              { missing: ['email', 'password'] },
              'authorize'
            )
            ErrorHandler.logError(error)
            throw new Error(error.code)
          }

          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          })

          if (!user) {
            const error = ErrorHandler.createError(
              ErrorCodes.AUTH_002,
              { email: credentials.email },
              'authorize'
            )
            ErrorHandler.logError(error)
            throw new Error(error.code)
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            const error = ErrorHandler.createError(
              ErrorCodes.AUTH_003,
              { email: credentials.email },
              'authorize'
            )
            ErrorHandler.logError(error)
            throw new Error(error.code)
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  debug: process.env.NODE_ENV === 'development'
}
