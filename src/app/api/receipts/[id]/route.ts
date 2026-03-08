import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = auth(async (req, { params }: any) => {
  if (!req.auth?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  try {
    const receipt = await prisma.receipt.findUniqueOrThrow({
      where: { id, organizationId: req.auth.user.organizationId },
      include: {
        student: true,
        organization: true,
      },
    });

    return NextResponse.json(receipt);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch receipt" },
      { status: 500 },
    );
  }
});
