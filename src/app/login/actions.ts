"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

/**
 * Server Action for Login
 * Handles errors and returns them as values to the client
 */
export async function loginAction(formData: {
  email: string;
  password: string;
}) {
  try {
    // 3. Modify the login flow to use redirect: false
    // Note: On the server side, NextAuth v5 might still trigger a redirect on SUCCESS,
    // which we catch below.
    await signIn("credentials", {
      email: formData.email,
      password: formData.password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      // 2. Meaningful errors instead of failing silently
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Invalid email or password" };
        default:
          return {
            success: false,
            error: "Something went wrong. Please try again.",
          };
      }
    }

    // NextAuth v5 success often results in a NEXT_REDIRECT error which is actually success
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      return { success: true };
    }

    // Re-throw if it's a real redirect from Next.js (not NextAuth success)
    throw error;
  }
}
