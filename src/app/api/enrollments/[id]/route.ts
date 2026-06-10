import { auth } from "@/auth";
import { EnrollmentService } from "@/modules/enrollment/enrollment.service";
import { Prisma } from "@/prisma/generated";
import { NextResponse } from "next/server";

export const GET = auth(async (req, { params }) => {
  if (!req.auth?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params!;
    const enrollment = await EnrollmentService.getEnrollmentById(
      id,
      req.auth.user.organizationId,
    );
    return NextResponse.json(enrollment);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Enrollment not found" },
      { status: 404 },
    );
  }
});

export const PUT = auth(async (req, { params }) => {
  if (!req.auth?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params!;
    const body = await req.json();

    const updateData: {
      totalFeesAssigned?: Prisma.Decimal;
      discount?: Prisma.Decimal;
      remarks?: string;
    } = {};
    if (body.totalFeesAssigned !== undefined) {
      updateData.totalFeesAssigned = new Prisma.Decimal(body.totalFeesAssigned);
    }
    if (body.discount !== undefined) {
      updateData.discount = new Prisma.Decimal(body.discount);
    }
    if (body.remarks !== undefined) {
      updateData.remarks = body.remarks;
    }

    const enrollment = await EnrollmentService.updateEnrollment(
      id,
      req.auth.user.organizationId,
      updateData,
    );
    return NextResponse.json(enrollment);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update enrollment" },
      { status: 500 },
    );
  }
});
