import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ExpensesClient } from "./ExpensesClient";

export default async function ExpensesPage() {
  const session = await auth();
  if (!session?.user?.organizationId) redirect("/login");

  const expenses = await prisma.expense.findMany({
    where: { organizationId: session.user.organizationId },
    orderBy: { date: "desc" },
    take: 50,
  });

  const serialized = expenses.map((e) => ({
    id: e.id,
    amount: Number(e.amount),
    category: e.category,
    description: e.description,
    date: e.date.toISOString(),
    paidFrom: e.paidFrom,
  }));

  return <ExpensesClient expenses={serialized} />;
}
