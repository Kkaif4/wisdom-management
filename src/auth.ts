import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { AuthService } from "@/modules/auth/services/auth.service";
import { AuditService } from "@/modules/auth/services/audit.service";
import { RateLimitService } from "@/modules/auth/services/ratelimit.service";
import { prisma } from "@/lib/prisma";
import { AuthenticationError } from "@/modules/auth/types/auth.types";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials, req) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        const ip = (req as any).ip || "unknown";
        const userAgent = (req as any).headers?.get("user-agent") || "unknown";

        if (!email || !password) {
          return null;
        }

        try {
          // 1. Rate Limiting Check
          const isLimited = await RateLimitService.checkLogin(ip, email);
          if (isLimited) {
            throw new AuthenticationError(
              "Too many login attempts. Please try again later.",
            );
          }

          // 2. Validate Credentials & check status/lockout
          const user = await AuthService.validateCredentials(email, password);

          if (!user) {
            // Log failure & increment attempts (handled here for fine-grained control)
            const dbUser = await prisma.user.findUnique({ where: { email } });
            if (dbUser) {
              await prisma.user.update({
                where: { id: dbUser.id },
                data: {
                  failedLoginAttempts: { increment: 1 },
                  ...(dbUser.failedLoginAttempts + 1 >= 5
                    ? { lockedUntil: new Date(Date.now() + 15 * 60 * 1000) }
                    : {}),
                },
              });
            }

            await AuditService.logAuthEvent("LOGIN_FAILED", {
              email,
              ip,
              userAgent,
              reason: "Invalid credentials",
            });
            return null;
          }

          // 3. Success: Reset attempts, increment token version (kills other sessions), and log
          const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: 0,
              lockedUntil: null,
              lastActiveAt: new Date(),
              tokenVersion: { increment: 1 },
            },
            include: { role: true },
          });

          await AuditService.logAuthEvent("LOGIN_SUCCESS", {
            userId: updatedUser.id,
            organizationId: updatedUser.organizationId || undefined,
            ip,
            userAgent,
          });

          return {
            id: updatedUser.id,
            email: updatedUser.email,
            name: updatedUser.name,
            roleId: updatedUser.roleId,
            roleName: updatedUser.role.name,
            organizationId: updatedUser.organizationId ?? undefined,
            tokenVersion: updatedUser.tokenVersion,
          };
        } catch (error) {
          if (error instanceof AuthenticationError) {
            throw error;
          }
          return null;
        }
      },
    }),
  ],
});
