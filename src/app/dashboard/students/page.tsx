import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StudentsClient } from "@/app/dashboard/students/StudentsClient";

export default async function StudentsPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await searchParamsPromise;
  const session = await auth();
  if (!session?.user?.organizationId) redirect("/login");

  const orgId = session.user.organizationId;

  const getSingle = (val: string | string[] | undefined) =>
    Array.isArray(val) ? val[0] : val;
  const pageParam = getSingle(searchParams.p);
  const searchParam = getSingle(searchParams.q);

  const page = parseInt(pageParam || "1");
  const limit = 15;
  const skip = (page - 1) * limit;

  const where: any = { organizationId: orgId };
  if (searchParam) {
    where.name = { contains: searchParam, mode: "insensitive" };
  }

  try {
    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        orderBy: { name: "asc" },
        skip,
        take: limit,
      }),
      prisma.student.count({ where }),
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
        initialSearch={searchParam || ""}
      />
    );
  } catch (err: any) {
    if (err?.digest?.startsWith("NEXT_REDIRECT")) throw err;
    return (
      <StudentsClient
        students={[]}
        totalCount={0}
        currentPage={1}
        totalPages={0}
        error="Failed to load student records. Please retry."
        initialSearch={searchParam || ""}
      />
    );
  }
}
