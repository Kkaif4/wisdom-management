import { auth } from "@/auth";
import { SessionService } from "@/modules/academic/academic.service";
import { NextResponse } from "next/server";

export const GET = auth(async (req, { params }) => {
  if (!req.auth?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params!;
    const session = await SessionService.getSessionById(
      id,
      req.auth.user.organizationId,
    );
    return NextResponse.json(session);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Session not found" },
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
    const session = await SessionService.updateSession(
      id,
      req.auth.user.organizationId,
      body,
    );
    return NextResponse.json(session);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update session" },
      { status: 500 },
    );
  }
});
