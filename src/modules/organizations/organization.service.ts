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
}

