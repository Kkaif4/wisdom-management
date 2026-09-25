import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * DELETE /api/debug/reset-org-data
 * Developer tool only: wipes all students, enrollments, receipts,
 * expenses, transfers, and transaction history for the org.
 * Resets organization balances back to opening balances.
 * Does NOT delete the organization, users, classes, or academic sessions.
 */
export const DELETE = auth(async (req) => {
  if (!req.auth?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgId = req.auth.user.organizationId;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Delete transaction history
      await tx.transactionHistory.deleteMany({ where: { organizationId: orgId } });

      // 2. Delete receipts
      await tx.receipt.deleteMany({ where: { organizationId: orgId } });

      // 3. Delete expenses
      await tx.expense.deleteMany({ where: { organizationId: orgId } });

      // 4. Delete enrollments
      await tx.studentEnrollment.deleteMany({ where: { organizationId: orgId } });

      // 5. Delete students
      await tx.student.deleteMany({ where: { organizationId: orgId } });

      // 6. Reset organization balances to opening balances and reset counters
      const org = await tx.organization.findUnique({ where: { id: orgId } });
      if (org) {
        await tx.organization.update({
          where: { id: orgId },
          data: {
            currentCashBalance: org.openingCashBalance,
            currentBankBalance: org.openingBankBalance,
            receiptCounter: 0,
            isFirstTransactionDone: false,
            totalStudentCount: 0,
          },
        });
      }
    });

    return NextResponse.json({ success: true, message: "All organization data wiped successfully." });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to reset organization data" },
      { status: 500 },
    );
  }
});
