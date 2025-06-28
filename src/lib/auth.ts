import { PrismaAdapter } from "@next-auth/prisma-adapter"
import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcrypt"
import { v4 as uuid } from "uuid"
import { encode as defaultEncode } from "next-auth/jwt"
import type { Role } from "@/generated/prisma"
import { decode as defaultDecode } from "next-auth/jwt"

const adapter = PrismaAdapter(prisma)

export const authOptions: NextAuthOptions = {
  adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            name: true,
            passwordHash: true,
            role: true,
            image: true,
          },
        })

        if (!user || !user.passwordHash) return null

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!isValid) return null

        // Return user with role and id
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],
  session: { strategy: "database" },
  callbacks: {
    async jwt({ token, account, user }) {
      if (account?.provider === "credentials") {
        token.credentials = true
      }
      // Store role in token if available from user
      if (user?.role) {
        token.role = user.role
      }
      if (user?.id) {
        token.sub = user.id
      }

      return token
    },
    async session({ session, user }) {
      // For database sessions, we get the user from the database
      // The user parameter here is the database user record
      if (user) {
        // Cast user to include our custom fields
        const dbUser = user as typeof user & { role: Role }
        session.user.id = dbUser.id
        session.user.role = dbUser.role
      } else if (session.user?.email) {
        // Fallback: fetch from database if user not provided
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: {
            id: true,
            role: true,
          },
        })

        if (dbUser) {
          session.user.id = dbUser.id
          session.user.role = dbUser.role
        }
      }

      return session
    },
  },
  jwt: {
    encode: async (params) => {
      // For credentials provider, create a database session instead of JWT
      if (params.token?.credentials) {
        const sessionToken = uuid()
        if (!params.token.sub) throw new Error("No user ID found in token")

        await adapter?.createSession?.({
          sessionToken,
          userId: params.token.sub,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        })

        if (!adapter?.createSession) {
          throw new Error("Failed to create session")
        }

        return sessionToken
      }

      // For other providers (Google), use default JWT encoding
      return defaultEncode(params)
    },
    decode: async (params) => {
      if (typeof params.token === 'string' && params.token.startsWith('credentials-')) { // Assuming credentials tokens have a specific prefix
        // Database sessions don't use JWT decode — skip
        return null
      }
      return defaultDecode(params)
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    signOut: "/logout",
    error: "/login",
    newUser: "/signup",
  },
}
