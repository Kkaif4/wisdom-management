import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  AccountType,
  PaymentMode,
  TransactionType,
  Prisma,
} from "@/prisma/generated";
import { parseDecimal } from "@/lib/decimal";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { studentId, amount, paymentMode, date, remarks } = await req.json();

    if (!studentId || !amount || !paymentMode || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const orgId = session.user.organizationId;
    const userId = session.user.id;

    // Execute in transaction to ensure atomicity
    const result = await prisma.$transaction(
      async (tx) => {
        // 1. Atomically increment Organization counter and update balances
        const decimalAmount = parseDecimal(amount);
        const balanceField =
          paymentMode === "CASH" ? "currentCashBalance" : "currentBankBalance";

        let org = await tx.organization.update({
          where: { id: orgId },
          data: {
            receiptCounter: { increment: 1 },
            [balanceField]: { increment: decimalAmount },
            isFirstTransactionDone: true,
          },
        });

        // 2. Generate Receipt Number and check for collisions (Self-healing logic for migrations)
        let receiptCounter = org.receiptCounter;
        let receiptNumber = `REC-${new Date().getFullYear()}-${receiptCounter.toString().padStart(4, "0")}`;

        // Verify if this receipt number already exists
        const existing = await tx.receipt.findUnique({
          where: {
            receiptNumber_organizationId: {
              receiptNumber,
              organizationId: orgId,
            },
          },
        });

        if (existing) {
          // Counter is out of sync. Find the max and jump.
          const lastReceipt = await tx.receipt.findFirst({
            where: {
              organizationId: orgId,
              receiptNumber: { startsWith: `REC-${new Date().getFullYear()}-` },
            },
            orderBy: { receiptNumber: "desc" },
          });

          if (lastReceipt) {
            const parts = lastReceipt.receiptNumber.split("-");
            const maxIdx = parseInt(parts[parts.length - 1]);
            const nextIdx = maxIdx + 1;

            // Sync the organization counter to the next valid index
            org = await tx.organization.update({
              where: { id: orgId },
              data: { receiptCounter: nextIdx },
            });
            receiptCounter = nextIdx;
            receiptNumber = `REC-${new Date().getFullYear()}-${receiptCounter.toString().padStart(4, "0")}`;
          }
        }

        // 3. Create Receipt
        const receipt = await tx.receipt.create({
          data: {
            receiptNumber,
            amount: decimalAmount,
            paymentMode: paymentMode as PaymentMode,
            date: new Date(date),
            remarks,
            studentId,
            organizationId: orgId,
            createdBy: userId,
          },
        });

        // 4. Update Student totalPaid
        await tx.student.update({
          where: { id: studentId },
          data: {
            totalPaid: { increment: decimalAmount },
          },
        });

        // 5. Create Transaction History
        const balanceAfter =
          paymentMode === "CASH"
            ? org.currentCashBalance
            : org.currentBankBalance;

        await tx.transactionHistory.create({
          data: {
            date: new Date(date),
            type: TransactionType.FEE_COLLECTION,
            receiptId: receipt.id,
            description: `Fee collection for student (${receiptNumber})`,
            impactedAccount: paymentMode as AccountType,
            debitAmount: decimalAmount,
            balanceAfter: balanceAfter,
            createdBy: userId,
            organizationId: orgId,
          },
        });

        return receipt;
      },
      {
        maxWait: 15000,
        timeout: 20000,
      },
    );

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create receipt" },
      { status: 500 },
    );
  }
}
