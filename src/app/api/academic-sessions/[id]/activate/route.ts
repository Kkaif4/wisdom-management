import { auth } from "@/auth";
import { SessionService } from "@/modules/academic/academic.service";
import { NextResponse } from "next/server";

export const POST = auth(async (req, { params }) => {
  if (!req.auth?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params!;
    const session = await SessionService.activateSession(
      id,
      req.auth.user.organizationId,
    );
    return NextResponse.json(session);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to activate session" },
      { status: 500 },
    );
  }
});
