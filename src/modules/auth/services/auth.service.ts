import { prisma } from "@/lib/prisma";
import { PasswordUtils } from "../utils/password.utils";
import { AuthenticationError } from "../types/auth.types";

export class AuthService {
  /**
   * Validates user credentials.
   * Handles failed attempts, account lockout, and active status checks.
   */
  static async validateCredentials(email: string, password?: string) {
    if (!password) return null;
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      return null; // Return null instead of throwing to avoid email enumeration via timing
    }

    // 1. Check if account is active
    if (!user.isActive) {
      throw new AuthenticationError(
        "Your account has been deactivated. Please contact support.",
      );
    }

    // 2. Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 60000,
      );

      throw new AuthenticationError(
        `Account locked. Please try again in ${remainingMinutes} minutes.`,
      );
    }

    // 3. Verify password
    const isPasswordValid = await PasswordUtils.comparePassword(
      password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  /**
   * Registers a new user and assigns a role.
   */
  static async createUser(data: {
    email: string;
    name: string;
    passwordHash: string;
    roleName: "ORG_ADMIN" | "ORG_STAFF";
    organizationId: string;
  }) {
    const role = await prisma.role.findUnique({
      where: { name: data.roleName },
    });

    if (!role) {
      throw new Error(
        `System role ${data.roleName} not found. Ensure seeding is complete.`,
      );
    }

    return await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash: data.passwordHash,
        roleId: role.id,
        organizationId: data.organizationId,
      },
      include: { role: true },
    });
  }
}
