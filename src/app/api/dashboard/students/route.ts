import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SessionStatus, EnrollmentStatus } from "@/prisma/generated";
import { NextResponse } from "next/server";

/**
 * POST /api/dashboard/students
 * Creates a student + enrollment in the active session.
 * Used by the AddStudentDialog.
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      admissionNumber,
      name,
      classId,
      divisionId,
      totalFeesAssigned,
      fatherName,
      contactNumber,
    } = body;

    if (!admissionNumber || !name || !classId || !divisionId) {
      return NextResponse.json(
        {
          error: "admissionNumber, name, classId, and divisionId are required",
        },
        { status: 400 },
      );
    }

    const orgId = session.user.organizationId;

    // Find active session
    const activeSession = await prisma.academicSession.findFirst({
      where: { organizationId: orgId, status: SessionStatus.ACTIVE },
    });
    if (!activeSession) {
      return NextResponse.json(
        {
          error: "No active academic session. Please activate a session first.",
        },
        { status: 400 },
      );
    }

    // Create student + enrollment in transaction
    const result = await prisma.$transaction(async (tx) => {
      const student = await tx.student.create({
        data: {
          admissionNumber,
          name,
          fatherName: fatherName || undefined,
          contactNumber: contactNumber || undefined,
          organizationId: orgId,
        },
      });

      const enrollment = await tx.studentEnrollment.create({
        data: {
          studentId: student.id,
          classId,
          divisionId,
          academicSessionId: activeSession.id,
          totalFeesAssigned: totalFeesAssigned || 0,
          totalPaid: 0,
          status: EnrollmentStatus.ACTIVE,
          organizationId: orgId,
        },
        include: {
          class: true,
          division: true,
          academicSession: true,
        },
      });

      return { ...student, enrollment };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create student" },
      { status: 500 },
    );
  }
}
