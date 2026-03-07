import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AccountType, PaymentMode, TransactionType } from "@/prisma/generated";
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
        // 1. Atomically increment Organization counter and update balances in ONE round-trip
        const balanceField =
          paymentMode === "CASH" ? "currentCashBalance" : "currentBankBalance";

        const org = await tx.organization.update({
          where: { id: orgId },
          data: {
            receiptCounter: { increment: 1 },
            [balanceField]: { increment: Number(amount) },
            isFirstTransactionDone: true,
          },
        });

        // 2. Generate Receipt Number using the new counter value
        const receiptNumber = `REC-${new Date().getFullYear()}-${org.receiptCounter.toString().padStart(4, "0")}`;

        // 3. Create Receipt
        const receipt = await tx.receipt.create({
          data: {
            receiptNumber,
            amount: Number(amount),
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
            totalPaid: { increment: Number(amount) },
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
            debitAmount: Number(amount),
            balanceAfter: balanceAfter,
            createdBy: userId,
            organizationId: orgId,
          },
        });

        return receipt;
      },
      {
        maxWait: 15000, // 15 seconds max wait to connect to prisma
        timeout: 20000, // 20 seconds timeout for the transaction
      },
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error creating receipt:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create receipt" },
      { status: 500 },
    );
  }
}
