import { auth } from "@/auth";
import { EnrollmentService } from "@/modules/enrollment/enrollment.service";
import { Prisma } from "@/prisma/generated";
import { NextResponse } from "next/server";

/**
 * POST /api/promotions
 * Promote a single student to a new class/division/session.
 */
export const POST = auth(async (req) => {
  if (!req.auth?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      studentId,
      targetClassId,
      targetDivisionId,
      targetSessionId,
      newFeesAssigned,
    } = body;

    if (!studentId || !targetClassId || !targetDivisionId || !targetSessionId) {
      return NextResponse.json(
        {
          error:
            "studentId, targetClassId, targetDivisionId, and targetSessionId are required",
        },
        { status: 400 },
      );
    }

    const enrollment = await EnrollmentService.promoteStudent({
      studentId,
      targetClassId,
      targetDivisionId,
      targetSessionId,
      newFeesAssigned: new Prisma.Decimal(newFeesAssigned || 0),
      organizationId: req.auth.user.organizationId,
    });

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to promote student" },
      { status: 500 },
    );
  }
});
