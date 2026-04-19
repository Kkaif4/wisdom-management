"use client";

import { useAuth } from "./useAuth";
import { PermissionName } from "../types/auth.types";
import { useEffect, useState } from "react";

/**
 * Client-side hook to check for permissions.
 * Since permissions are in the DB, we fetch them from an API or leverage the session.
 * For Phase 3, we expect permissions to be included in the session by NextAuth callbacks.
 */
export function usePermission() {
  const { user } = useAuth();

  // NOTE: In a real implementation, we might want to expose a PermissionService call
  // through an API if not all perms are in the JWT.
  // For now, we'll assume a 'permissions' array was added to the user object in the session.

  const hasPermission = (permission: PermissionName): boolean => {
    if (!user) return false;
    if (user.roleName === "SUPER_ADMIN") return true;

    // In our auth.config.ts, we'll eventually add a 'permissions' field to the session.
    // For now, we fallback to role-based defaults if perms are missing.
    const perms = (user as any).permissions as string[] | undefined;
    return perms?.includes(permission) ?? false;
  };

  return { hasPermission };
}
