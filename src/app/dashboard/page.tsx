import { SessionService } from "@/modules/auth/services/session.service";
import { AuthenticationError, ForbiddenError } from "@/modules/auth/types/auth.types";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  let user;
  try {
    user = await SessionService.requirePermission("VIEW_DASHBOARD");
  } catch (error) {
    if (error instanceof AuthenticationError) redirect("/login");
    if (error instanceof ForbiddenError) redirect("/login?error=forbidden"); // If they can't see dashboard, redirect to login or a public page
    throw error;
  }

  const orgId = user.organizationId!;

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
      prisma.studentEnrollment.aggregate({
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
