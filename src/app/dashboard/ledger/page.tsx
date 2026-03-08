import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LedgerTable } from "@/components/dashboard/LedgerTable";

import { LedgerClient } from "./LedgerClient";

interface PageProps {
  searchParams: Promise<{ p?: string }>;
}

export default async function LedgerPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.organizationId) redirect("/login");

  const orgId = session.user.organizationId;
  const { p: pageNum } = await searchParams;
  const page = parseInt(pageNum || "1");
  const limit = 20;
  const skip = (page - 1) * limit;

  // Fetch Current Page of Transactions + Total Count
  const [total, recentTransactions] = await Promise.all([
    prisma.transactionHistory.count({
      where: { organizationId: orgId },
    }),
    prisma.transactionHistory.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
  ]);

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
    <LedgerClient
      transactions={transactions}
      currentPage={page}
      totalPages={Math.ceil(total / limit)}
      totalRecords={total}
    />
  );
}
