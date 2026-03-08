import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface ImportRow {
  name: string;
  class: string;
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

    // Fetch existing student names to detect duplicates
    const existingStudents = await prisma.student.findMany({
      where: { organizationId: orgId },
      select: { name: true },
    });
    const existingNames = new Set(
      existingStudents.map((s) => s.name.toLowerCase().trim()),
    );

    const toCreate: ImportRow[] = [];
    const skipped: { name: string; reason: string }[] = [];

    for (const row of rows) {
      const nameTrimmed = row.name?.trim();
      if (!nameTrimmed) {
        skipped.push({ name: "(empty)", reason: "Name is empty" });
        continue;
      }
      if (existingNames.has(nameTrimmed.toLowerCase())) {
        skipped.push({ name: nameTrimmed, reason: "Student already exists" });
        continue;
      }
      toCreate.push({ ...row, name: nameTrimmed });
      existingNames.add(nameTrimmed.toLowerCase()); // prevent duplicates within the batch
    }

    let created = 0;
    if (toCreate.length > 0) {
      const result = await prisma.student.createMany({
        data: toCreate.map((r) => ({
          name: r.name,
          class: r.class,
          totalFeesAssigned: r.totalFeesAssigned,
          totalPaid: r.totalPaid ?? 0,
          organizationId: orgId,
        })),
        skipDuplicates: true,
      });
      created = result.count;
    }

    return NextResponse.json({ created, skipped });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to import students" },
      { status: 500 },
    );
  }
}
