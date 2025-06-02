import { NextAuthOptions } from "next-auth";
import CredentialProviders from "next-auth/providers/credentials";
import {PrismaClient} from "@prisma/client"
const prisma = new PrismaClient();
console.log(process.env.NEXTAUTH_SECRET);

const authConfig: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt", // required to use JWT sessions
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      return baseUrl; // or hardcoded if needed
    },
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
          return { ...existingUser,id: String(existingUser.id) };
        }
        return null;
      },
    }),
  ],
};

export default authConfig;
