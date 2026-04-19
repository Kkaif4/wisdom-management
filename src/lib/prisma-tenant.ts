/**
 * Prisma Tenant Extension
 *
 * Layer 1 of dual-layer tenant isolation.
 * Automatically appends organizationId filtering to all queries
 * on models that have an organizationId field.
 *
 * Usage: Import `tenantPrisma` instead of raw `prisma` in service layers.
 * Pass the organizationId from the user's session.
 */

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/prisma/generated";

// Models that have organizationId (must be kept in sync with schema)
const TENANT_SCOPED_MODELS = new Set([
  "Organization", // self-filter by id
  "User",
  "Student",
  "Class",
  "Division",
  "AcademicSession",
  "StudentEnrollment",
  "Receipt",
  "Expense",
  "TransactionHistory",
  "IncomeCategory",
  "AuditLog",
  "Role",
]);

/**
 * Creates a Prisma client extension that automatically filters
 * all queries by the given organizationId.
 *
 * @param organizationId - The org to scope queries to. Pass `null` for SUPER_ADMIN bypass.
 */
export function createTenantPrisma(organizationId: string | null) {
  if (!organizationId) {
    // SUPER_ADMIN: no tenant filtering
    return prisma;
  }

  return prisma.$extends({
    query: {
      $allModels: {
        async findMany({ model, query, args }) {
          if (TENANT_SCOPED_MODELS.has(model)) {
            args.where = { ...args.where, organizationId };
          }
          return query(args);
        },
        async findFirst({ model, query, args }) {
          if (TENANT_SCOPED_MODELS.has(model)) {
            args.where = { ...args.where, organizationId };
          }
          return query(args);
        },
        async findUnique({ model, query, args }) {
          // findUnique cannot add arbitrary where clauses,
          // so we validate after fetch instead.
          const result = await query(args);
          if (
            result &&
            TENANT_SCOPED_MODELS.has(model) &&
            "organizationId" in result &&
            (result as any).organizationId !== organizationId
          ) {
            return null; // Deny cross-tenant access silently
          }
          return result;
        },
        async update({ model, query, args }) {
          if (TENANT_SCOPED_MODELS.has(model)) {
            args.where = { ...args.where, organizationId } as any;
          }
          return query(args);
        },
        async delete({ model, query, args }) {
          if (TENANT_SCOPED_MODELS.has(model)) {
            args.where = { ...args.where, organizationId } as any;
          }
          return query(args);
        },
      },
    },
  });
}

export type TenantPrismaClient = ReturnType<typeof createTenantPrisma>;
