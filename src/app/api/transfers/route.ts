import { auth } from "@/auth";
import { TransferService } from "@/modules/accounts/transfer.service";
import { Prisma } from "@/prisma/generated";
import { NextResponse } from "next/server";

export const POST = auth(async (req) => {
  if (!req.auth?.user?.organizationId || !req.auth?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { type, amount, date, remarks } = body;

    const decimalAmount = new Prisma.Decimal(amount);

    if (type === "CASH_DEPOSIT") {
      await TransferService.depositCashToBank({
        organizationId: req.auth.user.organizationId,
        userId: req.auth.user.id,
        amount: decimalAmount,
        date: new Date(date),
        remarks,
      });
    } else if (type === "CASH_WITHDRAWAL") {
      await TransferService.withdrawBankToCash({
        organizationId: req.auth.user.organizationId,
        userId: req.auth.user.id,
        amount: decimalAmount,
        date: new Date(date),
        remarks,
      });
    } else {
      return NextResponse.json(
        { error: "Invalid transfer type" },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Transfer error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process transfer" },
      { status: 500 },
    );
  }
});
