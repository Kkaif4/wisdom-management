import { auth } from "@/auth";
import { TransferService } from "@/modules/accounts/transfer.service";
import { AccountAdjustmentService } from "@/modules/accounts/account-adjustment.service";
import { Prisma } from "@/prisma/generated";
import { NextResponse } from "next/server";

export const POST = auth(async (req) => {
  if (!req.auth?.user?.organizationId || !req.auth?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, type, amount, date, remarks, account, adjustType } = body;
    const orgId = req.auth.user.organizationId;
    const userId = req.auth.user.id;
    const decimalAmount = new Prisma.Decimal(amount);

    if (action === "TRANSFER") {
      if (type === "CASH_DEPOSIT") {
        await TransferService.depositCashToBank({
          organizationId: orgId,
          userId,
          amount: decimalAmount,
          date: new Date(date),
          remarks,
        });
      } else {
        await TransferService.withdrawBankToCash({
          organizationId: orgId,
          userId,
          amount: decimalAmount,
          date: new Date(date),
          remarks,
        });
      }
    } else if (action === "ADJUST") {
      await AccountAdjustmentService.adjustBalance({
        organizationId: orgId,
        userId,
        accountType: account,
        amount: decimalAmount,
        type: adjustType, // "ADD" | "SUBTRACT"
        date: new Date(date),
        remarks,
      });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process transaction" },
      { status: 500 },
    );
  }
});
