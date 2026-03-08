import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = auth(async (req) => {
  if (!req.auth?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // Optional filter

  try {
    const ledger = await prisma.transactionHistory.findMany({
      where: {
        organizationId: req.auth.user.organizationId,
        ...(type ? { type: type as any } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 100, // Limit for performance, can add pagination later
    });

    return NextResponse.json(ledger);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch ledger" },
      { status: 500 },
    );
  }
});
