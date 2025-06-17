import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

// This is the recommended way to set up NextAuth.js in App Router
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }


// import NextAuth from "next-auth"
// import Providers from "next-auth/providers"
// import { PrismaAdapter } from "@next-auth/prisma-adapter"
// import { PrismaClient } from "@prisma/client"

// const prisma = new PrismaClient()

// export default NextAuth({
//   providers: [
//     Providers.Google({
//       clientId: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     }),
//   ],
//   adapter: PrismaAdapter(prisma),
// })