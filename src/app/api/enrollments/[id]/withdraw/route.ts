import { auth } from "@/auth";
import { EnrollmentService } from "@/modules/enrollment/enrollment.service";
import { NextResponse } from "next/server";

/**
 * POST /api/enrollments/[id]/withdraw
 * Withdraws a student mid-way. Preserves enrollment history.
 */
export const POST = auth(async (req, { params }) => {
  if (!req.auth?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params!;
    const body = await req.json().catch(() => ({}));

    const enrollment = await EnrollmentService.withdrawStudent({
      enrollmentId: id,
      organizationId: req.auth.user.organizationId,
      remarks: body.remarks,
    });

    return NextResponse.json(enrollment);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to withdraw student" },
      { status: 500 },
    );
  }
});
