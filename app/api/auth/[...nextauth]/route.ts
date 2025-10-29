import NextAuth, { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: "Demo Login",
      credentials: {
        email: { label: "Email", type: "text" },
      },
      async authorize(credentials) {
        // Allow demo login
        if (
          credentials?.email === "demo@nutriscan.app" ||
          credentials?.email === "demo"
        ) {
          // Find or create demo user
          let user = await prisma.user.findUnique({
            where: { email: "demo@nutriscan.app" },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                email: "demo@nutriscan.app",
                name: "Demo User",
              },
            });
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

