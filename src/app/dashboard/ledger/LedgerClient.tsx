"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "@/components/shared/Pagination";
import { LedgerTable } from "@/components/dashboard/LedgerTable";
import { Loader2 } from "lucide-react";

interface Transaction {
  id: string;
  date: string;
  type: string;
  description: string;
  debitAmount: number | null;
  creditAmount: number | null;
  balanceAfter: number;
  impactedAccount: string;
}

interface LedgerClientProps {
  transactions: Transaction[];
  currentPage: number;
  totalPages: number;
  totalRecords: number;
}

export function LedgerClient({
  transactions,
  currentPage,
  totalPages,
  totalRecords,
}: LedgerClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, setIsPending] = useState(false);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("p", page.toString());
    setIsPending(true);
    router.push(`?${params.toString()}`);
    setTimeout(() => setIsPending(false), 500);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            Organization Ledger
            {isPending && (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Total of {totalRecords} records across project history
          </p>
        </div>
      </div>

      <LedgerTable transactions={transactions} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        isLoading={isPending}
      />
    </div>
  );
}
