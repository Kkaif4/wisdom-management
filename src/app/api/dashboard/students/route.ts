import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, class: className, totalFeesAssigned } = await req.json();

    if (!name || !className || totalFeesAssigned === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const student = await prisma.student.create({
      data: {
        name,
        class: className,
        totalFeesAssigned: Number(totalFeesAssigned),
        organizationId: session.user.organizationId,
      },
    });

    return NextResponse.json(student);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create student" },
      { status: 500 },
    );
  }
}
