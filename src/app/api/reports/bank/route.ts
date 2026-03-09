import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { AccountType } from "@/prisma/generated";

export const GET = auth(async (req) => {
  const orgId = req.auth?.user?.organizationId;
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Start and End dates are required" },
        { status: 400 },
      );
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // 1. Get Opening Balance
    const lastTransactionBefore = await prisma.transactionHistory.findFirst({
      where: {
        organizationId: orgId,
        impactedAccount: AccountType.BANK,
        date: { lt: start },
      },
      orderBy: { date: "desc" },
    });

    let openingBalance = 0;
    if (lastTransactionBefore) {
      openingBalance = Number(lastTransactionBefore.balanceAfter);
    } else {
      const org = await prisma.organization.findUniqueOrThrow({
        where: { id: orgId },
      });
      openingBalance = Number(org.openingBankBalance);
    }

    // 2. Fetch Transactions
    const transactions = await prisma.transactionHistory.findMany({
      where: {
        organizationId: orgId,
        impactedAccount: AccountType.BANK,
        date: { gte: start, lte: end },
      },
      orderBy: { date: "asc" },
    });

    const formattedTransactions = transactions.map((t) => ({
      id: t.id,
      date: t.date.toISOString(),
      type: t.type,
      description: t.description,
      debit: Number(t.debitAmount),
      credit: Number(t.creditAmount),
      balanceAfter: Number(t.balanceAfter),
    }));

    const totalInflow = formattedTransactions.reduce(
      (sum, t) => sum + t.debit,
      0,
    );
    const totalOutflow = formattedTransactions.reduce(
      (sum, t) => sum + t.credit,
      0,
    );
    const closingBalance =
      formattedTransactions.length > 0
        ? formattedTransactions[formattedTransactions.length - 1].balanceAfter
        : openingBalance;

    const summary = {
      openingBalance,
      totalInflow,
      totalOutflow,
      closingBalance,
    };

    return successResponse({ transactions: formattedTransactions, summary });
  } catch (error) {
    return errorResponse(error);
  }
}) as any;
