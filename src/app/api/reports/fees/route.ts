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
      status: "ACTIVE",
    };

    if (paymentMode && paymentMode !== "ALL") {
      where.paymentMode = paymentMode;
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

    const receipts = await prisma.receipt.findMany({
      where,
      include: {
        student: {
          select: { name: true },
        },
        studentEnrollment: {
          select: { class: { select: { name: true } } },
        },
      },
      orderBy: { date: "desc" },
    });

    // Formatting for client consumption
    const formattedReceipts = receipts.map((r) => ({
      id: r.id,
      date: r.date.toISOString(),
      receiptNumber: r.receiptNumber,
      studentName: r.student ? r.student.name : "N/A",
      class: r.studentEnrollment?.class?.name || "N/A",
      paymentMode: r.paymentMode,
      category: r.category || "Tuition Fee",
      amount: Number(r.amount),
      remarks: r.remarks,
    }));

    const summary = {
      totalFeesCollected: formattedReceipts.reduce(
        (sum, r) => sum + r.amount,
        0,
      ),
      cashCollections: formattedReceipts
        .filter((r) => r.paymentMode === "CASH")
        .reduce((sum, r) => sum + r.amount, 0),
      bankCollections: formattedReceipts
        .filter((r) => r.paymentMode === "BANK")
        .reduce((sum, r) => sum + r.amount, 0),
    };

    return successResponse({ receipts: formattedReceipts, summary });
  } catch (error) {
    return errorResponse(error);
  }
}) as any;
