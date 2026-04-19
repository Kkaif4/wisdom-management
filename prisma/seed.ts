import { PrismaClient } from "./generated";
import bcrypt from "bcryptjs";
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ──────────────────────────────────────────────────────────────
// System Roles Constants (Hardcoded IDs for easier migration)
// ──────────────────────────────────────────────────────────────

const SYSTEM_ROLES = {
  SUPER_ADMIN: {
    id: "00000000-0000-4000-a000-000000000001",
    name: "SUPER_ADMIN",
    description: "System-wide super administrator",
    scope: "SYSTEM",
  },
  ORG_ADMIN: {
    id: "00000000-0000-4000-a000-000000000002",
    name: "ORG_ADMIN",
    description: "Organization administrator",
    scope: "ORGANIZATION",
  },
  ORG_STAFF: {
    id: "00000000-0000-4000-a000-000000000003",
    name: "ORG_STAFF",
    description: "Organization staff member",
    scope: "ORGANIZATION",
  },
} as const;

const ALL_PERMISSIONS = [
  // Dashboard
  { name: "VIEW_DASHBOARD", description: "View the main dashboard" },

  // Receipts
  { name: "VIEW_RECEIPTS", description: "View fee receipts" },
  { name: "CREATE_RECEIPT", description: "Create new fee receipts" },
  { name: "CANCEL_RECEIPT", description: "Cancel existing receipts" },

  // Students
  { name: "VIEW_STUDENTS", description: "View student records" },
  { name: "MANAGE_STUDENTS", description: "Create and edit students" },
  { name: "EDIT_STUDENT", description: "Edit student details" },

  // Fees & Finance
  { name: "MANAGE_FEES", description: "Manage fee assignments" },
  { name: "MANAGE_EXPENSES", description: "Create and manage expenses" },

  // Reports
  { name: "VIEW_REPORTS", description: "View financial reports" },
  { name: "EXPORT_REPORTS", description: "Export reports to Excel/PDF" },

  // Organization
  { name: "MANAGE_ORG", description: "Manage organization settings" },
  { name: "MANAGE_USERS", description: "Create/edit/deactivate users" },
] as const;

// ──────────────────────────────────────────────────────────────
// Role → Permission mappings
// ──────────────────────────────────────────────────────────────

const STAFF_PERMISSIONS = [
  "VIEW_DASHBOARD",
  "VIEW_RECEIPTS",
  "CREATE_RECEIPT",
  "VIEW_STUDENTS",
  "MANAGE_STUDENTS",
  "EDIT_STUDENT",
  "MANAGE_FEES",
  "VIEW_REPORTS",
];

const ADMIN_PERMISSIONS = [
  ...STAFF_PERMISSIONS,
  "CANCEL_RECEIPT",
  "MANAGE_EXPENSES",
  "EXPORT_REPORTS",
  "MANAGE_ORG",
  "MANAGE_USERS",
];

// SUPER_ADMIN gets ALL permissions

