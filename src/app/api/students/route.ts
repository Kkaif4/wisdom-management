import { auth } from "@/auth";
import { StudentService } from "@/modules/students/student.service";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PermissionService } from "@/modules/auth/services/permission.service";
import { ErrorUtils } from "@/modules/auth/utils/error.utils";
import { SessionUser } from "@/modules/auth/types/auth.types";

export const GET = auth(async (req) => {
  try {
    const user = req.auth?.user as SessionUser;
    if (!user) throw new Error("Unauthorized");

    await PermissionService.enforce(user, "VIEW_STUDENT_LIST");
    const organizationId = user.organizationId!;

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || undefined;
    const page = parseInt(searchParams.get("p") || "1");
    const limit = parseInt(searchParams.get("l") || "15");
    const skip = (page - 1) * limit;

    const sessionId = searchParams.get("sessionId") || undefined;
    const classId = searchParams.get("classId") || undefined;
    const divisionId = searchParams.get("divisionId") || undefined;
    const status = (searchParams.get("status") as any) || "ACTIVE";

    const [students, total] = await Promise.all([
      StudentService.getStudents({
        organizationId,
        search: query,
        sessionId,
        classId,
        divisionId,
        status,
        skip,
        take: limit,
      }),
      StudentService.countStudents({
        organizationId,
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
    return ErrorUtils.handleApiError(error);
  }
});

export const POST = auth(async (req) => {
  try {
    const user = req.auth?.user as SessionUser;
    if (!user) throw new Error("Unauthorized");

    await PermissionService.enforce(user, "CREATE_STUDENT");
    const organizationId = user.organizationId!;

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
    } = body;

    if (!grNo || !name) {
      return NextResponse.json(
        { error: "grNo and name are required" },
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

    // Check if grNo already exists in this organization
    const existingStudent = await prisma.student.findUnique({
      where: {
        grNo_organizationId: {
          grNo,
          organizationId,
        },
      },
    });

    if (existingStudent) {
      return NextResponse.json(
        { error: `G.R. Number "${grNo}" already exists in this organization.` },
        { status: 400 },
      );
    }

    const student = await StudentService.createStudent({
      grNo,
      name,
      rollNumber,
      organizationId,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
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
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error: any) {
    return ErrorUtils.handleApiError(error);
  }
});

