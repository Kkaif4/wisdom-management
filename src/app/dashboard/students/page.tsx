import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StudentsClient } from "@/app/dashboard/students/StudentsClient";

interface PageProps {
  searchParams: Promise<{ q?: string; p?: string }>;
}

export default async function StudentsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.organizationId) redirect("/login");

  const { q: search, p: pageNum } = await searchParams;
  const page = parseInt(pageNum || "1");
  const limit = 15;
  const skip = (page - 1) * limit;

  const orgId = session.user.organizationId;

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where: {
        organizationId: orgId,
        ...(search
          ? {
              name: {
                contains: search,
                mode: "insensitive",
              },
            }
          : {}),
      },
      orderBy: { name: "asc" },
      skip,
      take: limit,
    }),
    prisma.student.count({
      where: {
        organizationId: orgId,
        ...(search
          ? {
              name: {
                contains: search,
                mode: "insensitive",
              },
            }
          : {}),
      },
    }),
  ]);

  const serialized = students.map((s) => ({
    id: s.id,
    name: s.name,
    class: s.class,
    totalFeesAssigned: Number(s.totalFeesAssigned),
    totalPaid: Number(s.totalPaid),
  }));

  return (
    <StudentsClient
      students={serialized}
      totalCount={total}
      currentPage={page}
      totalPages={Math.ceil(total / limit)}
    />
  );
}
