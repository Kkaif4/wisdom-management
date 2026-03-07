import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LedgerTable } from "@/components/dashboard/LedgerTable";

export default async function LedgerPage() {
  const session = await auth();
  if (!session?.user?.organizationId) redirect("/login");

  const orgId = session.user.organizationId;

  // Fetch the last 100 transactions for the ledger
  const recentTransactions = await prisma.transactionHistory.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Organization Ledger
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          View all incoming and outgoing financial transactions.
        </p>
      </div>

      <LedgerTable transactions={transactions} />
    </div>
  );
}
