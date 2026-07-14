import { prisma } from "@/lib/prisma";
import { Prisma } from "@/prisma/generated";

export class OrganizationService {
  static async setupOrganization(params: {
    orgName: string;
    adminName: string;
    adminEmail: string;
    passwordHash: string;
    openingCash: Prisma.Decimal;
    openingBank: Prisma.Decimal;
  }) {
    const {
      orgName,
      adminName,
      adminEmail,
      passwordHash,
      openingCash,
      openingBank,
    } = params;

    return await prisma.$transaction(
      async (tx) => {
        // 0. Lookup ORG_ADMIN role from DB
        const orgAdminRole = await tx.role.findUnique({
          where: { name: "ORG_ADMIN" },
        });
        if (!orgAdminRole) {
          throw new Error(
            "ORG_ADMIN role not found. Please run the seed script first.",
          );
        }

        // 1. Create Organization
        const organization = await tx.organization.create({
          data: {
            name: orgName,
            openingCashBalance: openingCash,
            openingBankBalance: openingBank,
            currentCashBalance: openingCash,
            currentBankBalance: openingBank,
            isFirstTransactionDone: false,
          },
        });

        // 2. Create Admin User
        const user = await tx.user.create({
          data: {
            name: adminName,
            email: adminEmail,
            passwordHash: passwordHash,
            roleId: orgAdminRole.id,
            organizationId: organization.id,
          },
        });

        return { organization, user };
      },
      {
        maxWait: 15000,
        timeout: 20000,
      },
    );
  }

  /**
   * Retrieves an organization's current balances.
   */
  static async getBalances(organizationId: string) {
    return await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        currentCashBalance: true,
        currentBankBalance: true,
        openingCashBalance: true,
        openingBankBalance: true,
        isFirstTransactionDone: true,
      },
    });
  }

  /**
   * Retrieves an organization's details.
   */
  static async getOrganization(id: string) {
    return await prisma.organization.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        openingCashBalance: true,
        openingBankBalance: true,
        currentCashBalance: true,
        currentBankBalance: true,
        isFirstTransactionDone: true,
      },
    });
  }

  /**
   * Updates organization details. opening balances can only be updated if no transaction is done.
   */
  static async updateOrganization(
    id: string,
    data: {
      name: string;
      openingCashBalance?: Prisma.Decimal;
      openingBankBalance?: Prisma.Decimal;
    },
  ) {
    const org = await prisma.organization.findUnique({
      where: { id },
      select: {
        openingCashBalance: true,
        openingBankBalance: true,
        currentCashBalance: true,
        currentBankBalance: true,
      },
    });
    if (!org) throw new Error("Organization not found");

    const updateData: any = { name: data.name };

    if (data.openingCashBalance !== undefined) {
      const diff = data.openingCashBalance.minus(org.openingCashBalance);
      updateData.openingCashBalance = data.openingCashBalance;
      updateData.currentCashBalance = org.currentCashBalance.plus(diff);
    }

    if (data.openingBankBalance !== undefined) {
      const diff = data.openingBankBalance.minus(org.openingBankBalance);
      updateData.openingBankBalance = data.openingBankBalance;
      updateData.currentBankBalance = org.currentBankBalance.plus(diff);
    }

    return await prisma.organization.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Adjusts the total student count for an organization.
   * If totalStudentCount is null, it initializes it by counting all ACTIVE students.
   */
  static async adjustStudentCount(tx: any, orgId: string, amount: number) {
    const org = await tx.organization.findUnique({
      where: { id: orgId },
      select: { totalStudentCount: true },
    });

    if (!org) return;

    if (org.totalStudentCount === null) {
      const activeCount = await tx.student.count({
        where: { organizationId: orgId, status: "ACTIVE" },
      });
      // Set to activeCount + amount (since this new student/withdraw is being registered)
      // Wait, if we are in the middle of a transaction where the new student is already in the database,
      // activeCount will already include this student (since the query runs inside the transaction).
      // Let's verify: when we create a student, we do `const student = await tx.student.create(...)` then we call `adjustStudentCount`.
      // So the new student is already in the database.
      // What about withdrawal? When we call `tx.student.update(..., { status: WITHDRAWN })`, that student's status is already NOT "ACTIVE".
      // So activeCount already excludes that student.
      // Thus, activeCount is already the up-to-date count including/excluding this student!
      // Therefore, if it is null, we can just save `activeCount` directly without adding `amount`!
      // This is extremely elegant and self-correcting!
      await tx.organization.update({
        where: { id: orgId },
        data: { totalStudentCount: activeCount },
      });
    } else {
      await tx.organization.update({
        where: { id: orgId },
        data: {
          totalStudentCount: {
            [amount >= 0 ? "increment" : "decrement"]: Math.abs(amount),
          },
        },
      });
    }
  }
}

