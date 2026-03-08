import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        try {
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            console.warn(`[AUTH] User not found: ${email}`);
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            password,
            user.passwordHash,
          );

          if (!isPasswordValid) {
            console.warn(`[AUTH] Password mismatch for: ${email}`);
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            organizationId: user.organizationId ?? undefined,
          };
        } catch (error) {
          console.error("[AUTH] Database error during authorize:", error);
          return null;
        }
      },
    }),
  ],
});
