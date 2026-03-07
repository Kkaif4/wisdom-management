import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MonthlyReportClient } from "./MonthlyReportClient";

export default async function MonthlyReportPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.organizationId) redirect("/login");

  const { month, year } = await searchParams;
  const now = new Date();
  const targetMonth = month ? parseInt(month) : now.getMonth();
  const targetYear = year ? parseInt(year) : now.getFullYear();

  const startDate = new Date(targetYear, targetMonth, 1);
  const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

  const orgId = session.user.organizationId;

  // Parallel aggregations for performance
  const [incomeStats, expenseStats, orgData] = await Promise.all([
    prisma.receipt.aggregate({
      where: {
        organizationId: orgId,
        date: { gte: startDate, lte: endDate },
        status: "ACTIVE",
      },
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({
      where: { organizationId: orgId, date: { gte: startDate, lte: endDate } },
      _sum: { amount: true },
    }),
    prisma.organization.findUnique({
      where: { id: orgId },
      select: { currentCashBalance: true, currentBankBalance: true },
    }),
  ]);

  const stats = {
    totalIncome: Number(incomeStats._sum.amount ?? 0),
    totalExpense: Number(expenseStats._sum.amount ?? 0),
    currentFunds:
      Number(orgData?.currentCashBalance ?? 0) +
      Number(orgData?.currentBankBalance ?? 0),
  };

  return (
    <MonthlyReportClient month={targetMonth} year={targetYear} stats={stats} />
  );
}
