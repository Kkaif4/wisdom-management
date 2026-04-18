import { prisma } from "@/lib/prisma";

export interface LogDocumentActionParams {
  type: string;
  action: "PRINT" | "EXPORT_EXCEL" | "EXPORT_PDF";
  entityId: string;
  userId: string;
  organizationId: string;
  metadata?: any;
}

export class AuditService {
  /**
   * Logs a document-related action to the system audit trail.
   */
  static async logDocumentAction(
    params: LogDocumentActionParams,
  ): Promise<void> {
    const { type, action, entityId, userId, organizationId, metadata } = params;

    try {
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
    } catch (err) {
      // Don't crash the UI if auditing fails, but log it
      console.error("Auditing failed:", err);
    }
  }
}
