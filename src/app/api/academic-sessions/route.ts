import { auth } from "@/auth";
import { SessionService } from "@/modules/academic/academic.service";
import { SessionStatus } from "@/prisma/generated";
import { NextResponse } from "next/server";

export const GET = auth(async (req) => {
  if (!req.auth?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as SessionStatus | null;

  try {
    const sessions = await SessionService.getSessions({
      organizationId: req.auth.user.organizationId,
      status: status || undefined,
    });
    return NextResponse.json(sessions);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch sessions" },
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
    const { name, startDate, endDate } = body;

    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { error: "name, startDate, and endDate are required" },
        { status: 400 },
      );
    }

    const session = await SessionService.createSession({
      name,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      organizationId: req.auth.user.organizationId,
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create session" },
      { status: 500 },
    );
  }
});
