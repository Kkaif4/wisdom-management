"use client";

import { useSession } from "next-auth/react";
import { PermissionName } from "@/modules/auth/types/auth.types";
import { ReactNode } from "react";

interface PermissionGateProps {
  permission?: PermissionName;
  permissions?: PermissionName[];
  any?: boolean; // If true, user needs ANY of the permissions. If false (default), needs ALL.
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * A client-side component to conditionally render children based on user permissions.
 * Bypasses all checks for SUPER_ADMIN.
 */
export function PermissionGate({
  permission,
  permissions,
  any = false,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { data: session } = useSession();

  // If no session, show fallback
  if (!session?.user) return fallback;

  // SUPER_ADMIN bypasses all permission checks
  if (session.user.roleName === "SUPER_ADMIN") return <>{children}</>;

  const userPermissions = new Set(session.user.permissions || []);
  const required = permissions || (permission ? [permission] : []);

  // If no specific permissions required, just render children
  if (required.length === 0) return <>{children}</>;

  const hasPermission = any
    ? required.some((p) => userPermissions.has(p))
    : required.every((p) => userPermissions.has(p));

  if (!hasPermission) return fallback;

  return <>{children}</>;
}
