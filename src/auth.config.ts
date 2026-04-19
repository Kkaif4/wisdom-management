import type { NextAuthConfig } from "next-auth";
import { PermissionService } from "@/modules/auth/services/permission.service";
import { SessionUser } from "@/modules/auth/types/auth.types";

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 5 * 60 * 60, // 5 Hours
  },
  callbacks: {
    async jwt({ token, user }) {
      // 1. Initial Login Phase
      if (user) {
        token.id = user.id;
        token.organizationId = user.organizationId;
        token.roleId = user.roleId;
        token.roleName = user.roleName;
        token.tokenVersion = user.tokenVersion;

        // Fetch permissions for the session (cached in PermissionService)
        const permissions = await PermissionService.loadUserPermissions(
          user as SessionUser,
        );
        token.permissions = Array.from(permissions);
      }

      // 2. Subsequent requests - Verify Token Version in DB
      // Note: In NextAuth, if `user` is undefined, this is a subsequent use of the JWT
      // We must check if the session is still valid
      if (token?.id && !user) {
        const { prisma } = await import("@/lib/prisma");
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { tokenVersion: true },
        });

        // If the token version differs from the database, invalidate the JWT completely
        if (!dbUser || dbUser.tokenVersion !== token.tokenVersion) {
          console.warn(
            `[AUTH] JWT rejected. Stale tokenVersion for User ID: ${token.id}. Token: ${token.tokenVersion}, DB: ${dbUser?.tokenVersion}`,
          );
          // Force auth() to fail
          throw new Error("Session revoked due to new login");
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.organizationId = token.organizationId as
          | string
          | undefined;
        session.user.roleId = token.roleId as string;
        session.user.roleName = token.roleName as string;
        session.user.tokenVersion = token.tokenVersion as number;
        session.user.permissions = token.permissions as string[];
      }
      return session;
    },
  },
  providers: [], // Add providers via auth.ts
} satisfies NextAuthConfig;
