import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = auth(async (req) => {
  if (!req.auth?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const categories = await prisma.incomeCategory.findMany({
      where: {
        organizationId: req.auth.user.organizationId,
        isActive: true,
      },
      orderBy: { displayOrder: "asc" },
    });

    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch income categories" },
      { status: 500 },
    );
  }
});

export const POST = auth(async (req) => {
  if (!req.auth?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, code, affectsTuition, displayOrder } = await req.json();

    if (!name || !code) {
      return NextResponse.json(
        { error: "Name and code are required" },
        { status: 400 },
      );
    }

    const category = await prisma.incomeCategory.create({
      data: {
        name,
        code: code.toUpperCase().replace(/\s+/g, "_"),
        affectsTuition: affectsTuition ?? false,
        displayOrder: displayOrder ?? 0,
        organizationId: req.auth.user.organizationId,
      },
    });

    return NextResponse.json(category);
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A category with this code already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to create income category" },
      { status: 500 },
    );
  }
});
