import { SessionUser } from "../types/auth.types";
import { hasPermission, isOwner } from "./base.policy";

/**
 * User Policy
 * Logic for MANAGE_USERS, deactivating accounts, and changing roles
 */
export class UserPolicy {
  static async canManageUsers(user: SessionUser): Promise<boolean> {
    return await hasPermission(user, "MANAGE_USERS");
  }

  static async canDeactivateUser(
    user: SessionUser,
    targetUserOrgId?: string | null,
  ): Promise<boolean> {
    const hasPerm = await hasPermission(user, "MANAGE_USERS");
    return hasPerm && isOwner(user, targetUserOrgId);
  }

  static async canChangeRole(
    user: SessionUser,
    targetUserOrgId?: string | null,
  ): Promise<boolean> {
    // Only ORG_ADMIN or SUPER_ADMIN can change roles
    const hasPerm = await hasPermission(user, "MANAGE_USERS");
    return hasPerm && isOwner(user, targetUserOrgId);
  }
}
