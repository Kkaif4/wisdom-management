import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { TransactionType } from "@/prisma/generated";

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

    const where: any = {
      organizationId: orgId,
      type: TransactionType.ACCOUNT_ADJUSTMENT,
    };

    if (paymentMode && paymentMode !== "ALL") {
      where.impactedAccount = paymentMode;
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

    const adjustments = await prisma.transactionHistory.findMany({
      where,
      include: {
        user: { select: { name: true } },
      },
      orderBy: { date: "desc" },
    });

    const formattedAdjustments = adjustments.map((a) => {
      // Adjustments: logic depends on which field was used initially.
      // Typically debitAmount is used for increase in Asset scripts.
      const d = Number(a.debitAmount);
      const c = Number(a.creditAmount);
      const type = d > 0 ? "INCREASE" : "DECREASE";
      const amount = d > 0 ? d : c;

      return {
        id: a.id,
        date: a.date.toISOString(),
        account: a.impactedAccount,
        amount,
        type,
        reason: a.description,
        createdBy: a.user.name,
      };
    });

    const summary = {
      totalAdjustments: formattedAdjustments.length,
      netAdjustmentAmount: formattedAdjustments.reduce(
        (sum, a) => sum + (a.type === "INCREASE" ? a.amount : -a.amount),
        0,
      ),
    };

    return successResponse({ adjustments: formattedAdjustments, summary });
  } catch (error) {
    return errorResponse(error);
  }
}) as any;
