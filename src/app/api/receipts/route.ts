import { auth } from "@/auth";
import { ReceiptService } from "@/modules/students/receipt.service";
import { Prisma } from "@/prisma/generated";
import { NextResponse } from "next/server";

export const POST = auth(async (req) => {
  if (!req.auth?.user?.organizationId || !req.auth?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { studentId, amount, paymentMode, receiptNumber, date, remarks } =
      body;

    const receipt = await ReceiptService.collectFee({
      studentId,
      organizationId: req.auth.user.organizationId,
      userId: req.auth.user.id,
      amount: new Prisma.Decimal(amount),
      paymentMode,
      receiptNumber,
      date: new Date(date),
      remarks,
    });

    return NextResponse.json(receipt);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to collect fee" },
      { status: 500 },
    );
  }
});
export const GET = auth(async (req) => {
  if (!req.auth?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const receipts = await ReceiptService.listReceipts(
      req.auth.user.organizationId,
    );
    return NextResponse.json(receipts);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to list receipts" },
      { status: 500 },
    );
  }
});
