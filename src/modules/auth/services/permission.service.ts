import { prisma } from "@/lib/prisma";
import { PermissionName, SessionUser } from "../types/auth.types";

// Simple in-memory cache for permissions
// Key: roleId, Value: { permissions: Set<string>, expiresAt: number }
const permissionsCache = new Map<
  string,
  { permissions: Set<string>; expiresAt: number }
>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export class PermissionService {
  /**
   * Loads all permissions associated with a user's role.
   * Uses a role-level cache to minimize DB hits.
   */
  static async loadUserPermissions(user: SessionUser): Promise<Set<string>> {
    const now = Date.now();
    const cached = permissionsCache.get(user.roleId);

    if (cached && cached.expiresAt > now) {
      return cached.permissions;
    }

    // Cache miss or expired: Fetch from DB
    const roleWithPerms = await prisma.role.findUnique({
      where: { id: user.roleId },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });

    const permsSet = new Set<string>();
    roleWithPerms?.permissions.forEach((rp) => {
      permsSet.add(rp.permission.name);
    });

    // Update cache
    permissionsCache.set(user.roleId, {
      permissions: permsSet,
      expiresAt: now + CACHE_TTL,
    });

    return permsSet;
  }

  /**
   * Checks if user has a specific permission.
   * SUPER_ADMIN bypasses all checks.
   */
  static async hasPermission(
    user: SessionUser,
    permission: PermissionName,
  ): Promise<boolean> {
    if (user.roleName === "SUPER_ADMIN") return true;

    const userPerms = await this.loadUserPermissions(user);
    return userPerms.has(permission);
  }

  /**
   * Checks if user has any of the listed permissions.
   */
  static async hasAnyPermission(
    user: SessionUser,
    permissions: PermissionName[],
  ): Promise<boolean> {
    if (user.roleName === "SUPER_ADMIN") return true;

    const userPerms = await this.loadUserPermissions(user);
    return permissions.some((p) => userPerms.has(p));
  }

  /**
   * Checks if user has all of the listed permissions.
   */
  static async hasAllPermissions(
    user: SessionUser,
    permissions: PermissionName[],
  ): Promise<boolean> {
    if (user.roleName === "SUPER_ADMIN") return true;

    const userPerms = await this.loadUserPermissions(user);
    return permissions.every((p) => userPerms.has(p));
  }

  /**
   * Throws ForbiddenError if user does not have specific permission.
   */
  static async enforce(user: SessionUser, permission: PermissionName) {
    const hasPerm = await this.hasPermission(user, permission);
    if (!hasPerm) {
      const { ForbiddenError } = await import("../types/auth.types");
      throw new ForbiddenError(
        `Permission denied: You do not have the "${permission}" permission.`,
      );
    }
  }
}

