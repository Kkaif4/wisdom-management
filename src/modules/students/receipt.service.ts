import { prisma } from "../../lib/prisma";
import { AccountService } from "../accounts/account.service";
import {
  PaymentMode,
  ReceiptStatus,
  TransactionType,
  Prisma,
} from "@/prisma/generated";

export class ReceiptService {
  static async collectFee(params: {
    studentId?: string;
    category: string;
    organizationId: string;
    userId: string;
    amount: Prisma.Decimal;
    paymentMode: PaymentMode;
    receiptNumber: string;
    date: Date;
    remarks?: string;
  }) {
    const {
      studentId,
      category,
      organizationId,
      userId,
      amount,
      paymentMode,
      receiptNumber,
      date,
      remarks,
    } = params;

    return await prisma.$transaction(
      async (tx) => {
        // 1. Create Receipt
        const receipt = await tx.receipt.create({
          data: {
            receiptNumber,
            amount,
            paymentMode,
            category,
            date,
            remarks,
            studentId,
            organizationId,
            createdBy: userId,
          },
        });

        // 2. Update Student Paid Amount
        if (studentId) {
          await tx.student.update({
            where: { id: studentId },
            data: {
              totalPaid: {
                increment: amount,
              },
            },
          });
        }

        // 3. Update Organization Balance
        const accountType = paymentMode === "CASH" ? "CASH" : "BANK";
        const balanceAfter = await AccountService.updateBalance({
          tx,
          organizationId,
          accountType,
          amount,
          mutationType: "INCREASE",
        });

        // 4. Log Transaction History
        const transactionType =
          category === "Tuition Fee" ? "FEE_COLLECTION" : "OTHER_INCOME";
        await AccountService.logTransaction({
          tx,
          organizationId,
          userId,
          type: transactionType as TransactionType,
          impactedAccount: accountType,
          debitAmount: amount,
          balanceAfter,
          description: `${category} receipt: ${receiptNumber}`,
          receiptId: receipt.id,
        });

        return receipt;
      },
      {
        maxWait: 15000,
        timeout: 20000,
      },
    );
  }

  /**
   * Cancels a receipt and reverses all impacts.
   */
  static async cancelReceipt(params: {
    receiptId: string;
    userId: string;
    reason: string;
  }) {
    const { receiptId, userId, reason } = params;

    return await prisma.$transaction(
      async (tx) => {
        const receipt = await tx.receipt.findUniqueOrThrow({
          where: { id: receiptId },
          include: { student: true },
        });

        if (receipt.status === ReceiptStatus.CANCELLED) {
          throw new Error("Receipt is already cancelled");
        }

        // 1. Update Receipt Status
        const updatedReceipt = await tx.receipt.update({
          where: { id: receiptId },
          data: {
            status: ReceiptStatus.CANCELLED,
            cancelledAt: new Date(),
            cancelledBy: userId,
            remarks: receipt.remarks
              ? `${receipt.remarks} | CANCELLED: ${reason}`
              : `CANCELLED: ${reason}`,
          },
        });

        // 2. Reverse Student Paid Amount
        if (receipt.studentId) {
          await tx.student.update({
            where: { id: receipt.studentId },
            data: {
              totalPaid: {
                decrement: receipt.amount,
              },
            },
          });
        }

        // 3. Reverse Organization Balance
        const accountType = receipt.paymentMode === "CASH" ? "CASH" : "BANK";
        const balanceAfter = await AccountService.updateBalance({
          tx,
          organizationId: receipt.organizationId,
          accountType,
          amount: receipt.amount,
          mutationType: "DECREASE",
        });

        // 4. Log Reversal in Transaction History
        const transactionType =
          receipt.category === "Tuition Fee"
            ? "FEE_COLLECTION"
            : "OTHER_INCOME";
        await AccountService.logTransaction({
          tx,
          organizationId: receipt.organizationId,
          userId,
          type: transactionType as TransactionType,
          impactedAccount: accountType,
          creditAmount: receipt.amount,
          balanceAfter,
          description: `REVERSAL: Receipt ${receipt.receiptNumber} (${receipt.category}) cancelled. Reason: ${reason}`,
          receiptId: receipt.id,
        });

        return updatedReceipt;
      },
      {
        maxWait: 15000,
        timeout: 20000,
      },
    );
  }

  static async listReceipts(organizationId: string) {
    return await prisma.receipt.findMany({
      where: { organizationId },
      include: {
        student: { select: { name: true, class: true } },
        createdByUser: { select: { name: true } },
      },
      orderBy: { date: "desc" },
      take: 50,
    });
  }
}
