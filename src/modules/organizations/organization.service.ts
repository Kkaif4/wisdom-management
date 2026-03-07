import { prisma } from "@/lib/prisma";
import { Prisma, SystemRole } from "@/prisma/generated";

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
            role: SystemRole.ORG_ADMIN,
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
}
