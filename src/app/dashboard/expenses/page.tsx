import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ExpensesClient } from "./ExpensesClient";

interface PageProps {
  searchParams: Promise<{ p?: string }>;
}

export default async function ExpensesPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.organizationId) redirect("/login");

  const orgId = session.user.organizationId;
  const { p: pageNum } = await searchParams;
  const page = parseInt(pageNum || "1");
  const limit = 15;
  const skip = (page - 1) * limit;

  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
      where: { organizationId: orgId },
      orderBy: { date: "desc" },
      skip,
      take: limit,
    }),
    prisma.expense.count({
      where: { organizationId: orgId },
    }),
  ]);

  const serialized = expenses.map((e) => ({
    id: e.id,
    amount: Number(e.amount),
    category: e.category,
    description: e.description,
    date: e.date.toISOString(),
    paidFrom: e.paidFrom,
  }));

  return (
    <ExpensesClient
      expenses={serialized}
      currentPage={page}
      totalPages={Math.ceil(total / limit)}
    />
  );
}
