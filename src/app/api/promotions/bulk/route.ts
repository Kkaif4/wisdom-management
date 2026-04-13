import { auth } from "@/auth";
import { EnrollmentService } from "@/modules/enrollment/enrollment.service";
import { Prisma } from "@/prisma/generated";
import { NextResponse } from "next/server";

/**
 * POST /api/promotions/bulk
 * Bulk promote multiple students at once.
 */
export const POST = auth(async (req) => {
  if (!req.auth?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      studentIds,
      targetClassId,
      targetDivisionId,
      targetSessionId,
      newFeesAssigned,
    } = body;

    if (
      !Array.isArray(studentIds) ||
      studentIds.length === 0 ||
      !targetClassId ||
      !targetDivisionId ||
      !targetSessionId
    ) {
      return NextResponse.json(
        {
          error:
            "studentIds (array), targetClassId, targetDivisionId, and targetSessionId are required",
        },
        { status: 400 },
      );
    }

    const results = await EnrollmentService.bulkPromote({
      studentIds,
      targetClassId,
      targetDivisionId,
      targetSessionId,
      newFeesAssigned: new Prisma.Decimal(newFeesAssigned || 0),
      organizationId: req.auth.user.organizationId,
    });

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      results,
      summary: {
        total: results.length,
        successCount,
        failureCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to bulk promote" },
      { status: 500 },
    );
  }
});
