import { redirect } from "next/navigation";
import { SessionService } from "../services/session.service";

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Server Component Guard
 * Standardizes authentication enforcement for pages.
 * Redirects to login if session is missing or invalid.
 */
export async function AuthGuard({ children }: AuthGuardProps) {
  try {
    await SessionService.requireSession();
    return <>{children}</>;
  } catch (error) {
    redirect("/login");
  }
}
