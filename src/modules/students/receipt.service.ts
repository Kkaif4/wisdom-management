import { prisma } from "../../lib/prisma";
import { AccountService } from "../accounts/account.service";
import { EnrollmentRepository } from "../enrollment/enrollment.repository";
import {
  PaymentMode,
  ReceiptStatus,
  TransactionType,
  Prisma,
} from "@/prisma/generated";

// ──────────────────────────────────────────────────────────────────────
// Receipt Service — Enrollment-Aware
//
// All receipts are now linked to a StudentEnrollment.
// Fee payments update enrollment.totalPaid, not student.totalPaid.
// ──────────────────────────────────────────────────────────────────────

export class ReceiptService {
  /**
   * Collects a fee payment. Updates the enrollment's totalPaid.
   */
  static async collectFee(params: {
    studentEnrollmentId: string;
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
      studentEnrollmentId,
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
        // 1. Create Receipt linked to enrollment
        const receipt = await tx.receipt.create({
          data: {
            receiptNumber,
            amount,
            paymentMode,
            category,
            date,
            remarks,
            studentEnrollmentId,
            studentId,
            organizationId,
            createdBy: userId,
          },
        });

        // 2. Update Enrollment totalPaid (NOT Student)
        await tx.studentEnrollment.update({
          where: { id: studentEnrollmentId },
          data: {
            totalPaid: { increment: amount },
          },
        });

        // 3. Update Organization Balance
        const accountType = paymentMode === "CASH" ? "CASH" : "BANK";
        const balanceAfter = await AccountService.updateBalance({
          tx,
          organizationId,
          accountType,
          amount,
          mutationType: "INCREASE",
        });

        // 4. Log Transaction History with enrollment context
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
          studentEnrollmentId,
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
   * Cancels a receipt and reverses all impacts on enrollment and balance.
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
          include: { student: true, studentEnrollment: true },
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

        // 2. Reverse Enrollment totalPaid (NOT Student)
        await tx.studentEnrollment.update({
          where: { id: receipt.studentEnrollmentId },
          data: {
            totalPaid: { decrement: receipt.amount },
          },
        });

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
          studentEnrollmentId: receipt.studentEnrollmentId,
        });

        return updatedReceipt;
      },
      {
        maxWait: 15000,
        timeout: 20000,
      },
    );
  }

  /**
   * Lists receipts with enrollment and student context.
   */
  static async listReceipts(organizationId: string) {
    return await prisma.receipt.findMany({
      where: { organizationId },
      include: {
        student: { select: { name: true, admissionNumber: true } },
        studentEnrollment: {
          include: {
            class: { select: { name: true } },
            division: { select: { name: true } },
            academicSession: { select: { name: true } },
          },
        },
        createdByUser: { select: { name: true } },
      },
      orderBy: { date: "desc" },
      take: 50,
    });
  }
}
