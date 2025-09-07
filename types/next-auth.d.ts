import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      isFounder?: boolean
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid: string
  }
}
