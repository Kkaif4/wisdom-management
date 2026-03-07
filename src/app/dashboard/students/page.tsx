import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StudentsClient } from "@/app/dashboard/students/StudentsClient";

export default async function StudentsPage() {
  const session = await auth();
  if (!session?.user?.organizationId) redirect("/login");

  const students = await prisma.student.findMany({
    where: { organizationId: session.user.organizationId },
    orderBy: { name: "asc" },
  });

  const serialized = students.map((s) => ({
    id: s.id,
    name: s.name,
    class: s.class,
    totalFeesAssigned: Number(s.totalFeesAssigned),
    totalPaid: Number(s.totalPaid),
  }));

  return <StudentsClient students={serialized} />;
}
