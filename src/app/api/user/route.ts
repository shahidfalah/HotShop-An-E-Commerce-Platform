import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  return NextResponse.json({ user: session.user })
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("Received POST request with body:", body);
        const { email, password, name } = body;
        const isEmailValid = await prisma.user.findUnique({
            where:{
                email: email
            }
        })
        if (isEmailValid) {
            return NextResponse.json({ user: null, massage: "Email already exists" }, { status: 409 });
        }

        const passwordHash = await hash(password, 10); // Hash the password with bcrypt
        const newUser = await prisma.user.create({
            data: {
                email,
                name, // Default name if not provided
                passwordHash, // Default image if not provided
            }
        });
        return NextResponse.json({user: newUser, massage:"New user"}, { status: 201 });
    }
    catch (error) {
        console.error("Error parsing request body:", error);        
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
}