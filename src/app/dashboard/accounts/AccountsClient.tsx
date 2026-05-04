"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Wallet,
  Plus,
  Calendar,
  Search,
  History,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Pagination } from "@/components/shared/Pagination";
import { AccountTransactionModal } from "@/components/forms/AccountTransactionModal";
import { DatePicker } from "@/components/ui/date-picker";

interface Transaction {
  id: string;
  date: string;
  type: string;
  description: string;
  account: string;
  debit: number;
  credit: number;
  balanceAfter: number;
  createdBy: string;
}

interface AccountsClientProps {
  initialTransactions: Transaction[];
  totalCount: number;
  currentPage: number;
  limit: number;
  stats: {
    cashBalance: number;
    bankBalance: number;
  };
  filters: {
    startDate: string;
    endDate: string;
    account: string;
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

const getLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function AccountsClient({
  initialTransactions,
  totalCount,
  currentPage,
  limit,
  stats,
  filters,
  error,
}: AccountsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [searchVal, setSearchVal] = useState(filters.query);

  const totalPages = Math.ceil(totalCount / limit);

  // Sync search input with URL if changed elsewhere
  useEffect(() => {
    setSearchVal(filters.query);
  }, [filters.query]);

  const updateFilters = (updates: Partial<typeof filters>) => {
    const params = new URLSearchParams(searchParams.toString());
    const newFilters = { ...filters, ...updates };

    const mapping: Record<string, string> = {
      startDate: "sd",
      endDate: "ed",
      account: "a",
      query: "q",
    };

    Object.entries(newFilters).forEach(([key, val]) => {
      const urlKey = mapping[key] || key;
      if (val && val !== "ALL") {
        params.set(urlKey, val);
      } else {
        params.delete(urlKey);
      }
    });

    params.set("p", "1"); // Reset to page 1

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ query: searchVal });
  };

