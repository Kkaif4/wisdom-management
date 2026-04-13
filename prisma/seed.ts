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
  // 3. Classes (1–10) with Divisions (A, B, C)
  // ────────────────────────────────────────────────────
  console.log("Creating Classes & Divisions...");
  const divisionNames = ["A", "B", "C"];

  for (let i = 1; i <= 10; i++) {
    const cls = await prisma.class.create({
      data: {
        name: `Class ${i}`,
        displayOrder: i,
        organizationId: org.id,
      },
    });

    await prisma.division.createMany({
      data: divisionNames.map((name) => ({
        name,
        classId: cls.id,
        organizationId: org.id,
      })),
    });
  }

  // ────────────────────────────────────────────────────
  // 4. Academic Session
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

  console.log("✅ Seed completed successfully");
  console.log("   → 1 Organization");
  console.log("   → 2 Users (admin@wisdom.com / staff@wisdom.com)");
  console.log("   → 10 Classes with 3 Divisions each (A, B, C)");
  console.log("   → 1 Active Academic Session (2025-26)");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
