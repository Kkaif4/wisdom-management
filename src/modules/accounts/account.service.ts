import { AccountType, TransactionType, Prisma } from "@/prisma/generated";

export class AccountService {
  static async updateBalance(params: {
    tx: Prisma.TransactionClient;
    organizationId: string;
    accountType: "CASH" | "BANK";
    amount: Prisma.Decimal;
    mutationType: "INCREASE" | "DECREASE";
  }) {
    const { tx, organizationId, accountType, amount, mutationType } = params;

    const updateField =
      accountType === "CASH" ? "currentCashBalance" : "currentBankBalance";
    const incrementValue =
      mutationType === "INCREASE" ? amount : amount.negated();

    const organization = await tx.organization.update({
      where: { id: organizationId },
      data: {
        [updateField]: {
          increment: incrementValue,
        },
        isFirstTransactionDone: true,
      },
    });

    return organization[updateField] as Prisma.Decimal;
  }

  /**
   * Logs a record into TransactionHistory.
   */
  static async logTransaction(params: {
    tx: Prisma.TransactionClient;
    organizationId: string;
    userId: string;
    type: TransactionType;
    impactedAccount: AccountType;
    debitAmount?: Prisma.Decimal;
    creditAmount?: Prisma.Decimal;
    balanceAfter: Prisma.Decimal;
    description?: string;
    receiptId?: string;
    expenseId?: string;
  }) {
    const {
      tx,
      organizationId,
      userId,
      type,
      impactedAccount,
      debitAmount = new Prisma.Decimal(0),
      creditAmount = new Prisma.Decimal(0),
      balanceAfter,
      description,
      receiptId,
      expenseId,
    } = params;

    return await tx.transactionHistory.create({
      data: {
        organizationId,
        createdBy: userId,
        date: new Date(),
        type,
        impactedAccount,
        debitAmount,
        creditAmount,
        balanceAfter,
        description,
        receiptId,
        expenseId,
      },
    });
  }
}