  const setDateShortcut = (days: number | "currentMonth" | "lastMonth") => {
    const end = new Date();
    let start = new Date();

    if (days === "currentMonth") {
      start = new Date(end.getFullYear(), end.getMonth(), 1);
    } else if (days === "lastMonth") {
      start = new Date(end.getFullYear(), end.getMonth() - 1, 1);
      const lastDay = new Date(end.getFullYear(), end.getMonth(), 0);
      end.setTime(lastDay.getTime());
    } else {
      start.setDate(end.getDate() - (days as number));
    }

    updateFilters({
      startDate: getLocalDateString(start),
      endDate: getLocalDateString(end),
    });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header & Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Financial Accounts
          </h1>
          <p className="text-muted-foreground font-medium flex items-center gap-2 mt-1">
            <Wallet className="h-4 w-4 text-primary" />
            Cash and Bank positions with unified ledger
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="glass px-6 py-3 rounded-2xl border-emerald-500/20 bg-emerald-500/[0.03]">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600/70 mb-1">
              Cash Account
            </p>
            <p className="text-xl font-black text-foreground">
              {fmt(stats.cashBalance)}
            </p>
          </div>
          <div className="glass px-6 py-3 rounded-2xl border-blue-500/20 bg-blue-500/[0.03]">
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-600/70 mb-1">
              Bank Account
            </p>
            <p className="text-xl font-black text-foreground">
              {fmt(stats.bankBalance)}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-primary text-primary-foreground font-bold shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 ml-2"
          >
            <Plus className="h-5 w-5" />
            New Entry
          </button>
        </div>
      </div>

      {error && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-bold">{error}</p>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="glass rounded-3xl p-6 border-border/50 bg-muted/10 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-2">
              Shortcuts:
            </span>
            {[
              { label: "Today", val: 0 },
              { label: "Last 7 Days", val: 7 },
              { label: "Last 30 Days", val: 30 },
              { label: "Current Month", val: "currentMonth" },
              { label: "Last Month", val: "lastMonth" },
            ].map((s) => (
              <button
                key={s.label}
                onClick={() => setDateShortcut(s.val as any)}
                className="px-3 py-1.5 rounded-lg bg-card border border-border/50 text-[10px] font-bold uppercase tracking-tight hover:bg-muted transition-colors active:scale-95"
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-muted/30 p-1 rounded-xl border border-border/50 self-start lg:self-center">
            {["ALL", "CASH", "BANK"].map((acc) => (
              <button
                key={acc}
                onClick={() => updateFilters({ account: acc })}
                className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${
                  filters.account === acc
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {acc}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex flex-wrap items-center gap-3 bg-card/50 p-3 rounded-2xl border border-border/30 flex-1">
            <DatePicker
              value={filters.startDate}
              onChange={(val) => updateFilters({ startDate: val })}
              className="bg-transparent border-none px-0 py-0 w-32"
            />
            <span className="text-muted-foreground/50 font-black px-2 text-xs">
              TO
            </span>
            <DatePicker
              value={filters.endDate}
              onChange={(val) => updateFilters({ endDate: val })}
              className="bg-transparent border-none px-0 py-0 w-32"
            />
          </div>

          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search description or type..."
              className="w-full bg-card/50 border border-border/50 rounded-2xl pl-11 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
            />
          </form>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="glass rounded-3xl border-border/50 shadow-sm relative">
        {isPending && (
          <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-3xl">
            <div className="flex items-center gap-3 bg-card px-6 py-4 rounded-2xl shadow-2xl border border-border/50">
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
              <span className="text-sm font-black uppercase tracking-widest">
                Syncing Data...
              </span>
            </div>
          </div>
        )}

        <div className="overflow-x-auto rounded-3xl">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/70 bg-muted/20 border-b border-border/50">
                <th className="px-8 py-5">Timestamp</th>
                <th className="px-8 py-5">Classification</th>
                <th className="px-8 py-5">Details</th>
                <th className="px-8 py-5">Account</th>
                <th className="px-8 py-5 text-right">Debit (In)</th>
                <th className="px-8 py-5 text-right">Credit (Out)</th>
                <th className="px-8 py-5 text-right">Balance After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {initialTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-8 py-24 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center opacity-40">
                      <History className="h-10 w-10 mb-4" />
                      <p className="text-sm font-bold tracking-tight">
                        No activity found in this view
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                initialTransactions.map((t) => (
                  <tr
                    key={t.id}
                    className="group hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-sm font-bold text-foreground/80">
                        <Calendar className="h-3.5 w-3.5 text-primary/60" />
                        {new Date(t.date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[10px] font-black px-2 py-1 rounded bg-muted/50 text-foreground uppercase tracking-widest border border-border/50 whitespace-nowrap">
                        {t.type.split("_").join(" ")}
                      </span>
                      <p className="text-[9px] font-bold text-muted-foreground mt-1 uppercase opacity-60">
                        BY {t.createdBy}
                      </p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-foreground/80 lowercase first-letter:uppercase max-w-xs line-clamp-1">
                        {t.description}
                      </p>
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={`text-[10px] font-black tracking-widest uppercase ${t.account === "CASH" ? "text-emerald-600" : "text-blue-600"}`}
                      >
                        {t.account}
                      </span>
                    </td>
                    <td
                      className={`px-8 py-5 text-right font-mono font-bold text-sm ${t.debit > 0 ? "text-emerald-600" : "text-muted-foreground/20"}`}
                    >
                      {t.debit > 0 ? `+${fmt(t.debit)}` : "-"}
                    </td>
                    <td
                      className={`px-8 py-5 text-right font-mono font-bold text-sm ${t.credit > 0 ? "text-rose-600" : "text-muted-foreground/20"}`}
                    >
                      {t.credit > 0 ? `-${fmt(t.credit)}` : "-"}
                    </td>
                    <td className="px-8 py-5 text-right font-mono font-black text-foreground">
                      {fmt(t.balanceAfter)}
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
        onPageChange={(p) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("p", p.toString());
          startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
          });
        }}
        isLoading={isPending}
      />

      {showModal && (
        <AccountTransactionModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
