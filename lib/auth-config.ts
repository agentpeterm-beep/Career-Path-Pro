
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name || undefined,
          subscriptionTier: user.subscriptionTier,
        }
      }
    })
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        return {
          ...token,
          id: user.id,
          subscriptionTier: (user as any).subscriptionTier,
        }
      }
      return token
    },
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          subscriptionTier: token.subscriptionTier,
        }
      }
    },
    async signIn({ user, account }) {
      // Send login notification (run in background)
      if (user.email && account?.provider === 'credentials') {
        try {
          // Get request info for better tracking
          const loginData = {
            userId: user.id as string,
            userName: user.name || undefined,
            userEmail: user.email,
            loginTime: new Date().toISOString()
          }

          // Send notification in background (don't block login)
          fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
          }).catch(error => {
            console.error('Failed to send login notification:', error)
          })
        } catch (error) {
          console.error('Login tracking error:', error)
        }
      }
      return true
    },
  },
}
