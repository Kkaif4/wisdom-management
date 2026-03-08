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
        const cashBalanceAfter = await AccountService.updateBalance({
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

        // 3. Log into TransactionHistory (Double Entry)

        // Cash Side (Credit/Out)
        await AccountService.logTransaction({
          tx,
          organizationId,
          userId,
          type: "CASH_DEPOSIT",
          impactedAccount: "CASH",
          creditAmount: amount,
          balanceAfter: cashBalanceAfter,
          description: `Transfer to Bank: ${remarks || "Internal deposit"}`,
        });

        // Bank Side (Debit/In)
        await AccountService.logTransaction({
          tx,
          organizationId,
          userId,
          type: "CASH_DEPOSIT",
          impactedAccount: "BANK",
          debitAmount: amount,
          balanceAfter: bankBalanceAfter,
          description: `Transfer from Cash: ${remarks || "Internal deposit"}`,
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
        const bankBalanceAfter = await AccountService.updateBalance({
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

        // 3. Log into TransactionHistory (Double Entry)

        // Bank Side (Credit/Out)
        await AccountService.logTransaction({
          tx,
          organizationId,
          userId,
          type: "CASH_WITHDRAWAL",
          impactedAccount: "BANK",
          creditAmount: amount,
          balanceAfter: bankBalanceAfter,
          description: `Transfer to Cash: ${remarks || "Internal withdrawal"}`,
        });

        // Cash Side (Debit/In)
        await AccountService.logTransaction({
          tx,
          organizationId,
          userId,
          type: "CASH_WITHDRAWAL",
          impactedAccount: "CASH",
          debitAmount: amount,
          balanceAfter: cashBalanceAfter,
          description: `Transfer from Bank: ${remarks || "Internal withdrawal"}`,
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
