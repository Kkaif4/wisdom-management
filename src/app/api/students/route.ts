import { auth } from "@/auth";
import { StudentService } from "@/modules/students/student.service";
import { NextResponse } from "next/server";

export const GET = auth(async (req) => {
  if (!req.auth?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || undefined;
  const page = parseInt(searchParams.get("p") || "1");
  const limit = parseInt(searchParams.get("l") || "15");
  const skip = (page - 1) * limit;

  const sessionId = searchParams.get("sessionId") || undefined;
  const classId = searchParams.get("classId") || undefined;
  const divisionId = searchParams.get("divisionId") || undefined;
  const status = (searchParams.get("status") as any) || "ACTIVE";

  try {
    const [students, total] = await Promise.all([
      StudentService.getStudents({
        organizationId: req.auth.user.organizationId,
        search: query,
        sessionId,
        classId,
        divisionId,
        status,
        skip,
        take: limit,
      }),
      StudentService.countStudents({
        organizationId: req.auth.user.organizationId,
        search: query,
        sessionId,
        classId,
        divisionId,
        status,
      }),
    ]);

    return NextResponse.json({
      data: students,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 },
    );
  }
});

export const POST = auth(async (req) => {
  if (!req.auth?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      admissionNumber,
      name,
      dateOfBirth,
      gender,
      contactNumber,
      email,
      address,
      fatherName,
      motherName,
      guardianContact,
    } = body;

    if (!admissionNumber || !name) {
      return NextResponse.json(
        { error: "admissionNumber and name are required" },
        { status: 400 },
      );
    }

    const student = await StudentService.createStudent({
      admissionNumber,
      name,
      organizationId: req.auth.user.organizationId,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender,
      contactNumber,
      email,
      address,
      fatherName,
      motherName,
      guardianContact,
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create student" },
      { status: 500 },
    );
  }
});
