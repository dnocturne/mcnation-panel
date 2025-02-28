import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { getLibreLoginUser } from "./database/librelogin"
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        try {
          // Get user from LibreLogin database
          const user = await getLibreLoginUser(credentials.username)
          
          if (!user) {
            console.log('User not found:', credentials.username)
            return null
          }
          
          // Parse the BCrypt hash format
          const [cost, hash] = user.hashed_password.split('$')
          const bcryptHash = `$2a$${cost}$${user.salt}${hash}`
          
          // Verify password with bcrypt
          const isValid = await bcrypt.compare(credentials.password, bcryptHash)
          
          if (!isValid) {
            console.log('Invalid password for user:', credentials.username)
            return null
          }
          
          // Return user object with role
          // Note: You may need to adjust the role assignment based on your requirements
          return {
            id: user.last_nickname,
            name: user.last_nickname,
            email: `${user.last_nickname}@example.com`, // Placeholder email
            role: "admin" // Assuming all LibreLogin users who can log in are admins
          }
        } catch (error) {
          console.error('Authentication error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      // Add user role to token
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    session: async ({ session, token }) => {
      // Add role from token to session
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === "development",
}

// Extend the built-in session types to include custom fields
declare module "next-auth" {
  interface User {
    id: string
    role: string
  }
  
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
  }
} 