import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"
import type { NextAuthConfig } from "next-auth"

const config: NextAuthConfig = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
    newUser: "/dashboard",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required")
        }

        const email = credentials.email as string
        const password = credentials.password as string

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.passwordHash) {
          throw new Error("Invalid credentials")
        }

        const isValid = await bcrypt.compare(
          password,
          user.passwordHash
        )

        if (!isValid) {
          throw new Error("Invalid credentials")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.plan = token.plan as string
      }
      return session
    },
    async jwt({ token, user, trigger, session }) {
      if (user && user.id) {
        token.id = user.id
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { plan: true },
        })
        token.plan = dbUser?.plan || "FREE"
      }
      
      if (trigger === "update" && session) {
        token.plan = session.plan
      }
      
      return token
    },
  },
  events: {
    async signIn({ user }) {
      if (user.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })
      }
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(config)

// Compatibility helper for getServerSession - wraps auth() for v4 API compatibility
// This matches the v4 getServerSession signature (no options parameter needed in v5)
export async function getServerSession() {
  const session = await auth()
  if (!session) return null
  
  return {
    user: {
      id: (session.user as any)?.id || session.user?.email || "",
      email: session.user?.email || "",
      name: session.user?.name || null,
      image: session.user?.image || null,
      plan: (session.user as any)?.plan || "FREE",
    },
    expires: session.expires || "",
  }
}

// Export for backward compatibility
export const authOptions = config as any
