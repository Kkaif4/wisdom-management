"use server";

import { prisma } from "@/lib/prisma";

export interface LogDocumentActionParams {
  type: string;
  action: "PRINT" | "EXPORT_EXCEL" | "EXPORT_PDF";
  entityId: string;
  userId: string;
  organizationId: string;
  metadata?: any;
}

/**
 * Logs a document-related action to the system audit trail.
 * This is a Server Action to ensure Prisma logic stays on the server.
 */
export async function logDocumentAction(
  params: LogDocumentActionParams,
): Promise<void> {
  const { type, action, entityId, userId, organizationId, metadata } = params;

  try {
    if (userId === "currentUser" || organizationId === "default") {
      console.warn(
        `[Audit] Skipping log for dummy session: ${userId}/${organizationId}`,
      );
      return;
    }

    await prisma.auditLog.create({
      data: {
        action: `${action}_${type.toUpperCase()}`,
        entity: type,
        entityId,
        userId,
        organizationId,
        newValue: metadata || {},
        timestamp: new Date(),
      },
    });
  } catch (err: any) {
    // P2003 is Foreign key constraint failed
    if (err.code === "P2003") {
      console.warn(
        `[Audit] Failed to log action: User or Organization ID not found in database.`,
      );
      return;
    }
    console.error("Auditing failed:", err);
  }
}
