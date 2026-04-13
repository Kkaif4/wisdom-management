import { auth } from "@/auth";
import { ClassService } from "@/modules/academic/academic.service";
import { NextResponse } from "next/server";

export const GET = auth(async (req) => {
  if (!req.auth?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const classes = await ClassService.getClasses(req.auth.user.organizationId);
    return NextResponse.json(classes);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch classes" },
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
    const { name, displayOrder } = body;

    if (!name || displayOrder === undefined) {
      return NextResponse.json(
        { error: "name and displayOrder are required" },
        { status: 400 },
      );
    }

    const cls = await ClassService.createClass({
      name,
      displayOrder: Number(displayOrder),
      organizationId: req.auth.user.organizationId,
    });

    return NextResponse.json(cls, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create class" },
      { status: 500 },
    );
  }
});
