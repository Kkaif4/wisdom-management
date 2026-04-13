import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SessionStatus, EnrollmentStatus } from "@/prisma/generated";
import { NextResponse } from "next/server";

interface ImportRow {
  name: string;
  admissionNumber: string;
  className: string;
  divisionName: string;
  totalFeesAssigned: number;
  totalPaid: number;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rows } = (await req.json()) as { rows: ImportRow[] };

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "No rows provided" }, { status: 400 });
    }

    const orgId = session.user.organizationId;

    // 1. Get active academic session
    const activeSession = await prisma.academicSession.findFirst({
      where: { organizationId: orgId, status: SessionStatus.ACTIVE },
    });
    if (!activeSession) {
      return NextResponse.json(
        {
          error:
            "No active academic session found. Please activate a session first.",
        },
        { status: 400 },
      );
    }

    // 2. Cache classes and divisions
    const classes = await prisma.class.findMany({
      where: { organizationId: orgId },
      include: { divisions: true },
    });
    const classMap = new Map(classes.map((c) => [c.name.toLowerCase(), c]));

    // 3. Check existing students by admission number
    const existingStudents = await prisma.student.findMany({
      where: { organizationId: orgId },
      select: { admissionNumber: true },
    });
    const existingAdmNos = new Set(
      existingStudents.map((s) => s.admissionNumber.toLowerCase().trim()),
    );

    const skipped: { name: string; reason: string }[] = [];
    let created = 0;

    for (const row of rows) {
      const name = row.name?.trim();
      const admNo = row.admissionNumber?.trim();
      const className = row.className?.trim();
      const divName = row.divisionName?.trim() || "A";

      if (!name) {
        skipped.push({ name: "(empty)", reason: "Name is empty" });
        continue;
      }
      if (!admNo) {
        skipped.push({ name, reason: "Admission number is missing" });
        continue;
      }
      if (existingAdmNos.has(admNo.toLowerCase())) {
        skipped.push({ name, reason: "Admission number already exists" });
        continue;
      }

      // Resolve class
      const cls = classMap.get(className?.toLowerCase() || "");
      if (!cls) {
        skipped.push({ name, reason: `Class "${className}" not found` });
        continue;
      }

      // Resolve division
      const div = cls.divisions.find(
        (d) => d.name.toLowerCase() === divName.toLowerCase(),
      );
      if (!div) {
        skipped.push({
          name,
          reason: `Division "${divName}" not found in ${cls.name}`,
        });
        continue;
      }

      // Create student + enrollment in a transaction
      try {
        await prisma.$transaction(async (tx) => {
          const student = await tx.student.create({
            data: {
              admissionNumber: admNo,
              name,
              organizationId: orgId,
            },
          });

          await tx.studentEnrollment.create({
            data: {
              studentId: student.id,
              classId: cls.id,
              divisionId: div.id,
              academicSessionId: activeSession.id,
              totalFeesAssigned: row.totalFeesAssigned || 0,
              totalPaid: row.totalPaid || 0,
              status: EnrollmentStatus.ACTIVE,
              organizationId: orgId,
            },
          });
        });

        existingAdmNos.add(admNo.toLowerCase());
        created++;
      } catch (err: any) {
        skipped.push({ name, reason: err.message || "Database error" });
      }
    }

    return NextResponse.json({ created, skipped });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to import students" },
      { status: 500 },
    );
  }
}
