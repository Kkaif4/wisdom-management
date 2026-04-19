"use client";

import { useSession } from "next-auth/react";
import { SessionUser } from "../types/auth.types";

/**
 * Client-side hook to access the current authenticated user.
 * Returns a typed SessionUser or null.
 */
export function useAuth() {
  const { data: session, status } = useSession();

  const isLoading = status === "loading";
  const user = session?.user as SessionUser | undefined;

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
