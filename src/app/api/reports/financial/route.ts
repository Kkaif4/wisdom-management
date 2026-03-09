import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Prisma } from "@/prisma/generated";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orgId = session.user.organizationId;
    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    // Default to last 30 days if not provided
    const endDate = endDateParam ? new Date(endDateParam) : new Date();
    endDate.setHours(23, 59, 59, 999);

    const startDate = startDateParam
      ? new Date(startDateParam)
      : new Date(new Date().setDate(endDate.getDate() - 30));
    startDate.setHours(0, 0, 0, 0);

    const dateFilter = {
      gte: startDate,
      lte: endDate,
    };

    // 1. Fetch Receipts (Income)
    const receipts = await prisma.receipt.findMany({
      where: {
        organizationId: orgId,
        date: dateFilter,
      },
      include: {
        student: {
          select: { name: true },
        },
      },
      orderBy: { date: "desc" },
    });

    // 2. Fetch Expenses
    const expenses = await prisma.expense.findMany({
      where: {
        organizationId: orgId,
        date: dateFilter,
      },
      orderBy: { date: "desc" },
    });

    // 3. Fetch Global Outstanding Dues (Current Snapshot)
    const studentsWithDues = await prisma.student.findMany({
      where: {
        organizationId: orgId,
        totalPaid: {
          lt: prisma.student.fields.totalFeesAssigned,
        },
      },
      select: {
        name: true,
        class: true,
        totalFeesAssigned: true,
        totalPaid: true,
      },
    });

    // --- Calculations ---
    const totalFeesCollected = receipts.reduce(
      (sum, r) => sum.plus(r.amount),
      new Prisma.Decimal(0),
    );
    const totalExpenses = expenses.reduce(
      (sum, e) => sum.plus(e.amount),
      new Prisma.Decimal(0),
    );
    const netCashFlow = totalFeesCollected.minus(totalExpenses);

    const outstandingDues = studentsWithDues.reduce(
      (sum, s) => sum.plus(s.totalFeesAssigned.minus(s.totalPaid)),
      new Prisma.Decimal(0),
    );

    // Transactions Mapping
    const transactions = [
      ...receipts.map((r) => ({
        id: `receipt-${r.id}`,
        date: r.date,
        type: "FEE_COLLECTION",
        reference: r.receiptNumber,
        studentName: r.student.name,
        description: r.remarks || "Fee Collection",
        debit: null,
        credit: r.amount.toNumber(),
      })),
      ...expenses.map((e) => ({
        id: `expense-${e.id}`,
        date: e.date,
        type: "EXPENSE",
        reference: e.id.slice(0, 8),
        studentName: null,
        description: e.description || "General Expense",
        debit: e.amount.toNumber(),
        credit: null,
      })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    // Expense Breakdown
    const expenseBreakdownMap = expenses.reduce(
      (acc, e) => {
        const cat = e.category || "Uncategorized";
        if (!acc[cat]) {
          acc[cat] = { amount: new Prisma.Decimal(0), count: 0 };
        }
        acc[cat].amount = acc[cat].amount.plus(e.amount);
        acc[cat].count += 1;
        return acc;
      },
      {} as Record<string, { amount: Prisma.Decimal; count: number }>,
    );

    const expenseBreakdown = Object.entries(expenseBreakdownMap)
      .map(([category, data]) => ({
        category,
        totalAmount: data.amount.toNumber(),
        count: data.count,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);

    // Student Summary
    const studentSummary = studentsWithDues
      .map((s) => ({
        name: s.name,
        class: s.class,
        totalFeesAssigned: s.totalFeesAssigned.toNumber(),
        totalPaid: s.totalPaid.toNumber(),
        remaining: s.totalFeesAssigned.minus(s.totalPaid).toNumber(),
      }))
      .sort((a, b) => b.remaining - a.remaining);

    return NextResponse.json({
      summary: {
        totalFeesCollected: totalFeesCollected.toNumber(),
        totalExpenses: totalExpenses.toNumber(),
        netCashFlow: netCashFlow.toNumber(),
        outstandingDues: outstandingDues.toNumber(),
      },
      transactions,
      expenseBreakdown,
      studentSummary,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
