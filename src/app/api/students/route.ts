import { auth } from "@/auth";
import { StudentService } from "@/modules/students/student.service";
import { Prisma } from "@/prisma/generated";
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

  try {
    const [students, total] = await Promise.all([
      StudentService.getStudents({
        organizationId: req.auth.user.organizationId,
        search: query,
        skip,
        take: limit,
      }),
      StudentService.countStudents(req.auth.user.organizationId, query),
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
    const { name, studentClass, totalFeesAssigned } = body;

    const student = await StudentService.createStudent({
      name,
      studentClass,
      totalFeesAssigned: new Prisma.Decimal(totalFeesAssigned),
      organizationId: req.auth.user.organizationId,
    });

    return NextResponse.json(student);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 },
    );
  }
});
