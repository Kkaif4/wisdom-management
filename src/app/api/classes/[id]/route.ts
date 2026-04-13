import { auth } from "@/auth";
import { ClassService } from "@/modules/academic/academic.service";
import { NextResponse } from "next/server";

export const GET = auth(async (req, { params }) => {
  if (!req.auth?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params!;
    const cls = await ClassService.getClassById(
      id,
      req.auth.user.organizationId,
    );
    return NextResponse.json(cls);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Class not found" },
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
    const cls = await ClassService.updateClass(
      id,
      req.auth.user.organizationId,
      body,
    );
    return NextResponse.json(cls);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update class" },
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
    await ClassService.deleteClass(id, req.auth.user.organizationId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete class" },
      { status: 500 },
    );
  }
});
