import { auth } from "@/auth";
import { EnrollmentService } from "@/modules/enrollment/enrollment.service";
import { StudentService } from "@/modules/students/student.service";
import { NextResponse } from "next/server";

/**
 * GET /api/students/[id]/statement
 * Multi-year enrollment-grouped statement (ledger view).
 */
export const GET = auth(async (req, { params }: any) => {
  if (!req.auth?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const [student, enrollments] = await Promise.all([
      StudentService.getStudentById(id, req.auth.user.organizationId),
      EnrollmentService.getStudentLedger(id, req.auth.user.organizationId),
    ]);

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Compute total outstanding across all enrollments
    const totalOutstanding = enrollments.reduce((sum, e) => {
      const remaining = Number(e.totalFeesAssigned) - Number(e.totalPaid);
      return sum + Math.max(0, remaining);
    }, 0);

    return NextResponse.json({
      student: {
        id: student.id,
        admissionNumber: student.admissionNumber,
        name: student.name,
        status: student.status,
      },
      enrollments: enrollments.map((e) => ({
        id: e.id,
        className: e.class.name,
        divisionName: e.division.name,
        sessionName: e.academicSession.name,
        status: e.status,
        totalFeesAssigned: e.totalFeesAssigned,
        totalPaid: e.totalPaid,
        remaining: Number(e.totalFeesAssigned) - Number(e.totalPaid),
        receipts: e.receipts,
      })),
      totalOutstanding,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch student statement" },
      { status: 500 },
    );
  }
});
