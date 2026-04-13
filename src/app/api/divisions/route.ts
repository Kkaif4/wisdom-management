import { auth } from "@/auth";
import { DivisionService } from "@/modules/academic/academic.service";
import { NextResponse } from "next/server";

export const GET = auth(async (req) => {
  if (!req.auth?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("classId");

  if (!classId) {
    return NextResponse.json(
      { error: "classId query parameter is required" },
      { status: 400 },
    );
  }

  try {
    const divisions = await DivisionService.getDivisionsByClass(
      classId,
      req.auth.user.organizationId,
    );
    return NextResponse.json(divisions);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch divisions" },
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
    const { name, classId, capacity } = body;

    if (!name || !classId) {
      return NextResponse.json(
        { error: "name and classId are required" },
        { status: 400 },
      );
    }

    const division = await DivisionService.createDivision({
      name,
      classId,
      capacity: capacity ? Number(capacity) : undefined,
      organizationId: req.auth.user.organizationId,
    });

    return NextResponse.json(division, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create division" },
      { status: 500 },
    );
  }
});
