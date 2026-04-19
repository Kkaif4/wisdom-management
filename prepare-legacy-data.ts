import { PrismaClient } from "./prisma/generated";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const orgs = await prisma.organization.findMany();

  for (const org of orgs) {
    // 1. Find receipts without studentId
    const receiptsWithoutStudent = await prisma.receipt.findMany({
      where: {
        organizationId: org.id,
        studentId: null,
      },
    });

    if (receiptsWithoutStudent.length === 0) {
      console.warn(`No student-less receipts found for ${org.name}.`);
      continue;
    }

    // 2. Create Placeholder Student if not exists
    let placeholderStudent = await prisma.student.findFirst({
      where: {
        organizationId: org.id,
        name: "General / Legacy Income",
      },
    });

    if (!placeholderStudent) {
      placeholderStudent = await prisma.student.create({
        data: {
          name: "General / Legacy Income",
          admissionNumber: `LEGACY-${org.id.slice(0, 4)}`,
          organizationId: org.id,
          status: "ACTIVE",
        },
      });
    }

    // 3. Link receipts to placeholder
    const updateResult = await prisma.receipt.updateMany({
      where: {
        organizationId: org.id,
        studentId: null,
      },
      data: {
        studentId: placeholderStudent.id,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
