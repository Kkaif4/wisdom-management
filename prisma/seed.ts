import { PrismaClient, SystemRole, SessionStatus } from "./generated";
import bcrypt from "bcryptjs";
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  // ────────────────────────────────────────────────────
  // 1. Organization
  // ────────────────────────────────────────────────────
  console.log("Creating Organization...");
  const org = await prisma.organization.create({
    data: {
      name: "Wisdom School",
      openingCashBalance: 0,
      openingBankBalance: 0,
      currentCashBalance: 0,
      currentBankBalance: 0,
      isFirstTransactionDone: false,
    },
  });

  // ────────────────────────────────────────────────────
  // 2. Users
  // ────────────────────────────────────────────────────
  console.log("Creating Users...");
  await prisma.user.createMany({
    data: [
      {
        name: "Organization Admin",
        email: "admin@wisdom.com",
        passwordHash,
        role: SystemRole.ORG_ADMIN,
        organizationId: org.id,
      },
      {
        name: "Staff User",
        email: "staff@wisdom.com",
        passwordHash,
        role: SystemRole.ORG_STAFF,
        organizationId: org.id,
      },
    ],
  });

  // ────────────────────────────────────────────────────
  // 3. Academic Session
  // ────────────────────────────────────────────────────
  console.log("Creating Academic Session...");
  await prisma.academicSession.create({
    data: {
      name: "2025-26",
      startDate: new Date("2025-04-01"),
      endDate: new Date("2026-03-31"),
      status: SessionStatus.ACTIVE,
      organizationId: org.id,
    },
  });

  // ────────────────────────────────────────────────────
  // 4. Default Income Categories
  // ────────────────────────────────────────────────────
  console.log("Creating Income Categories...");
  await prisma.incomeCategory.createMany({
    data: [
      {
        name: "Tuition Fee",
        code: "TUITION_FEE",
        affectsTuition: true,
        displayOrder: 1,
        organizationId: org.id,
      },
      {
        name: "Student Dues",
        code: "STUDENT_DUES",
        affectsTuition: true,
        displayOrder: 2,
        organizationId: org.id,
      },
      {
        name: "Bonafide Fee",
        code: "BONAFIDE_FEE",
        affectsTuition: false,
        displayOrder: 3,
        organizationId: org.id,
      },
      {
        name: "Form Fee",
        code: "FORM_FEE",
        affectsTuition: false,
        displayOrder: 4,
        organizationId: org.id,
      },
      {
        name: "Book Sale",
        code: "BOOK_SALE",
        affectsTuition: false,
        displayOrder: 5,
        organizationId: org.id,
      },
      {
        name: "TC / Leaving Certificate",
        code: "TC_LEAVING_CERT",
        affectsTuition: false,
        displayOrder: 6,
        organizationId: org.id,
      },
      {
        name: "Other",
        code: "OTHER",
        affectsTuition: false,
        displayOrder: 99,
        organizationId: org.id,
      },
    ],
  });

  console.log("✅ Seed completed successfully");
  console.log("   → 1 Organization");
  console.log("   → 2 Users (admin@wisdom.com / staff@wisdom.com)");
  console.log("   → 1 Active Academic Session (2025-26)");
  console.log("   → 7 Income Categories");
  console.log("   → NO pre-seeded classes (create via UI)");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
