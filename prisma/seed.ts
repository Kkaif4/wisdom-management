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
    name: "SUPER_ADMIN",
    description: "System-wide super administrator",
    scope: "SYSTEM",
  },
  ORG_ADMIN: {
    name: "ORG_ADMIN",
    description: "Organization administrator",
    scope: "ORGANIZATION",
  },
  ORG_STAFF: {
    name: "ORG_STAFF",
    description: "Organization staff member",
    scope: "ORGANIZATION",
  },
  GUEST: {
    name: "GUEST",
    description: "User with no permissions",
    scope: "ORGANIZATION",
  },
} as const;

// ──────────────────────────────────────────────────────────────
// Permissions organized by module
// ──────────────────────────────────────────────────────────────

const PERMISSIONS = {
  // Screen Access Permissions
  SCREENS: [
    { name: "VIEW_DASHBOARD", description: "Access dashboard screen" },
    { name: "VIEW_STUDENTS_SCREEN", description: "Access students screen" },
    { name: "VIEW_RECEIPTS_SCREEN", description: "Access receipts screen" },
    { name: "VIEW_FEES_SCREEN", description: "Access fees management screen" },
    { name: "VIEW_EXPENSES_SCREEN", description: "Access expenses screen" },
    { name: "VIEW_REPORTS_SCREEN", description: "Access reports screen" },
    { name: "VIEW_SETTINGS_SCREEN", description: "Access settings screen" },
    {
      name: "VIEW_USERS_SCREEN",
      description: "Access users management screen",
    },
  ],

  // Student Module Permissions
  STUDENTS: [
    { name: "VIEW_STUDENT_LIST", description: "View list of students" },
    {
      name: "VIEW_STUDENT_DETAILS",
      description: "View individual student details",
    },
    { name: "CREATE_STUDENT", description: "Create new student records" },
    { name: "EDIT_STUDENT", description: "Edit existing student records" },
    { name: "DELETE_STUDENT", description: "Delete student records" },
    { name: "IMPORT_STUDENTS", description: "Import students from file" },
    { name: "EXPORT_STUDENTS", description: "Export student data" },
  ],

  // Receipt Module Permissions
  RECEIPTS: [
    { name: "VIEW_RECEIPT_LIST", description: "View list of receipts" },
    {
      name: "VIEW_RECEIPT_DETAILS",
      description: "View individual receipt details",
    },
    { name: "CREATE_RECEIPT", description: "Create new fee receipts" },
    { name: "EDIT_RECEIPT", description: "Edit receipt details" },
    { name: "CANCEL_RECEIPT", description: "Cancel existing receipts" },
    { name: "PRINT_RECEIPT", description: "Print receipts" },
    {
      name: "EMAIL_RECEIPT",
      description: "Email receipts to students/parents",
    },
  ],

  // Fee Management Permissions
  FEES: [
    { name: "VIEW_FEE_STRUCTURE", description: "View fee structures" },
    { name: "CREATE_FEE_STRUCTURE", description: "Create fee structures" },
    { name: "EDIT_FEE_STRUCTURE", description: "Edit fee structures" },
    { name: "DELETE_FEE_STRUCTURE", description: "Delete fee structures" },
    { name: "ASSIGN_FEES", description: "Assign fees to students" },
    { name: "WAIVE_FEES", description: "Waive student fees" },
    { name: "APPLY_DISCOUNTS", description: "Apply fee discounts" },
  ],

  // Expense Module Permissions
  EXPENSES: [
    { name: "VIEW_EXPENSE_LIST", description: "View list of expenses" },
    {
      name: "VIEW_EXPENSE_DETAILS",
      description: "View individual expense details",
    },
    { name: "CREATE_EXPENSE", description: "Create new expense records" },
    { name: "EDIT_EXPENSE", description: "Edit expense records" },
    { name: "DELETE_EXPENSE", description: "Delete expense records" },
    { name: "APPROVE_EXPENSE", description: "Approve expense records" },
  ],

  // Reports Module Permissions
  REPORTS: [
    { name: "VIEW_FINANCIAL_REPORTS", description: "View financial reports" },
    {
      name: "VIEW_STUDENT_REPORTS",
      description: "View student-related reports",
    },
    { name: "VIEW_FEE_REPORTS", description: "View fee collection reports" },
    { name: "VIEW_EXPENSE_REPORTS", description: "View expense reports" },
    { name: "EXPORT_REPORTS", description: "Export reports to Excel/PDF" },
    { name: "GENERATE_CUSTOM_REPORTS", description: "Generate custom reports" },
  ],

  // Organization & Settings Permissions
  ORGANIZATION: [
    { name: "VIEW_ORG_SETTINGS", description: "View organization settings" },
    { name: "EDIT_ORG_SETTINGS", description: "Edit organization settings" },
    {
      name: "MANAGE_ACADEMIC_SESSIONS",
      description: "Manage academic sessions",
    },
    {
      name: "MANAGE_INCOME_CATEGORIES",
      description: "Manage income categories",
    },
    {
      name: "MANAGE_EXPENSE_CATEGORIES",
      description: "Manage expense categories",
    },
    { name: "VIEW_AUDIT_LOGS", description: "View system audit logs" },
  ],

  // User Management Permissions
  USERS: [
    { name: "VIEW_USER_LIST", description: "View list of users" },
    { name: "CREATE_USER", description: "Create new users" },
    { name: "EDIT_USER", description: "Edit user details" },
    { name: "DELETE_USER", description: "Delete users" },
    { name: "ASSIGN_ROLES", description: "Assign roles to users" },
    { name: "RESET_USER_PASSWORD", description: "Reset user passwords" },
  ],
} as const;

