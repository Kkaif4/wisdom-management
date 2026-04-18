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

    const {
      studentId,
      enrollmentId: requestedEnrollmentId,
      amount,
      paymentMode,
      date,
      remarks,
      category,
      incomeCategoryId,
    } = await req.json();

    const orgId = session.user.organizationId;
    const userId = session.user.id;

    // ── Resolve income category ──────────────────────────────────────
    let resolvedCategory = category || "Tuition Fee";
    let affectsTuition = false;

    if (incomeCategoryId) {
      const incomeCategory = await prisma.incomeCategory.findUnique({
        where: { id: incomeCategoryId },
      });
      if (!incomeCategory || incomeCategory.organizationId !== orgId) {
        return NextResponse.json(
          { error: "Invalid income category" },
          { status: 400 },
        );
      }
      resolvedCategory = incomeCategory.name;
      affectsTuition = incomeCategory.affectsTuition;
    } else {
      // Legacy fallback — string-based check
      affectsTuition = ["Tuition Fee", "Student Dues"].includes(
        resolvedCategory,
      );
    }

    // ── Validation ────────────────────────────────────────────────────
    // All categories require a student since receipts link to enrollment
    if (!amount || !paymentMode || !date || !studentId) {
      return NextResponse.json(
        {
          error:
            "Missing required fields (amount, paymentMode, date, studentId)",
        },
        { status: 400 },
      );
    }

    // Execute in transaction to ensure atomicity
    const result = await prisma.$transaction(
      async (tx) => {
        // 1. Resolve enrollment — use provided enrollmentId or find active
        let enrollmentId: string;

        if (requestedEnrollmentId) {
          // Validate the provided enrollment belongs to this student and org
          const enrollment = await tx.studentEnrollment.findFirst({
            where: {
              id: requestedEnrollmentId,
              studentId,
              organizationId: orgId,
            },
          });
          if (!enrollment) {
            throw new Error(
              "Invalid enrollment. The selected enrollment does not belong to this student.",
            );
          }
          enrollmentId = enrollment.id;
        } else {
          // Fallback: auto-find active enrollment
          const activeEnrollment = await tx.studentEnrollment.findFirst({
            where: {
              studentId,
              organizationId: orgId,
              status: "ACTIVE",
            },
          });
          if (!activeEnrollment) {
            throw new Error(
              "No active enrollment found for this student. Please select an academic year.",
            );
          }
          enrollmentId = activeEnrollment.id;
        }

        // 2. Fetch active academic session for receipt number prefix
        const activeSession = await tx.academicSession.findFirst({
          where: { organizationId: orgId, status: "ACTIVE" },
        });
        const sessionPrefix =
          activeSession?.name || new Date().getFullYear().toString();

        // 3. Atomically increment Organization counter and update balances
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

        // 4. Generate session-scoped Receipt Number and check collisions
        let receiptCounter = org.receiptCounter;
        let receiptNumber = `REC-${sessionPrefix}-${receiptCounter.toString().padStart(4, "0")}`;

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
              receiptNumber: { startsWith: `REC-${sessionPrefix}-` },
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
            receiptNumber = `REC-${sessionPrefix}-${receiptCounter.toString().padStart(4, "0")}`;
          }
        }

        // 5. Create Receipt
        const receipt = await tx.receipt.create({
          data: {
            receiptNumber,
            amount: decimalAmount,
            paymentMode: paymentMode as PaymentMode,
            category: resolvedCategory,
            incomeCategoryId: incomeCategoryId || undefined,
            date: new Date(date),
            remarks,
            studentId,
            studentEnrollmentId: enrollmentId,
            organizationId: orgId,
            createdBy: userId,
          },
        });

        // 6. Update Enrollment totalPaid (Only if affectsTuition)
        if (affectsTuition) {
          await tx.studentEnrollment.update({
            where: { id: enrollmentId },
            data: {
              totalPaid: { increment: decimalAmount },
            },
          });
        }

        // 7. Create Transaction History
        const balanceAfter =
          paymentMode === "CASH"
            ? org.currentCashBalance
            : org.currentBankBalance;

        await tx.transactionHistory.create({
          data: {
            date: new Date(date),
            type: affectsTuition
              ? TransactionType.FEE_COLLECTION
              : TransactionType.OTHER_INCOME,
            receiptId: receipt.id,
            studentEnrollmentId: enrollmentId,
            description: `${resolvedCategory} receipt: ${receiptNumber}`,
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