// ──────────────────────────────────────────────────────────────
// Main seed
// ──────────────────────────────────────────────────────────────

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 12);

  // ──────────────────────────────────────
  // 1. Permissions (upsert — idempotent)
  // ──────────────────────────────────────
  console.log("Seeding Permissions...");
  const permissionRecords: Record<string, string> = {};

  for (const perm of ALL_PERMISSIONS) {
    const record = await prisma.permission.upsert({
      where: { name: perm.name },
      update: { description: perm.description },
      create: {
        name: perm.name,
        description: perm.description,
        scope: "ORGANIZATION",
      },
    });
    permissionRecords[perm.name] = record.id;
  }

  // ──────────────────────────────────────
  // 2. Roles (upsert — idempotent)
  // ──────────────────────────────────────
  console.log("Seeding Roles...");

  const superAdminRole = await prisma.role.upsert({
    where: { name: SYSTEM_ROLES.SUPER_ADMIN.name },
    update: SYSTEM_ROLES.SUPER_ADMIN,
    create: SYSTEM_ROLES.SUPER_ADMIN,
  });

  const orgAdminRole = await prisma.role.upsert({
    where: { name: SYSTEM_ROLES.ORG_ADMIN.name },
    update: SYSTEM_ROLES.ORG_ADMIN,
    create: SYSTEM_ROLES.ORG_ADMIN,
  });

  const orgStaffRole = await prisma.role.upsert({
    where: { name: SYSTEM_ROLES.ORG_STAFF.name },
    update: SYSTEM_ROLES.ORG_STAFF,
    create: SYSTEM_ROLES.ORG_STAFF,
  });

  // ──────────────────────────────────────
  // 3. RolePermission mappings
  // ──────────────────────────────────────
  console.log("Seeding Role-Permission mappings...");

  // Helper to assign permissions to a role
  async function assignPermissions(roleId: string, permNames: string[]) {
    for (const name of permNames) {
      const permId = permissionRecords[name];
      if (!permId) {
        console.warn(`  ⚠ Permission "${name}" not found, skipping`);
        continue;
      }
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId, permissionId: permId } },
        update: {},
        create: { roleId, permissionId: permId },
      });
    }
  }

  // SUPER_ADMIN → all permissions
  await assignPermissions(
    superAdminRole.id,
    ALL_PERMISSIONS.map((p) => p.name),
  );

  // ORG_ADMIN → admin subset
  await assignPermissions(orgAdminRole.id, ADMIN_PERMISSIONS);

  // ORG_STAFF → staff subset
  await assignPermissions(orgStaffRole.id, STAFF_PERMISSIONS);

  // ──────────────────────────────────────
  // 4. Organization
  // ──────────────────────────────────────
  console.log("Creating Organization...");
  const org = await prisma.organization.upsert({
    where: { id: "seed-org-wisdom" },
    update: {},
    create: {
      id: "seed-org-wisdom",
      name: "Wisdom School",
      openingCashBalance: 0,
      openingBankBalance: 0,
      currentCashBalance: 0,
      currentBankBalance: 0,
      isFirstTransactionDone: false,
    },
  });

  // ──────────────────────────────────────
  // 5. Users
  // ──────────────────────────────────────
  console.log("Creating Users...");

  await prisma.user.upsert({
    where: { email: "admin@wisdom.com" },
    update: { roleId: orgAdminRole.id },
    create: {
      name: "Organization Admin",
      email: "admin@wisdom.com",
      passwordHash,
      roleId: orgAdminRole.id,
      organizationId: org.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "staff@wisdom.com" },
    update: { roleId: orgStaffRole.id },
    create: {
      name: "Staff User",
      email: "staff@wisdom.com",
      passwordHash,
      roleId: orgStaffRole.id,
      organizationId: org.id,
    },
  });

  // ──────────────────────────────────────
  // 6. Academic Session
  // ──────────────────────────────────────
  console.log("Creating Academic Session...");
  await prisma.academicSession.upsert({
    where: {
      name_organizationId: { name: "2025-26", organizationId: org.id },
    },
    update: {},
    create: {
      name: "2025-26",
      startDate: new Date("2025-04-01"),
      endDate: new Date("2026-03-31"),
      status: "ACTIVE",
      organizationId: org.id,
    },
  });

  // ──────────────────────────────────────
  // 7. Default Income Categories
  // ──────────────────────────────────────
  console.log("Creating Income Categories...");
  const categories = [
    {
      name: "Tuition Fee",
      code: "TUITION_FEE",
      affectsTuition: true,
      displayOrder: 1,
    },
    {
      name: "Student Dues",
      code: "STUDENT_DUES",
      affectsTuition: true,
      displayOrder: 2,
    },
    {
      name: "Bonafide Fee",
      code: "BONAFIDE_FEE",
      affectsTuition: false,
      displayOrder: 3,
    },
    {
      name: "Form Fee",
      code: "FORM_FEE",
      affectsTuition: false,
      displayOrder: 4,
    },
    {
      name: "Book Sale",
      code: "BOOK_SALE",
      affectsTuition: false,
      displayOrder: 5,
    },
    {
      name: "TC / Leaving Certificate",
      code: "TC_LEAVING_CERT",
      affectsTuition: false,
      displayOrder: 6,
    },
    { name: "Other", code: "OTHER", affectsTuition: false, displayOrder: 99 },
  ];

  for (const cat of categories) {
    await prisma.incomeCategory.upsert({
      where: {
        code_organizationId: { code: cat.code, organizationId: org.id },
      },
      update: {},
      create: { ...cat, organizationId: org.id },
    });
  }

  console.log("✅ Seed completed successfully");
  console.log("   → 12 Permissions");
  console.log("   → 3 Roles (SUPER_ADMIN, ORG_ADMIN, ORG_STAFF)");
  console.log("   → 1 Organization");
  console.log("   → 2 Users (admin@wisdom.com / staff@wisdom.com)");
  console.log("   → 1 Active Academic Session (2025-26)");
  console.log("   → 7 Income Categories");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
