import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ExpensesClient } from "./ExpensesClient";

export default async function ExpensesPage({
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
  const queryParam = getSingle(searchParams.q);

  const page = Math.max(1, parseInt(pageParam || "1"));
  const limit = 15;
  const skip = (page - 1) * limit;

  const where: any = { organizationId: orgId };
  if (queryParam) {
    where.OR = [
      { category: { contains: queryParam, mode: "insensitive" } },
      { description: { contains: queryParam, mode: "insensitive" } },
    ];
  }

  try {
    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        orderBy: { date: "desc" },
        skip,
        take: limit,
      }),
      prisma.expense.count({ where }),
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
        filters={{ query: queryParam || "" }}
      />
    );
  } catch (err: any) {
    if (err?.digest?.startsWith("NEXT_REDIRECT")) throw err;
    return (
      <ExpensesClient
        expenses={[]}
        currentPage={1}
        totalPages={0}
        error="Failed to load expenditure records. Please retry."
        filters={{ query: queryParam || "" }}
      />
    );
  }
}
