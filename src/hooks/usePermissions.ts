"use client";

import { useSession } from "next-auth/react";
import { useMemo, useCallback } from "react";
import { PermissionName } from "@/modules/auth/types/auth.types";

/**
 * Hook to check user permissions in client components.
 * Memoized to avoid re-creating Sets on every render.
 */
export function usePermissions() {
  const { data: session, status } = useSession();

  const isSuperAdmin = session?.user?.roleName === "SUPER_ADMIN";

  // Memoize the permissions Set so it's only rebuilt when the session changes
  const permissions = useMemo(
    () => new Set<string>(session?.user?.permissions || []),
    [session?.user?.permissions],
  );

  const hasPermission = useCallback(
    (permission: PermissionName) => {
      if (status === "loading") return false;
      if (isSuperAdmin) return true;
      return permissions.has(permission);
    },
    [status, isSuperAdmin, permissions],
  );

  const hasAnyPermission = useCallback(
    (required: PermissionName[]) => {
      if (status === "loading") return false;
      if (isSuperAdmin) return true;
      return required.some((p) => permissions.has(p));
    },
    [status, isSuperAdmin, permissions],
  );

  const hasAllPermissions = useCallback(
    (required: PermissionName[]) => {
      if (status === "loading") return false;
      if (isSuperAdmin) return true;
      return required.every((p) => permissions.has(p));
    },
    [status, isSuperAdmin, permissions],
  );

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isSuperAdmin,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  };
}
