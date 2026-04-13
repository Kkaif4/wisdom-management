import { auth } from "@/auth";
import { EnrollmentService } from "@/modules/enrollment/enrollment.service";
import { EnrollmentStatus, Prisma } from "@/prisma/generated";
import { NextResponse } from "next/server";

export const GET = auth(async (req) => {
  if (!req.auth?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId") || undefined;
  const classId = searchParams.get("classId") || undefined;
  const divisionId = searchParams.get("divisionId") || undefined;
  const status = searchParams.get("status") as EnrollmentStatus | undefined;
  const search = searchParams.get("q") || undefined;
  const page = parseInt(searchParams.get("p") || "1");
  const limit = parseInt(searchParams.get("l") || "20");
  const skip = (page - 1) * limit;

  try {
    const result = await EnrollmentService.getEnrollments({
      organizationId: req.auth.user.organizationId,
      academicSessionId: sessionId,
      classId,
      divisionId,
      status,
      search,
      skip,
      take: limit,
    });

    return NextResponse.json({
      data: result.data,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch enrollments" },
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
      studentId,
      classId,
      divisionId,
      academicSessionId,
      totalFeesAssigned,
      remarks,
    } = body;

    if (!studentId || !classId || !divisionId || !academicSessionId) {
      return NextResponse.json(
        {
          error:
            "studentId, classId, divisionId, and academicSessionId are required",
        },
        { status: 400 },
      );
    }

    const enrollment = await EnrollmentService.createEnrollment({
      studentId,
      classId,
      divisionId,
      academicSessionId,
      totalFeesAssigned: new Prisma.Decimal(totalFeesAssigned || 0),
      organizationId: req.auth.user.organizationId,
      remarks,
    });

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create enrollment" },
      { status: 500 },
    );
  }
});
