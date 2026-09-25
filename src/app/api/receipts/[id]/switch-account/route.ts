import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * POST /api/receipts/[id]/switch-account
 * Debug utility: directly swaps a receipt's paymentMode between CASH and BANK,
 * adjusting the organization's running balances accordingly.
 */
export const POST = auth(async (req, { params }: any) => {
  if (!req.auth?.user?.organizationId || !req.auth?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let id = params?.id;
  if (!id || typeof id !== "string") {
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const idFromUrl = pathParts[pathParts.length - 2];
    if (idFromUrl && typeof idFromUrl === "string") {
      id = idFromUrl;
    }
  }

  if (!id || typeof id !== "string") {
    return NextResponse.json(
      { error: "Receipt ID is missing or invalid." },
      { status: 400 },
    );
  }
  const orgId = req.auth.user.organizationId;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch the receipt
      const receipt = await tx.receipt.findUnique({
        where: { id },
      });

      if (!receipt || receipt.organizationId !== orgId) {
        throw new Error("Receipt not found");
      }

      if (receipt.status !== "ACTIVE") {
        throw new Error("Can only switch account on active receipts");
      }

      const oldMode = receipt.paymentMode;
      const newMode = oldMode === "CASH" ? "BANK" : "CASH";
      const amount = receipt.amount;

      // 2. Update the receipt's paymentMode
      const updatedReceipt = await tx.receipt.update({
        where: { id },
        data: { paymentMode: newMode },
      });

      // 3. Adjust organization balances: subtract from old, add to new
      const oldBalanceField =
        oldMode === "CASH" ? "currentCashBalance" : "currentBankBalance";
      const newBalanceField =
        newMode === "CASH" ? "currentCashBalance" : "currentBankBalance";

      await tx.organization.update({
        where: { id: orgId },
        data: {
          [oldBalanceField]: { decrement: amount },
          [newBalanceField]: { increment: amount },
        },
      });

      // 4. Update the associated TransactionHistory record
      await tx.transactionHistory.updateMany({
        where: {
          receiptId: id,
          organizationId: orgId,
        },
        data: {
          impactedAccount: newMode,
        },
      });

      return updatedReceipt;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to switch account" },
      { status: 500 },
    );
  }
});
