import { prisma } from "../../lib/prisma";
import { AccountService } from "./account.service";
import { TransactionType, AccountType, Prisma } from "@/prisma/generated";

export class AccountAdjustmentService {
  static async adjustBalance(params: {
    organizationId: string;
    userId: string;
    accountType: AccountType;
    amount: Prisma.Decimal;
    type: "ADD" | "SUBTRACT";
    date: Date;
    remarks: string;
  }) {
    const { organizationId, userId, accountType, amount, type, date, remarks } =
      params;

    return await prisma.$transaction(
      async (tx) => {
        const mutationType = type === "ADD" ? "INCREASE" : "DECREASE";

        // 1. Update Balance
        const balanceAfter = await AccountService.updateBalance({
          tx,
          organizationId,
          accountType,
          amount,
          mutationType,
        });

        // 2. Log History
        // We use ACCOUNT_ADJUSTMENT for this
        await AccountService.logTransaction({
          tx,
          organizationId,
          userId,
          type: TransactionType.ACCOUNT_ADJUSTMENT,
          impactedAccount: accountType,
          debitAmount: type === "ADD" ? amount : new Prisma.Decimal(0),
          creditAmount: type === "SUBTRACT" ? amount : new Prisma.Decimal(0),
          balanceAfter,
          description:
            remarks ||
            `Balance ${type.toLowerCase()} (${accountType.toLowerCase()})`,
        });

        return { success: true };
      },
      {
        maxWait: 15000,
        timeout: 20000,
      },
    );
  }
}
