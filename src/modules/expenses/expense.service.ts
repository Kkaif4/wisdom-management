import { prisma } from "../../lib/prisma";
import { AccountService } from "../accounts/account.service";
import { PaymentMode, Prisma } from "@/prisma/generated";

export class ExpenseService {
  static async createExpense(params: {
    organizationId: string;
    userId: string;
    amount: Prisma.Decimal;
    paidFrom: PaymentMode;
    category: string;
    description: string;
    date: Date;
  }) {
    const {
      organizationId,
      userId,
      amount,
      paidFrom,
      category,
      description,
      date,
    } = params;

    return await prisma.$transaction(
      async (tx) => {
        // 1. Create Expense
        const expense = await tx.expense.create({
          data: {
            date,
            amount,
            paidFrom,
            category,
            description,
            organizationId,
          },
        });

        // 2. Decrease Organization Balance
        const accountType = paidFrom === "CASH" ? "CASH" : "BANK";
        const balanceAfter = await AccountService.updateBalance({
          tx,
          organizationId,
          accountType,
          amount,
          mutationType: "DECREASE",
        });

        // 3. Log Transaction
        await AccountService.logTransaction({
          tx,
          organizationId,
          userId,
          type: "EXPENSE",
          impactedAccount: accountType,
          creditAmount: amount,
          balanceAfter,
          description: `Expense: ${category} - ${description}`,
          expenseId: expense.id,
        });

        return expense;
      },
      {
        maxWait: 15000,
        timeout: 20000,
      },
    );
  }

  /**
   * Edits an expense and recalculates balance impact.
   */
  static async updateExpense(params: {
    expenseId: string;
    userId: string;
    amount: Prisma.Decimal;
    paidFrom: PaymentMode;
    category: string;
    description: string;
    date: Date;
  }) {
    const {
      expenseId,
      userId,
      amount: newAmount,
      paidFrom: newPaidFrom,
      category,
      description,
      date,
    } = params;

    return await prisma.$transaction(
      async (tx) => {
        const oldExpense = await tx.expense.findUniqueOrThrow({
          where: { id: expenseId },
        });

        // 1. Reverse Old Impact
        const oldAccountType = oldExpense.paidFrom === "CASH" ? "CASH" : "BANK";
        await AccountService.updateBalance({
          tx,
          organizationId: oldExpense.organizationId,
          accountType: oldAccountType,
          amount: oldExpense.amount,
          mutationType: "INCREASE",
        });

        // 2. Apply New Impact
        const newAccountType = newPaidFrom === "CASH" ? "CASH" : "BANK";
        const balanceAfter = await AccountService.updateBalance({
          tx,
          organizationId: oldExpense.organizationId,
          accountType: newAccountType,
          amount: newAmount,
          mutationType: "DECREASE",
        });

        // 3. Update Expense Record
        const updatedExpense = await tx.expense.update({
          where: { id: expenseId },
          data: {
            amount: newAmount,
            paidFrom: newPaidFrom,
            category,
            description,
            date,
          },
        });

        // 4. Log Re-adjustment in Transaction History
        await AccountService.logTransaction({
          tx,
          organizationId: oldExpense.organizationId,
          userId,
          type: "EXPENSE",
          impactedAccount: newAccountType,
          creditAmount: newAmount,
          balanceAfter,
          description: `EDITED Expense: ${category} - ${description}`,
          expenseId: updatedExpense.id,
        });

        return updatedExpense;
      },
      {
        maxWait: 15000,
        timeout: 20000,
      },
    );
  }
}
