import { auth } from "@/auth";
import { StudentService } from "@/modules/students/student.service";
import { NextResponse } from "next/server";

/**
 * GET /api/students/[id]
 * Fetch student profile details.
 */
export const GET = auth(async (req, { params }) => {
  if (!req.auth?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params!;
    const student = await StudentService.getStudentById(
      id,
      req.auth.user.organizationId,
    );
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    return NextResponse.json(student);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch student" },
      { status: 500 },
    );
  }
});

/**
 * PATCH /api/students/[id]
 * Update student profile info (name, rollNumber, fatherName, contactNumber).
 */
export const PATCH = auth(async (req, { params }) => {
  if (!req.auth?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params!;
    const body = await req.json();
    const orgId = req.auth.user.organizationId;

    const student = await StudentService.updateStudent(id, orgId, {
      name: body.name,
      rollNumber: body.rollNumber,
      fatherName: body.fatherName,
      contactNumber: body.contactNumber,
      admissionNumber: body.admissionNumber,
    });

    return NextResponse.json(student);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update student" },
      { status: 500 },
    );
  }
});
