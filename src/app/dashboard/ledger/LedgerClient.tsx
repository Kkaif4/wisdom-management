"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Pagination } from "@/components/shared/Pagination";
import { LedgerTable } from "@/components/dashboard/LedgerTable";
import { Loader2, Search, Library, FileText, AlertCircle } from "lucide-react";

interface Transaction {
  id: string;
  date: string;
  type: string;
  description: string;
  debitAmount: number | null;
  creditAmount: number | null;
  balanceAfter: number;
  impactedAccount: string;
  createdBy: string;
}

interface LedgerClientProps {
  transactions: Transaction[];
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  filters: {
    query: string;
  };
  error?: string;
}

export function LedgerClient({
  transactions,
  currentPage,
  totalPages,
  totalRecords,
  filters,
  error,
}: LedgerClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchVal, setSearchVal] = useState(filters.query);

  useEffect(() => {
    setSearchVal(filters.query);
  }, [filters.query]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("p", page.toString());
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchVal) {
      params.set("q", searchVal);
    } else {
      params.delete("q");
    }
    params.set("p", "1");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="p-6 space-y-8 animate-fade-in mb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-foreground flex items-center gap-3">
            Organization Ledger
            {isPending && (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            )}
          </h1>
          <p className="text-muted-foreground font-medium flex items-center gap-2 mt-1">
            <Library className="h-4 w-4 text-primary" />
            Complete project audit trail and transaction log
          </p>
        </div>
        <div className="glass px-6 py-3 rounded-2xl border-primary/10 bg-primary/[0.02]">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary/70 mb-1">
            Total Logs
          </p>
          <p className="text-xl font-black text-foreground">{totalRecords}</p>
        </div>
      </div>

      {error && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive font-bold text-sm">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <form onSubmit={handleSearch} className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search by description..."
            className="w-full bg-card/50 border border-border/50 rounded-2xl pl-11 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
        </form>
      </div>

      <div className="relative">
        {isPending && (
          <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-3xl">
            <div className="flex items-center gap-3 bg-card px-6 py-4 rounded-2xl shadow-2xl border border-border/50">
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
              <span className="text-sm font-black uppercase tracking-widest">
                Searching records...
              </span>
            </div>
          </div>
        )}
        <LedgerTable transactions={transactions} />
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        isLoading={isPending}
      />
    </div>
  );
}
