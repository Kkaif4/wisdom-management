import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SessionStatus, EnrollmentStatus } from "@/prisma/generated";
import { NextResponse } from "next/server";

interface ImportRow {
  name: string;
  grNo?: string;
  admissionNumber?: string;
  rollNumber?: string;
  className: string;
  divisionName?: string;
  totalFeesAssigned?: number;
  discount?: number;
  totalPaid?: number;

  // Demographics
  dateOfBirth?: string;
  gender?: string;
  placeOfBirth?: string;
  aadharNo?: string;
  lastSchoolAttended?: string;
  religion?: string;
  caste?: string;
  subCaste?: string;
  nationality?: string;

  // Parent/Guardian info
  fatherName?: string;
  fatherQualification?: string;
  fatherOccupation?: string;
  motherName?: string;
  motherQualification?: string;
  motherOccupation?: string;
  receivedApplicationOf?: string;

  // Contact
  contactNumber?: string;
  telNo?: string;
  email?: string;
  address?: string;
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

    // 3. Check existing students by GR No
    const existingStudents = await prisma.student.findMany({
      where: { organizationId: orgId },
      select: { grNo: true },
    });
    const existingAdmNos = new Set(
      existingStudents.map((s) => s.grNo.toLowerCase().trim()),
    );

    const skipped: { name: string; reason: string }[] = [];
    let created = 0;

    for (const row of rows) {
      const name = row.name?.trim();
      const admNo = (row.grNo || row.admissionNumber)?.toString().trim();
      const className = row.className?.trim();
      const divName = row.divisionName?.trim() || "A";
      const aadhar = row.aadharNo?.toString().trim();

      if (!name) {
        skipped.push({ name: "(empty)", reason: "Name is empty" });
        continue;
      }
      if (!admNo) {
        skipped.push({ name, reason: "G.R. No. is missing" });
        continue;
      }
      if (existingAdmNos.has(admNo.toLowerCase())) {
        skipped.push({ name, reason: "G.R. No. already exists" });
        continue;
      }

      if (aadhar) {
        if (!/^\d{12}$/.test(aadhar)) {
          skipped.push({ name, reason: "Aadhar number must be a 12-digit number" });
          continue;
        }
      }

      // Resolve class
      let cls = classMap.get(className?.toLowerCase() || "");
      if (!cls && className) {
        // Auto-create class
        try {
          cls = (await prisma.class.create({
            data: {
              name: className,
              organizationId: orgId,
              displayOrder: classMap.size + 1,
            },
            include: { divisions: true },
          })) as any;
          if (cls) classMap.set(className.toLowerCase(), cls);
        } catch (err: any) {
          skipped.push({
            name,
            reason: `Failed to create class: ${err.message}`,
          });
          continue;
        }
      }

      if (!cls) {
        skipped.push({
          name,
          reason: className
            ? `Class "${className}" resolution error`
            : "Class name missing",
        });
        continue;
      }

      // Resolve division
      let div = cls.divisions.find(
        (d: any) => d.name.toLowerCase() === divName.toLowerCase(),
      );
      if (!div && divName) {
        // Auto-create division
        try {
          div = await prisma.division.create({
            data: {
              name: divName,
              classId: cls.id,
              organizationId: orgId,
            },
          });
          cls.divisions.push(div);
        } catch (err: any) {
          skipped.push({
            name,
            reason: `Failed to create division: ${err.message}`,
          });
          continue;
        }
      }

      if (!div) {
        skipped.push({
          name,
          reason: `Division "${divName}" resolution error`,
        });
        continue;
      }

      // Create student + enrollment in a transaction
      try {
        await prisma.$transaction(async (tx) => {
          const student = await tx.student.create({
            data: {
              grNo: admNo,
              name,
              rollNumber: row.rollNumber ? row.rollNumber.toString() : null,
              dateOfBirth: row.dateOfBirth ? new Date(row.dateOfBirth) : null,
              gender: row.gender || null,
              placeOfBirth: row.placeOfBirth || null,
              aadharNo: aadhar || null,
              lastSchoolAttended: row.lastSchoolAttended || null,
              religion: row.religion || null,
              caste: row.caste || null,
              subCaste: row.subCaste || null,
              nationality: row.nationality || null,
              fatherName: row.fatherName || null,
              fatherQualification: row.fatherQualification || null,
              fatherOccupation: row.fatherOccupation || null,
              motherName: row.motherName || null,
              motherQualification: row.motherQualification || null,
              motherOccupation: row.motherOccupation || null,
              contactNumber: row.contactNumber ? row.contactNumber.toString() : null,
              telNo: row.telNo ? row.telNo.toString() : null,
              email: row.email || null,
              address: row.address || null,
              receivedApplicationOf: row.receivedApplicationOf || null,
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
              discount: row.discount || 0,
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
