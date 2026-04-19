import { auth } from "@/auth";
import {
  AuthenticationError,
  ForbiddenError,
  SessionUser,
} from "../types/auth.types";
import { prisma } from "@/lib/prisma";

export class SessionService {
  /**
   * Enforces that a valid session exists.
   * Throws AuthenticationError if session is missing or user is inactive/stale.
   */
  static async requireSession(): Promise<SessionUser> {
    const session = await auth();

    if (!session?.user?.id) {
      throw new AuthenticationError(
        "You must be logged in to perform this action",
      );
    }

    const { user } = session;

    if (!user.roleId) {
      throw new AuthenticationError("User role not found");
    }

    // Fetch fresh state from DB to verify user is still active and token is not revoked
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        isActive: true,
        tokenVersion: true,
      },
    });

    if (!dbUser) {
      throw new AuthenticationError("User account no longer exists");
    }

    if (!dbUser.isActive) {
      throw new AuthenticationError("User account is inactive");
    }

    // Security check: has this session been revoked (e.g. via tokenVersion increment)?
    if (dbUser.tokenVersion !== user.tokenVersion) {
      throw new AuthenticationError(
        "Session has expired or was revoked. Please log in again.",
      );
    }

    // Return current session user with new typing
    return {
      id: user.id!,
      email: user.email!,
      name: user.name!,
      roleId: user.roleId!,
      roleName: user.roleName!,
      organizationId: user.organizationId,
      tokenVersion: user.tokenVersion!,
    };
  }

  /**
   * Validates that the active session has an organization context.
   * Throws ForbiddenError if organizationId is missing (unless SUPER_ADMIN).
   */
  static requireOrgId(user: SessionUser): string {
    if (!user.organizationId && user.roleName !== "SUPER_ADMIN") {
      throw new ForbiddenError(
        "No organization context found for this account",
      );
    }
    return user.organizationId!;
  }

  /**
   * Invalidates all active sessions for a user by incrementing their tokenVersion.
   */
  static async revokeAllSessions(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        tokenVersion: { increment: 1 },
      },
    });
  }
}
