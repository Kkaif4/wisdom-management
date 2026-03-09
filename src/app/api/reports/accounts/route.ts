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
    const accountType = searchParams.get("accountType"); // CASH | BANK | ALL

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Dates are required" },
        { status: 400 },
      );
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const accountsToFetch =
      accountType === "ALL" || !accountType
        ? [AccountType.CASH, AccountType.BANK]
        : [accountType as AccountType];

    const results: any = {};

    for (const type of accountsToFetch) {
      // Opening Balance
      const lastBefore = await prisma.transactionHistory.findFirst({
        where: {
          organizationId: orgId,
          impactedAccount: type,
          date: { lt: start },
        },
        orderBy: { date: "desc" },
      });

      let opening = 0;
      if (lastBefore) {
        opening = Number(lastBefore.balanceAfter);
      } else {
        const org = await prisma.organization.findUniqueOrThrow({
          where: { id: orgId },
        });
        opening =
          type === AccountType.CASH
            ? Number(org.openingCashBalance)
            : Number(org.openingBankBalance);
      }

      // Transactions
      const txs = await prisma.transactionHistory.findMany({
        where: {
          organizationId: orgId,
          impactedAccount: type,
          date: { gte: start, lte: end },
        },
        orderBy: { date: "asc" },
      });

      const formatted = txs.map((t) => ({
        id: t.id,
        date: t.date.toISOString(),
        type: t.type,
        description: t.description,
        debit: Number(t.debitAmount),
        credit: Number(t.creditAmount),
        balanceAfter: Number(t.balanceAfter),
        account: t.impactedAccount,
      }));

      results[type] = {
        openingBalance: opening,
        transactions: formatted,
        totalInflow: formatted.reduce((s, t) => s + t.debit, 0),
        totalOutflow: formatted.reduce((s, t) => s + t.credit, 0),
        closingBalance:
          formatted.length > 0
            ? formatted[formatted.length - 1].balanceAfter
            : opening,
      };
    }

    return successResponse(results);
  } catch (error) {
    return errorResponse(error);
  }
}) as any;