// Flatten all permissions into a single array
const ALL_PERMISSIONS = [
  ...PERMISSIONS.SCREENS,
  ...PERMISSIONS.STUDENTS,
  ...PERMISSIONS.RECEIPTS,
  ...PERMISSIONS.FEES,
  ...PERMISSIONS.EXPENSES,
  ...PERMISSIONS.REPORTS,
  ...PERMISSIONS.ORGANIZATION,
  ...PERMISSIONS.USERS,
] as const;

// ──────────────────────────────────────────────────────────────
// Role → Permission mappings
// ──────────────────────────────────────────────────────────────

const STAFF_PERMISSIONS = [
  // Screens
  "VIEW_DASHBOARD",
  "VIEW_STUDENTS_SCREEN",
  "VIEW_RECEIPTS_SCREEN",
  "VIEW_FEES_SCREEN",
  "VIEW_REPORTS_SCREEN",

  // Students
  "VIEW_STUDENT_LIST",
  "VIEW_STUDENT_DETAILS",
  "CREATE_STUDENT",
  "EDIT_STUDENT",
  "EXPORT_STUDENTS",

  // Receipts
  "VIEW_RECEIPT_LIST",
  "VIEW_RECEIPT_DETAILS",
  "CREATE_RECEIPT",
  "PRINT_RECEIPT",
  "EMAIL_RECEIPT",

  // Fees
  "VIEW_FEE_STRUCTURE",
  "ASSIGN_FEES",

  // Reports
  "VIEW_FINANCIAL_REPORTS",
  "VIEW_STUDENT_REPORTS",
  "VIEW_FEE_REPORTS",
];

const ADMIN_PERMISSIONS = [
  ...STAFF_PERMISSIONS,

  // Additional Screens
  "VIEW_EXPENSES_SCREEN",
  "VIEW_SETTINGS_SCREEN",
  "VIEW_USERS_SCREEN",

  // Students - additional
  "DELETE_STUDENT",
  "IMPORT_STUDENTS",

  // Receipts - additional
  "EDIT_RECEIPT",
  "CANCEL_RECEIPT",

  // Fees - additional
  "CREATE_FEE_STRUCTURE",
  "EDIT_FEE_STRUCTURE",
  "DELETE_FEE_STRUCTURE",
  "WAIVE_FEES",
  "APPLY_DISCOUNTS",

  // Expenses
  "VIEW_EXPENSE_LIST",
  "VIEW_EXPENSE_DETAILS",
  "CREATE_EXPENSE",
  "EDIT_EXPENSE",
  "DELETE_EXPENSE",
  "APPROVE_EXPENSE",

  // Reports - additional
  "VIEW_EXPENSE_REPORTS",
  "EXPORT_REPORTS",
  "GENERATE_CUSTOM_REPORTS",

  // Organization
  "VIEW_ORG_SETTINGS",
  "EDIT_ORG_SETTINGS",
  "MANAGE_ACADEMIC_SESSIONS",
  "MANAGE_INCOME_CATEGORIES",
  "MANAGE_EXPENSE_CATEGORIES",
  "VIEW_AUDIT_LOGS",

  // Users
  "VIEW_USER_LIST",
  "CREATE_USER",
  "EDIT_USER",
  "DELETE_USER",
  "ASSIGN_ROLES",
  "RESET_USER_PASSWORD",
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

  const guestRole = await prisma.role.upsert({
    where: { name: SYSTEM_ROLES.GUEST.name },
    update: SYSTEM_ROLES.GUEST,
    create: SYSTEM_ROLES.GUEST,
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

  await prisma.user.upsert({
    where: { email: "guest@wisdom.com" },
    update: { roleId: guestRole.id },
    create: {
      name: "Guest User (No Perms)",
      email: "guest@wisdom.com",
      passwordHash,
      roleId: guestRole.id,
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
  console.log("   → 52 Permissions (across 8 modules)");
  console.log("   → 4 Roles (SUPER_ADMIN, ORG_ADMIN, ORG_STAFF, GUEST)");
  console.log("   → 1 Organization");
  console.log("   → 3 Users (admin@wisdom.com / staff@wisdom.com / guest@wisdom.com)");
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
