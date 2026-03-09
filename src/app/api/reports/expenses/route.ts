import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";

export const GET = auth(async (req) => {
  const orgId = req.auth?.user?.organizationId;
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const paymentMode = searchParams.get("paymentMode");
    const category = searchParams.get("category");

    const where: any = {
      organizationId: orgId,
    };

    if (paymentMode && paymentMode !== "ALL") {
      where.paidFrom = paymentMode;
    }

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        const s = new Date(startDate);
        s.setHours(0, 0, 0, 0);
        where.date.gte = s;
      }
      if (endDate) {
        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);
        where.date.lte = e;
      }
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: "desc" },
    });

    const formattedExpenses = expenses.map((e) => ({
      id: e.id,
      date: e.date.toISOString(),
      category: e.category,
      description: e.description,
      paymentMode: e.paidFrom,
      amount: Number(e.amount),
    }));

    // Calculate Summary
    const summary = {
      totalExpenses: formattedExpenses.reduce((sum, e) => sum + e.amount, 0),
      cashExpenses: formattedExpenses
        .filter((e) => e.paymentMode === "CASH")
        .reduce((sum, e) => sum + e.amount, 0),
      bankExpenses: formattedExpenses
        .filter((e) => e.paymentMode === "BANK")
        .reduce((sum, e) => sum + e.amount, 0),
    };

    // Calculate Category Breakdown
    const categoryMap: Record<
      string,
      { category: string; totalAmount: number; count: number }
    > = {};
    formattedExpenses.forEach((e) => {
      if (!categoryMap[e.category]) {
        categoryMap[e.category] = {
          category: e.category,
          totalAmount: 0,
          count: 0,
        };
      }
      categoryMap[e.category].totalAmount += e.amount;
      categoryMap[e.category].count += 1;
    });

    const categoryBreakdown = Object.values(categoryMap).sort(
      (a, b) => b.totalAmount - a.totalAmount,
    );

    return successResponse({
      expenses: formattedExpenses,
      summary,
      categoryBreakdown,
    });
  } catch (error) {
    return errorResponse(error);
  }
}) as any;
