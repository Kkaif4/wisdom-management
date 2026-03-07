import { PrismaClient, SystemRole } from "./generated";
import bcrypt from "bcryptjs";
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

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

  console.log("Creating Org Admin...");

  const admin = await prisma.user.create({
    data: {
      name: "Organization Admin",
      email: "admin@wisdom.com",
      passwordHash: passwordHash,
      role: SystemRole.ORG_ADMIN,
      organizationId: org.id,
    },
  });

  console.log("Creating Staff User...");

  const staff = await prisma.user.create({
    data: {
      name: "Staff User",
      email: "staff@wisdom.com",
      passwordHash: passwordHash,
      role: SystemRole.ORG_STAFF,
      organizationId: org.id,
    },
  });

  console.log("Seed completed successfully");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
