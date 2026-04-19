import { AuthenticationError, ForbiddenError } from "../types/auth.types";
import { NextResponse } from "next/server";

export class ErrorUtils {
  /**
   * Standardized error response for API routes.
   * Transforms custom auth errors into appropriate HTTP responses.
   */
  static handleApiError(error: unknown) {
    console.error("[API_ERROR]", error);

    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.message, code: "UNAUTHENTICATED" },
        { status: 401 },
      );
    }

    if (error instanceof ForbiddenError) {
      return NextResponse.json(
        { error: error.message, code: "FORBIDDEN" },
        { status: 403 },
      );
    }

    // Default 500 error
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: message, code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }

  /**
   * Helper for Server Actions to return standard error objects
   * instead of throwing (which causes Next.js to show generic error page).
   */
  static handleActionError(error: unknown) {
    console.error("[ACTION_ERROR]", error);

    if (error instanceof AuthenticationError) {
      return { success: false, error: error.message, code: "UNAUTHENTICATED" };
    }

    if (error instanceof ForbiddenError) {
      return { success: false, error: error.message, code: "FORBIDDEN" };
    }

    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return { success: false, error: message, code: "INTERNAL_ERROR" };
  }
}
