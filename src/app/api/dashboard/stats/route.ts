import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/prisma/generated";
import { NextResponse } from "next/server";

export const GET = auth(async (req) => {
  if (!req.auth?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgId = req.auth.user.organizationId;

  try {
    // 1. Get Organization Balances
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: {
        currentCashBalance: true,
        currentBankBalance: true,
      },
    });

    // 2. Aggregate Student Fees
    const studentStats = await prisma.student.aggregate({
      where: { organizationId: orgId },
      _sum: {
        totalFeesAssigned: true,
        totalPaid: true,
      },
    });

    // 3. Aggregate Expenses
    const expenseStats = await prisma.expense.aggregate({
      where: { organizationId: orgId },
      _sum: {
        amount: true,
      },
    });

    const totalAssigned =
      studentStats._sum.totalFeesAssigned ?? new Prisma.Decimal(0);
    const totalPaid = studentStats._sum.totalPaid ?? new Prisma.Decimal(0);
    const totalExpenses = expenseStats._sum.amount ?? new Prisma.Decimal(0);

    return NextResponse.json({
      cashBalance: Number(org?.currentCashBalance ?? 0),
      bankBalance: Number(org?.currentBankBalance ?? 0),
      totalFeesAssigned: totalAssigned.toNumber(),
      totalFeesCollected: totalPaid.toNumber(),
      totalExpenses: totalExpenses.toNumber(),
      outstandingFees: totalAssigned.minus(totalPaid).toNumber(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 },
    );
  }
});
