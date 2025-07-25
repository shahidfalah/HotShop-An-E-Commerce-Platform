import type { DefaultSession, DefaultUser } from "next-auth"
import type { Role } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: Role
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    id: string
    role: Role
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role
    credentials?: boolean
  }
}

declare module "@next-auth/prisma-adapter" {
  interface AdapterUser {
    id: string
    role: Role
  }
}

declare module 'color-thief-browser' {
  export function getColor(img: HTMLImageElement): Promise<[number, number, number]>;
  export function getPalette(img: HTMLImageElement, colorCount?: number): Promise<[number, number, number][]>;
}

