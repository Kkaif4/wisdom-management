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
      grNo,
      name,
      rollNumber,
      dateOfBirth,
      gender,
      placeOfBirth,
      aadharNo,
      lastSchoolAttended,
      religion,
      caste,
      subCaste,
      nationality,
      fatherName,
      fatherQualification,
      fatherOccupation,
      motherName,
      motherQualification,
      motherOccupation,
      contactNumber,
      telNo,
      email,
      address,
      receivedApplicationOf,
      classId,
      divisionId,
      totalFeesAssigned,
      discount,
    } = body;

    if (!grNo || !name || !classId || !divisionId) {
      return NextResponse.json(
        {
          error: "grNo, name, classId, and divisionId are required",
        },
        { status: 400 },
      );
    }

    if (aadharNo) {
      const aadhar = aadharNo.trim();
      if (aadhar && !/^\d{12}$/.test(aadhar)) {
        return NextResponse.json(
          { error: "Aadhar Number must be a 12-digit number" },
          { status: 400 },
        );
      }
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
          grNo,
          name,
          rollNumber: rollNumber || null,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          gender: gender || null,
          placeOfBirth: placeOfBirth || null,
          aadharNo: aadharNo || null,
          lastSchoolAttended: lastSchoolAttended || null,
          religion: religion || null,
          caste: caste || null,
          subCaste: subCaste || null,
          nationality: nationality || null,
          fatherName: fatherName || null,
          fatherQualification: fatherQualification || null,
          fatherOccupation: fatherOccupation || null,
          motherName: motherName || null,
          motherQualification: motherQualification || null,
          motherOccupation: motherOccupation || null,
          contactNumber: contactNumber || null,
          telNo: telNo || null,
          email: email || null,
          address: address || null,
          receivedApplicationOf: receivedApplicationOf || null,
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
          discount: discount || 0,
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
