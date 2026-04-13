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

    const { studentId, amount, paymentMode, date, remarks, category } =
      await req.json();

    const actualCategory = category || "Tuition Fee";
    const needsStudent = ["Tuition Fee", "Student Dues"].includes(
      actualCategory,
    );

    if (!amount || !paymentMode || !date || (needsStudent && !studentId)) {
      return NextResponse.json(
        {
          error: needsStudent
            ? "Missing required fields (including Student)"
            : "Missing required fields",
        },
        { status: 400 },
      );
    }

    const orgId = session.user.organizationId;
    const userId = session.user.id;

    // Execute in transaction to ensure atomicity
    const result = await prisma.$transaction(
      async (tx) => {
        // 1. Fetch active enrollment if studentId is provided
        let enrollmentId = null;
        if (studentId && needsStudent) {
          const activeEnrollment = await tx.studentEnrollment.findFirst({
            where: {
              studentId,
              organizationId: orgId,
              status: "ACTIVE",
            },
          });

          if (!activeEnrollment) {
            throw new Error(
              "No active enrollment found for this student in the current session",
            );
          }
          enrollmentId = activeEnrollment.id;
        }

        // 2. Atomically increment Organization counter and update balances
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

        // 3. Generate Receipt Number and check for collisions
        let receiptCounter = org.receiptCounter;
        let receiptNumber = `REC-${new Date().getFullYear()}-${receiptCounter.toString().padStart(4, "0")}`;

        const existing = await tx.receipt.findUnique({
          where: {
            receiptNumber_organizationId: {
              receiptNumber,
              organizationId: orgId,
            },
          },
        });

        if (existing) {
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

            org = await tx.organization.update({
              where: { id: orgId },
              data: { receiptCounter: nextIdx },
            });
            receiptCounter = nextIdx;
            receiptNumber = `REC-${new Date().getFullYear()}-${receiptCounter.toString().padStart(4, "0")}`;
          }
        }

        // 4. Create Receipt
        const receipt = await tx.receipt.create({
          data: {
            receiptNumber,
            amount: decimalAmount,
            paymentMode: paymentMode as PaymentMode,
            category: actualCategory,
            date: new Date(date),
            remarks,
            studentId,
            studentEnrollmentId: enrollmentId as string, // Required by schema
            organizationId: orgId,
            createdBy: userId,
          },
        });

        // 5. Update Enrollment totalPaid
        if (enrollmentId) {
          await tx.studentEnrollment.update({
            where: { id: enrollmentId },
            data: {
              totalPaid: { increment: decimalAmount },
            },
          });
        }

        // 6. Create Transaction History
        const balanceAfter =
          paymentMode === "CASH"
            ? org.currentCashBalance
            : org.currentBankBalance;

        await tx.transactionHistory.create({
          data: {
            date: new Date(date),
            type:
              actualCategory === "Tuition Fee"
                ? TransactionType.FEE_COLLECTION
                : TransactionType.OTHER_INCOME,
            receiptId: receipt.id,
            studentEnrollmentId: enrollmentId,
            description: `${actualCategory} receipt: ${receiptNumber}`,
            impactedAccount: paymentMode as AccountType,
            debitAmount: decimalAmount,
            balanceAfter: balanceAfter,
            studentId: studentId,
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
