import { SessionUser } from "../types/auth.types";
import { PermissionService } from "../services/permission.service";

/**
 * Base utility for checking if a user has a specific permission.
 * Centralizes the check to the PermissionService.
 */
export async function hasPermission(
  user: SessionUser,
  permission: any,
): Promise<boolean> {
  return await PermissionService.hasPermission(user, permission);
}

/**
 * Utility to verify if a user belongs to the same organization as a resource.
 * SUPER_ADMIN bypasses this check.
 */
export function isOwner(
  user: SessionUser,
  resourceOrgId?: string | null,
): boolean {
  if (user.roleName === "SUPER_ADMIN") return true;
  if (!resourceOrgId) return false;
  return user.organizationId === resourceOrgId;
}
