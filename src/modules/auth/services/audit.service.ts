import { prisma } from "@/lib/prisma";
import { SessionUser } from "../types/auth.types";

export type AuthEvent =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "LOGOUT"
  | "ACCOUNT_LOCKED"
  | "SESSION_REVOKED"
  | "PERMISSION_DENIED";

export type DataEvent =
  | "RECEIPT_CREATED"
  | "RECEIPT_CANCELLED"
  | "STUDENT_CREATED"
  | "USER_DEACTIVATED"
  | "ROLE_UPDATED";

export class AuditService {
  /**
   * Logs an authentication-related event.
   */
  static async logAuthEvent(
    action: AuthEvent,
    params: {
      userId?: string;
      email?: string;
      ip?: string;
      userAgent?: string;
      reason?: string;
      organizationId?: string;
    },
  ) {
    const { userId, email, ip, userAgent, reason, organizationId } = params;

    // Skip if no user context available for logout/failed events
    // unless we want to log anonymous failures
    if (!userId && action !== "LOGIN_FAILED") return;

    // 1. Data mapping for DB
    // Use undefined for relation fields if context is missing (Prisma treats undefined as NULL for create)
    const dbUserId = userId || undefined;
    const dbOrgId = organizationId || undefined;

    await (prisma.auditLog.create as any)({
      data: {
        action,
        entity: "USER",
        entityId: userId || email || "ANONYMOUS",
        userId: dbUserId,
        organizationId: dbOrgId,
        ip,
        userAgent,
        reason,
        timestamp: new Date(),
      },
    });
  }

  /**
   * Logs a data mutation event.
   */
  static async logDataEvent(
    action: DataEvent,
    user: SessionUser,
    entity: string,
    entityId: string,
    metadata?: { oldValue?: any; newValue?: any; reason?: string },
  ) {
    await prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId,
        userId: user.id,
        organizationId: user.organizationId || "SYSTEM",
        oldValue: metadata?.oldValue,
        newValue: metadata?.newValue,
        reason: metadata?.reason,
        timestamp: new Date(),
      },
    });
  }
}
