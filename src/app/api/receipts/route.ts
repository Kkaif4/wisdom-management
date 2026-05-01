import { SessionService } from "@/modules/auth/services/session.service";
import { ErrorUtils } from "@/modules/auth/utils/error.utils";
import { ReceiptService } from "@/modules/students/receipt.service";
import { Prisma } from "@/prisma/generated";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // 1. Central Session Gatekeeper with Permission
    const user = await SessionService.requirePermission("CREATE_RECEIPT");
    const organizationId = SessionService.requireOrgId(user);

    const body = await req.json();
    const {
      studentEnrollmentId,
      studentId,
      amount,
      paymentMode,
      category,
      receiptNumber,
      date,
      remarks,
    } = body;

    if (!studentEnrollmentId) {
      return NextResponse.json(
        { error: "studentEnrollmentId is required" },
        { status: 400 },
      );
    }

    const receipt = await ReceiptService.collectFee({
      studentEnrollmentId,
      studentId: studentId || undefined,
      category: category || "Tuition Fee",
      organizationId,
      userId: user.id,
      amount: new Prisma.Decimal(amount),
      paymentMode,
      receiptNumber,
      date: new Date(date),
      remarks,
    });

    return NextResponse.json(receipt);
  } catch (error) {
    // 2. Transformed Standard Error Output
    return ErrorUtils.handleApiError(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await SessionService.requirePermission("VIEW_RECEIPT_LIST");
    const organizationId = SessionService.requireOrgId(user);

    const receipts = await ReceiptService.listReceipts(organizationId);
    return NextResponse.json(receipts);
  } catch (error) {
    return ErrorUtils.handleApiError(error);
  }
}

