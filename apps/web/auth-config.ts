import { NextAuthOptions } from "next-auth";
import CredentialProviders from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


const authConfig: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt", // required to use JWT sessions
  },

  callbacks: {
    async jwt({ token, user }) {
      // When user logs in, attach id to the token
      if (user) {
        token.id = String(user.id);
      }
      return token;
    },
    async session({ session, token }) {
      // Attach token.id to session.user
      if (session.user && token.id) {
        session.user.id = token.id as string ;
      }
      return session;
    }
  },
  providers: [
    CredentialProviders({
      name: "Credentials",
      credentials: {
        username: { label: "username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(cred) {
        const existingUser = await prisma.user.findUnique({
          where: {
            username: cred?.username,
            password: cred?.password,
          },
        });

        if (existingUser) {
          return { ...existingUser, id: String(existingUser.id) }; // make sure id is string
        }
        return null;
      },
    }),
  ],
};

export default authConfig;
