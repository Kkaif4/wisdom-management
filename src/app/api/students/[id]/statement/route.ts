import { auth } from "@/auth";
import { StudentService } from "@/modules/students/student.service";
import { NextResponse } from "next/server";

export const GET = auth(async (req, { params }: any) => {
  if (!req.auth?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  try {
    const statement = await StudentService.getStudentStatement(
      id,
      req.auth.user.organizationId,
    );
    return NextResponse.json(statement);
  } catch (error: any) {
    console.error("Statement fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch student statement" },
      { status: 500 },
    );
  }
});
