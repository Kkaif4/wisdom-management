import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

/**
 * DIAGNOSTIC ENDPOINT - Remove in production
 * Tests database connectivity and user lookup
 */
export async function GET() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: "admin@wisdom.com" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organizationId: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        status: "NO_USER",
        message: "User admin@wisdom.com not found. Run: npx prisma db seed",
      });
    }

    const passwordMatch = await bcrypt.compare("admin123", user.passwordHash);

    return NextResponse.json({
      status: "OK",
      userFound: true,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: user.organizationId,
      passwordHashPrefix: user.passwordHash.substring(0, 10) + "...",
      passwordMatch,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "DB_ERROR",
        message: error.message,
        stack: error.stack?.split("\n").slice(0, 5),
      },
      { status: 500 },
    );
  }
}
