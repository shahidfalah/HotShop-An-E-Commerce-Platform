import { PrismaAdapter } from "@next-auth/prisma-adapter"
import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcrypt"
import type { Role } from "@/generated/prisma" // Assuming this imports 'Role' enum from Prisma

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
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

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              name: true,
              passwordHash: true,
              role: true, // Make sure to select the role
              image: true,
            },
          })

          if (!user || !user.passwordHash) return null

          const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
          if (!isValid) return null

          // Return the user object with the role included
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role, // Include role here
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt", // <--- CRITICAL CHANGE: Use JWT strategy
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      // The `user` object is available only on the first sign-in
      // or when the session is updated (e.g., via `signIn` or `update` calls).
      // It contains the data returned from the `authorize` function or the adapter.
      if (user) {
        // Cast 'user' to include 'role' for type safety
        const dbUser = user as typeof user & { role: Role };
        token.id = dbUser.id; // Add user ID to token
        token.role = dbUser.role; // <--- Add role to the JWT token
      }
      return token;
    },
    async session({ session, token }) {
      // The `token` object here is the one returned from the `jwt` callback.
      // We populate the session based on the token's contents.
      if (token) {
        session.user.id = token.id as string; // Get ID from token
        session.user.role = token.role as Role; // <--- Get role from token and assign to session
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/login",
    newUser: "/signup",
  },
  debug: process.env.NODE_ENV === "development",
}
