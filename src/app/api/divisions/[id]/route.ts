import { auth } from "@/auth";
import { DivisionService } from "@/modules/academic/academic.service";
import { NextResponse } from "next/server";

export const PUT = auth(async (req, { params }) => {
  if (!req.auth?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params!;
    const body = await req.json();
    const division = await DivisionService.updateDivision(
      id,
      req.auth.user.organizationId,
      body,
    );
    return NextResponse.json(division);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update division" },
      { status: 500 },
    );
  }
});

export const DELETE = auth(async (req, { params }) => {
  if (!req.auth?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params!;
    await DivisionService.deleteDivision(id, req.auth.user.organizationId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete division" },
      { status: 500 },
    );
  }
});
