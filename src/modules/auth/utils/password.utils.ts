import bcrypt from "bcryptjs";

export class PasswordUtils {
  /**
   * Hashes a plain text password using bcrypt.
   * @param plainText - The password to hash.
   * @param saltRounds - Number of salt rounds (default: 12).
   */
  static async hashPassword(
    plainText: string,
    saltRounds = 12,
  ): Promise<string> {
    return await bcrypt.hash(plainText, saltRounds);
  }

  /**
   * Verifies a plain text password against a hash.
   * @param plainText - The user-provided password.
   * @param hash - The stored hash.
   */
  static async comparePassword(
    plainText: string,
    hash: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainText, hash);
  }

  /**
   * Validates password strength.
   * Requirements: Min 8 chars, 1 uppercase, 1 lowercase, 1 digit.
   */
  static validateStrength(password: string): {
    isValid: boolean;
    message?: string;
  } {
    if (password.length < 8) {
      return {
        isValid: false,
        message: "Password must be at least 8 characters long",
      };
    }
    if (!/[A-Z]/.test(password)) {
      return {
        isValid: false,
        message: "Password must contain at least one uppercase letter",
      };
    }
    if (!/[a-z]/.test(password)) {
      return {
        isValid: false,
        message: "Password must contain at least one lowercase letter",
      };
    }
    if (!/[0-9]/.test(password)) {
      return {
        isValid: false,
        message: "Password must contain at least one digit",
      };
    }
    return { isValid: true };
  }
}
