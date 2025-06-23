import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

// This is the recommended way to set up NextAuth.js in App Router
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }