"use client";

import { usePermission } from "../hooks/usePermission";
import { PermissionName } from "../types/auth.types";

interface RoleGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  permission: PermissionName;
}

/**
 * Client Component Guard
 * Conditionally renders children based on user permissions.
 */
export function RoleGuard({
  children,
  fallback = null,
  permission,
}: RoleGuardProps) {
  const { hasPermission } = usePermission();

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
