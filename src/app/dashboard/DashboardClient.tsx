"use client";

import React, { useState } from "react";
import {
  Wallet,
  Building2,
  GraduationCap,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  History,
  TrendingUp,
  Receipt,
  ShieldCheck,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { ReceiptEntryModal } from "@/components/forms/ReceiptEntryModal";

interface DashboardStats {
  orgName: string;
  cashBalance: number;
  bankBalance: number;
  totalFeesAssigned: number;
  totalFeesCollected: number;
  totalExpenses: number;
}

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

interface DashboardClientProps {
  stats: DashboardStats;
  transactions: Transaction[];
}

const fmt = (val: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);

export function DashboardClient({ stats, transactions }: DashboardClientProps) {
  const router = useRouter();
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const outstanding = stats.totalFeesAssigned - stats.totalFeesCollected;
  const totalFunds = stats.cashBalance + stats.bankBalance;

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            {stats.orgName}
          </h1>
          <p className="text-muted-foreground font-medium flex items-center gap-2 mt-1">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Live Financial Overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PermissionGate permission="CREATE_RECEIPT">
            <button
              onClick={() => setShowReceiptModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Plus className="h-4 w-4" />
              New Collection
            </button>
          </PermissionGate>
          <div className="glass px-4 py-2 rounded-xl border border-primary/20 bg-primary/5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70">
              Total Liquidity
            </p>
            <p className="text-xl font-black text-primary">{fmt(totalFunds)}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Cash Card */}
        <div className="glass group relative overflow-hidden rounded-3xl p-6 transition-all hover:shadow-2xl hover:-translate-y-1 border-emerald-500/20 bg-emerald-500/[0.02]">
          <div className="absolute top-0 right-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
            <Wallet className="h-12 w-12 text-emerald-500" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-2">
            Physical Cash
          </p>
          <p className="text-3xl font-black text-foreground tracking-tight">
            {fmt(stats.cashBalance)}
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
            <TrendingUp className="h-3 w-3" />
            In Drawer
          </div>
        </div>

        {/* Bank Card */}
        <div className="glass group relative overflow-hidden rounded-3xl p-6 transition-all hover:shadow-2xl hover:-translate-y-1 border-blue-500/20 bg-blue-500/[0.02]">
          <div className="absolute top-0 right-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
            <Building2 className="h-12 w-12 text-blue-500" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-2">
            Bank Deposits
          </p>
          <p className="text-3xl font-black text-foreground tracking-tight">
            {fmt(stats.bankBalance)}
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-blue-600">
            <ShieldCheck className="h-3 w-3" />
            Verified Balance
          </div>
        </div>

        {/* Collections Card */}
        <div className="glass group relative overflow-hidden rounded-3xl p-6 transition-all hover:shadow-2xl hover:-translate-y-1 border-primary/20">
          <div className="absolute top-0 right-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
            <GraduationCap className="h-12 w-12 text-primary" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70 mb-2">
            Income / Receipts
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-foreground tracking-tight">
              {fmt(stats.totalFeesCollected)}
            </p>
          </div>
          <div className="mt-4 w-full bg-muted/50 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-1000"
              style={{
                width: `${(stats.totalFeesCollected / stats.totalFeesAssigned) * 100}%`,
              }}
            />
          </div>
          <p className="text-[10px] font-bold text-muted-foreground mt-2 uppercase tracking-tighter">
            {Math.round(
              (stats.totalFeesCollected / stats.totalFeesAssigned) * 100,
            )}
            % of target realized
          </p>
        </div>

        {/* Outstanding Card */}
        <div
          className={`glass group relative overflow-hidden rounded-3xl p-6 transition-all hover:shadow-2xl hover:-translate-y-1 ${outstanding > 0 ? "border-amber-500/20 bg-amber-500/[0.02]" : "border-border/50"}`}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
            <AlertCircle
              className={`h-12 w-12 ${outstanding > 0 ? "text-amber-500" : "text-muted-foreground"}`}
            />
          </div>
          <p
            className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${outstanding > 0 ? "text-amber-600" : "text-muted-foreground"}`}
          >
            Outstanding Dues
          </p>
          <p className="text-3xl font-black text-foreground tracking-tight">
            {fmt(outstanding)}
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-amber-600">
            {outstanding > 0 ? "Action Required" : "All Clear"}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions Table */}
        <div className="lg:col-span-2 glass rounded-3xl overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b border-border/50 flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-foreground/5 flex items-center justify-center">
                <History className="h-4 w-4 text-foreground/70" />
              </div>
              <h2 className="text-sm font-black uppercase tracking-widest text-foreground">
                Recent Activity
              </h2>
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
              Last {transactions.length} Transactions
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            {transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="h-16 w-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
                  <Clock className="h-8 w-8 text-muted-foreground/30" />
                </div>
                <p className="text-muted-foreground font-medium">
                  No activity recorded yet.
                </p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/70 bg-muted/5">
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4">Timestamp</th>
                    <th className="px-8 py-4">Transaction Details</th>
                    <th className="px-8 py-4 text-right">Amount</th>
                    <th className="px-8 py-4 text-right">Running Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {transactions.map((tx) => {
                    const isIncome = !!tx.debitAmount;
                    return (
                      <tr
                        key={tx.id}
                        className="group hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-8 py-4">
                          <div
                            className={`h-8 w-8 rounded-full flex items-center justify-center ${isIncome ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"}`}
                          >
                            {isIncome ? (
                              <ArrowDownRight className="h-4 w-4" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4" />
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-2 text-sm font-bold text-foreground/80">
                            <Clock className="h-3.5 w-3.5 text-primary/60" />
                            <div className="flex flex-col">
                              <span className="text-[11px] uppercase tracking-tighter">
                                {new Date(tx.date).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                })}
                              </span>
                              <span className="text-[10px] font-black text-muted-foreground">
                                {new Date(tx.date).toLocaleTimeString("en-IN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                })}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 max-w-[200px] md:max-w-xs">
                            {tx.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-[9px] font-black px-1.5 py-0.5 rounded tracking-widest uppercase ${tx.impactedAccount === "CASH" ? "bg-emerald-500/10 text-emerald-700" : "bg-blue-500/10 text-blue-700"}`}
                            >
                              {tx.impactedAccount}
                            </span>
                          </div>
                        </td>
                        <td
                          className={`px-8 py-4 text-right font-mono font-bold text-sm ${isIncome ? "text-emerald-600" : "text-rose-600"}`}
                        >
                          {isIncome
                            ? `+${fmt(tx.debitAmount!)}`
                            : `-${fmt(tx.creditAmount!)}`}
                        </td>
                        <td className="px-8 py-4 text-right">
                          <p className="text-sm font-black text-foreground/80">
                            {fmt(tx.balanceAfter)}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Sidebar Insights */}
        <div className="space-y-6">
          {/* Smart Insight Card */}
          <div className="relative overflow-hidden rounded-3xl p-8 bg-primary/10 border border-primary/20 shadow-lg">
            <div className="absolute -top-10 -right-10 h-40 w-40 bg-primary/20 rounded-full blur-3xl animate-pulse" />

            <h3 className="text-lg font-bold tracking-tight mb-2 text-foreground">
              Smart Insight
            </h3>

            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              {outstanding > 0
                ? `You have ${fmt(outstanding)} in outstanding dues. Sending reminders to parents could improve liquidity by ${Math.round((outstanding / totalFunds) * 100)}%.`
                : "Excellent record keeping! Your accounts are fully settled with zero outstanding student dues."}
            </p>

            <button
              onClick={() =>
                router.push("/dashboard/reports?range=LAST_30_DAYS")
              }
              className="mt-6 w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm uppercase tracking-widest hover:opacity-90 transition shadow active:scale-95"
            >
              Generate Report
            </button>
          </div>

          {/* Quick Breakdown */}
          <div className="rounded-3xl p-6 border border-border bg-card shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2 text-foreground">
              <Receipt className="h-4 w-4 text-primary" />
              Quick Breakdown
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted">
                <span className="text-xs font-semibold text-muted-foreground">
                  Total Expenses
                </span>
                <span className="text-sm font-bold text-rose-600">
                  {fmt(stats.totalExpenses)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-muted">
                <span className="text-xs font-semibold text-muted-foreground">
                  Total Income
                </span>
                <span className="text-sm font-bold text-emerald-600">
                  {fmt(stats.totalFeesCollected)}
                </span>
              </div>

              <div className="h-px bg-border my-2" />

              <div className="flex items-center justify-between p-3">
                <span className="text-xs font-semibold text-foreground">
                  Net Position
                </span>
                <span
                  className={`text-sm font-bold ${
                    stats.totalFeesCollected - stats.totalExpenses >= 0
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}
                >
                  {fmt(stats.totalFeesCollected - stats.totalExpenses)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showReceiptModal && (
        <ReceiptEntryModal
          onClose={() => setShowReceiptModal(false)}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  );
}
