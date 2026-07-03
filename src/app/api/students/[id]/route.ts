import { auth } from "@/auth";
import { StudentService } from "@/modules/students/student.service";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    if (body.grNo) {
      const existingStudent = await prisma.student.findFirst({
        where: {
          grNo: body.grNo,
          organizationId: orgId,
          id: { not: id },
        },
      });

      if (existingStudent) {
        return NextResponse.json(
          { error: `G.R. Number "${body.grNo}" already exists in this organization.` },
          { status: 400 },
        );
      }
    }

    const student = await StudentService.updateStudent(id, orgId, {
      grNo: body.grNo,
      name: body.name,
      rollNumber: body.rollNumber,
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
      gender: body.gender,
      placeOfBirth: body.placeOfBirth,
      aadharNo: body.aadharNo,
      lastSchoolAttended: body.lastSchoolAttended,
      religion: body.religion,
      caste: body.caste,
      subCaste: body.subCaste,
      nationality: body.nationality,
      fatherName: body.fatherName,
      fatherQualification: body.fatherQualification,
      fatherOccupation: body.fatherOccupation,
      motherName: body.motherName,
      motherQualification: body.motherQualification,
      motherOccupation: body.motherOccupation,
      contactNumber: body.contactNumber,
      telNo: body.telNo,
      email: body.email,
      address: body.address,
      receivedApplicationOf: body.receivedApplicationOf,
    });

    return NextResponse.json(student);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update student" },
      { status: 500 },
    );
  }
});
