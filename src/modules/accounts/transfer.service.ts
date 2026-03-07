import { prisma } from "../../lib/prisma";
import { AccountService } from "../accounts/account.service";
import { TransactionType, Prisma } from "@/prisma/generated";

export class TransferService {
  static async depositCashToBank(params: {
    organizationId: string;
    userId: string;
    amount: Prisma.Decimal;
    date: Date;
    remarks?: string;
  }) {
    const { organizationId, userId, amount, date, remarks } = params;

    return await prisma.$transaction(
      async (tx) => {
        // 1. Decrease Cash
        await AccountService.updateBalance({
          tx,
          organizationId,
          accountType: "CASH",
          amount,
          mutationType: "DECREASE",
        });

        // 2. Increase Bank
        const bankBalanceAfter = await AccountService.updateBalance({
          tx,
          organizationId,
          accountType: "BANK",
          amount,
          mutationType: "INCREASE",
        });

        // 3. Log into TransactionHistory
        await AccountService.logTransaction({
          tx,
          organizationId,
          userId,
          type: "CASH_DEPOSIT",
          impactedAccount: "BANK",
          debitAmount: amount,
          balanceAfter: bankBalanceAfter,
          description: remarks || "Cash deposit to bank",
        });

        return { success: true };
      },
      {
        maxWait: 15000,
        timeout: 20000,
      },
    );
  }

  /**
   * Withdraws bank funds to cash.
   */
  static async withdrawBankToCash(params: {
    organizationId: string;
    userId: string;
    amount: Prisma.Decimal;
    date: Date;
    remarks?: string;
  }) {
    const { organizationId, userId, amount, date, remarks } = params;

    return await prisma.$transaction(
      async (tx) => {
        // 1. Decrease Bank
        await AccountService.updateBalance({
          tx,
          organizationId,
          accountType: "BANK",
          amount,
          mutationType: "DECREASE",
        });

        // 2. Increase Cash
        const cashBalanceAfter = await AccountService.updateBalance({
          tx,
          organizationId,
          accountType: "CASH",
          amount,
          mutationType: "INCREASE",
        });

        // 3. Log into TransactionHistory
        await AccountService.logTransaction({
          tx,
          organizationId,
          userId,
          type: "CASH_WITHDRAWAL",
          impactedAccount: "CASH",
          debitAmount: amount,
          balanceAfter: cashBalanceAfter,
          description: remarks || "Bank withdrawal to cash",
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
