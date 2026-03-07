import { auth } from "@/auth";
import { StudentService } from "@/modules/students/student.service";
import { Prisma } from "@/prisma/generated";
import { NextResponse } from "next/server";

export const GET = auth(async (req) => {
  if (!req.auth?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const students = await StudentService.getStudents(
      req.auth.user.organizationId,
    );
    return NextResponse.json(students);
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
