import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "./prisma";

if (!process.env.NEXTAUTH_URL || process.env.NEXTAUTH_URL.trim() === "") {
  process.env.NEXTAUTH_URL = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
}

import { bootstrapDemoUser } from "./auth/bootstrapDemoUser";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "alex@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please provide both email and password.");
        }

        const inputEmail = credentials.email.toLowerCase().trim();
        let user = await prisma.user.findUnique({
          where: { email: inputEmail },
        });

        // Auto-bootstrap demo user and sample dataset if fresh database
        if (!user && inputEmail === "demo@smartfinance.app") {
          try {
            user = await bootstrapDemoUser();
          } catch (e) {
            console.error("Auto-bootstrap demo user error:", e);
          }
        }

        if (!user || !user.password) {
          throw new Error("No account found with this email address.");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Invalid password provided.");
        }


        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "financial-advisor-secret-key-32-chars-long-min",
};
