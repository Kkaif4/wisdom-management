"use client";

import { ExpenseEntryModal } from "@/components/forms/ExpenseEntryModal";
import { useState, useEffect, useMemo, useTransition } from "react";
import {
  Plus,
  Search,
  TrendingDown,
  Calendar,
  CreditCard,
  Banknote,
  Tag,
  Info,
  ArrowUpRight,
  History,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Pagination } from "@/components/shared/Pagination";

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string | null;
  date: string;
  paidFrom: string;
}

interface ExpensesClientProps {
  expenses: Expense[];
  currentPage: number;
  totalPages: number;
  filters: {
    query: string;
  };
  error?: string;
}

const fmt = (val: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);

export function ExpensesClient({
  expenses,
  currentPage,
  totalPages,
  filters,
  error,
}: ExpensesClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [showEntry, setShowEntry] = useState(false);
  const [searchVal, setSearchVal] = useState(filters.query);

  useEffect(() => {
    setSearchVal(filters.query);
  }, [filters.query]);

  const total = expenses.reduce((acc, e) => acc + e.amount, 0);

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
    <div className="space-y-8 animate-fade-in mb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Expenditure Log
          </h1>
          <p className="text-muted-foreground font-medium flex items-center gap-2 mt-1">
            <TrendingDown className="h-4 w-4 text-rose-500" />
            Track and manage project expenditures
          </p>
        </div>
        <button
          onClick={() => setShowEntry(true)}
          className="group flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-600 text-white font-bold shadow-xl shadow-rose-600/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="h-5 w-5" />
          Record Expense
        </button>
      </div>

      {error && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive font-bold text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass rounded-2xl p-6 border-rose-500/10 bg-rose-500/[0.02]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-600/80 mb-2">
            Page Total
          </p>
          <p className="text-2xl font-black text-rose-600 tracking-tight">
            {fmt(total)}
          </p>
          <div className="mt-2 text-[10px] font-bold text-rose-600 uppercase tracking-tighter flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3" />
            Current View
          </div>
        </div>

        <div className="glass rounded-2xl p-6 border-primary/10 flex flex-col justify-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70 mb-2">
            Top Category
          </p>
          <p className="text-xl font-black text-foreground">
            {expenses[0]?.category || "—"}
          </p>
        </div>

        <div className="glass rounded-2xl p-6 border-primary/10 flex flex-col justify-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70 mb-2">
            Entries
          </p>
          <p className="text-xl font-black text-foreground">
            {expenses.length} Records
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          {isPending ? (
            <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-500 animate-spin" />
          ) : (
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          )}
          <input
            type="text"
            placeholder="Search by category or details..."
            className="w-full bg-card/50 border border-border/50 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all font-bold"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
        </form>
      </div>

      <div className="glass rounded-3xl overflow-hidden border-border/50 shadow-sm relative">
        {isPending && (
          <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-rose-500 animate-spin" />
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/70 bg-muted/20 border-b border-border/50">
                <th className="px-8 py-5">Timestamp</th>
                <th className="px-8 py-5">Classification</th>
                <th className="px-8 py-5">Transaction Details</th>
                <th className="px-8 py-5">Source</th>
                <th className="px-8 py-5 text-right">Debit Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center justify-center opacity-40">
                      <History className="h-10 w-10 mb-4" />
                      <p className="text-sm font-bold tracking-tight">
                        No expenditure records match your filter
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                expenses.map((e) => (
                  <tr
                    key={e.id}
                    className="group hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-sm font-bold text-foreground/80">
                        <Calendar className="h-3.5 w-3.5 text-rose-500/60" />
                        {new Date(e.date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <Tag className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] font-black px-2 py-1 rounded bg-muted/50 text-foreground uppercase tracking-widest border border-border/50">
                          {e.category}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <Info className="h-3.5 w-3.5 text-muted-foreground/50" />
                        <p className="text-sm font-bold text-foreground/80 group-hover:text-rose-600 transition-colors line-clamp-1 max-w-xs uppercase tracking-tight">
                          {e.description || "Uncategorized Expense"}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        {e.paidFrom === "CASH" ? (
                          <Banknote className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <CreditCard className="h-3.5 w-3.5 text-blue-500" />
                        )}
                        <span
                          className={`text-[10px] font-black tracking-[0.1em] uppercase ${e.paidFrom === "CASH" ? "text-emerald-700" : "text-blue-700"}`}
                        >
                          {e.paidFrom}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right font-mono font-black text-rose-600">
                      -{fmt(e.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        isLoading={isPending}
      />

      {showEntry && (
        <ExpenseEntryModal
          onClose={() => setShowEntry(false)}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  );
}
