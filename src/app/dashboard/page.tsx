import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.organizationId) redirect("/login");

  const orgId = session.user.organizationId;

  // Server-side data fetching (no client waterfall)
  const [org, studentStats, expenseStats, recentTransactions] =
    await Promise.all([
      prisma.organization.findUnique({
        where: { id: orgId },
        select: {
          name: true,
          currentCashBalance: true,
          currentBankBalance: true,
        },
      }),
      prisma.student.aggregate({
        where: { organizationId: orgId },
        _sum: { totalFeesAssigned: true, totalPaid: true },
      }),
      prisma.expense.aggregate({
        where: { organizationId: orgId },
        _sum: { amount: true },
      }),
      prisma.transactionHistory.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

  const stats = {
    orgName: org?.name ?? "Organization",
    cashBalance: Number(org?.currentCashBalance ?? 0),
    bankBalance: Number(org?.currentBankBalance ?? 0),
    totalFeesAssigned: Number(studentStats._sum.totalFeesAssigned ?? 0),
    totalFeesCollected: Number(studentStats._sum.totalPaid ?? 0),
    totalExpenses: Number(expenseStats._sum.amount ?? 0),
  };

  const transactions = recentTransactions.map((tx) => ({
    id: tx.id,
    date: tx.createdAt.toISOString(),
    type: tx.type,
    description: tx.description ?? "",
    debitAmount: tx.debitAmount ? Number(tx.debitAmount) : null,
    creditAmount: tx.creditAmount ? Number(tx.creditAmount) : null,
    balanceAfter: Number(tx.balanceAfter),
    impactedAccount: tx.impactedAccount,
  }));

  return <DashboardClient stats={stats} transactions={transactions} />;
}
