import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/calendar",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        // Persist Google tokens
        // @ts-expect-error augment token for app usage
        token.accessToken = account.access_token;
        // @ts-expect-error augment token for app usage
        token.refreshToken = account.refresh_token;
        // @ts-expect-error augment token for app usage
        token.accessTokenExpires = account.expires_at;
      }
      return token;
    },
    async session({ session, token }) {
      // Expose token fields on session for client/API usage
      // @ts-expect-error expose augmented fields
      session.accessToken = token.accessToken;
      // @ts-expect-error expose augmented fields
      session.refreshToken = token.refreshToken;
      // @ts-expect-error expose augmented fields
      session.accessTokenExpires = token.accessTokenExpires;
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
};


