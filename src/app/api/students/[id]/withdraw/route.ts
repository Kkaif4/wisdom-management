import { auth } from "@/auth";
import { EnrollmentService } from "@/modules/enrollment/enrollment.service";
import { StudentService } from "@/modules/students/student.service";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { StudentStatus } from "@/prisma/generated";
import { OrganizationService } from "@/modules/organizations/organization.service";

/**
 * POST /api/students/[id]/withdraw
 * Withdraws a student, updating their active enrollment and global status.
 */
export const POST = auth(async (req, { params }) => {
  if (!req.auth?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params!;
    const orgId = req.auth.user.organizationId;
    const body = await req.json().catch(() => ({}));

    // Find if the student has an active enrollment
    const activeEnrollment = await EnrollmentService.getActiveEnrollment(id, orgId);

    if (activeEnrollment) {
      // Withdraw active enrollment (this also updates Student status to WITHDRAWN)
      await EnrollmentService.withdrawStudent({
        enrollmentId: activeEnrollment.id,
        organizationId: orgId,
        remarks: body.reason || "Student withdrawn mid-way",
      });
    } else {
      // If no active enrollment, update student status directly
      await prisma.student.update({
        where: { id, organizationId: orgId },
        data: { status: StudentStatus.WITHDRAWN },
      });
      await OrganizationService.adjustStudentCount(prisma, orgId, -1);
    }

    const updatedStudent = await StudentService.getStudentById(id, orgId);
    return NextResponse.json(updatedStudent);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to withdraw student" },
      { status: 500 },
    );
  }
});
