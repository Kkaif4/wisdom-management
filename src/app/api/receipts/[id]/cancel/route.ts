import { auth } from "@/auth";
import { ReceiptService } from "@/modules/students/receipt.service";
import { NextResponse } from "next/server";

export const POST = auth(async (req, { params }: any) => {
  if (!req.auth?.user?.organizationId || !req.auth?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  try {
    const body = await req.json();
    const { reason } = body;

    const updatedReceipt = await ReceiptService.cancelReceipt({
      receiptId: id,
      userId: req.auth.user.id,
      reason,
    });

    return NextResponse.json(updatedReceipt);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to cancel receipt" },
      { status: 500 },
    );
  }
});
