"use client";

import React, { useState } from "react";
import { ReportLayout } from "@/components/dashboard/reports/ReportLayout";
import { ReportFilters } from "@/components/dashboard/reports/ReportFilters";
import { exportToExcel, formatCurrency } from "@/lib/reportExport";
import {
  TrendingUp,
  TrendingDown,
  Landmark,
  ReceiptText,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface GenericData {
  summary: {
    totalFeesCollected: number;
    totalExpenses: number;
    netCashFlow: number;
    outstandingDues: number;
  };
  expenseBreakdown: { category: string; totalAmount: number; count: number }[];
}

export function GenericReportsClient() {
  const [data, setData] = useState<GenericData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async (start: string, end: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/reports/financial?startDate=${start}&endDate=${end}`,
      );
      const json = await res.json();
      if (!json.error) {
        setData(json);
      }
    } catch (err) {
      console.error("Failed to fetch summary:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!data) return;
    exportToExcel("Financial_Summary_Report", [
      {
        name: "Summary",
        data: [
          ["Metric", "Value"],
          ["Total Fees Collected", data.summary.totalFeesCollected],
          ["Total Expenses", data.summary.totalExpenses],
          ["Net Cash Flow", data.summary.netCashFlow],
          ["Outstanding Dues", data.summary.outstandingDues],
        ],
      },
      { name: "Expenses By Category", data: data.expenseBreakdown },
    ]);
  };

  return (
    <ReportLayout
      title="Financial Overview"
      description="Consolidated summary of institution collections, spending, and outstanding dues."
      onExportExcel={handleExport}
      onPrint={() => window.print()}
      isLoading={loading}
      hasData={!!data}
    >
      <div className="space-y-10 pb-20">
        <ReportFilters
          onRangeChange={(s, e, r) => fetchReport(s, e)}
          isLoading={loading}
          showPaymentMode={false}
        />

        {data && (
          <div className="space-y-12">
            {/* 1. Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: "Total Revenue",
                  value: data.summary.totalFeesCollected,
                  icon: TrendingUp,
                  color: "text-emerald-600",
                  bg: "bg-emerald-500/10",
                  border: "hover:border-emerald-500/30",
                },
                {
                  label: "Total Expenses",
                  value: data.summary.totalExpenses,
                  icon: TrendingDown,
                  color: "text-rose-600",
                  bg: "bg-rose-500/10",
                  border: "hover:border-rose-500/30",
                },
                {
                  label: "Net Cash Flow",
                  value: data.summary.netCashFlow,
                  icon: Landmark,
                  color: "text-primary",
                  bg: "bg-primary/10",
                  border: "hover:border-primary/30",
                },
                {
                  label: "Outstanding",
                  value: data.summary.outstandingDues,
                  icon: AlertTriangle,
                  color: "text-amber-600",
                  bg: "bg-amber-500/10",
                  border: "hover:border-amber-500/30",
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className={`bg-card p-6 rounded-[2rem] border border-border/50 shadow-sm flex flex-col transition-all duration-300 ${stat.border}`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`h-10 w-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}
                    >
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {stat.label}
                    </h3>
                  </div>
                  <p className={`text-2xl font-black ${stat.color}`}>
                    {formatCurrency(stat.value)}
                  </p>
                </div>
              ))}
            </div>

            {/* 2. Visual Breakdowns & Links */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Spending breakdown */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <ReceiptText className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-black tracking-tight">
                      Expense Categories
                    </h2>
                  </div>
                  <Link
                    href="/dashboard/reports/expenses"
                    className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1.5 transition-all"
                  >
                    View Full Report <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="bg-card rounded-[2.5rem] border border-border/50 p-8 shadow-sm">
                  <div className="space-y-4">
                    {data.expenseBreakdown.slice(0, 5).map((cat, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-xs font-bold text-foreground/80">
                            {cat.category}
                          </span>
                          <span className="text-xs font-black">
                            {formatCurrency(cat.totalAmount)}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-1000"
                            style={{
                              width: `${Math.min(100, (cat.totalAmount / data.summary.totalExpenses) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    {data.expenseBreakdown.length === 0 && (
                      <p className="text-center py-10 text-muted-foreground text-xs font-medium">
                        No expenses logged in this period.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Access Sidebar */}
              <div className="space-y-6">
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-2 mt-2">
                  Specialized Views
                </h2>
                <div className="flex flex-col gap-3">
                  {[
                    {
                      label: "Fee Collections",
                      href: "/dashboard/reports/fees",
                      desc: "Detailed payment history per student.",
                    },
                    {
                      label: "Account Ledgers",
                      href: "/dashboard/reports/accounts",
                      desc: "Cash & Bank transaction flow.",
                    },
                    {
                      label: "Balance Adjustments",
                      href: "/dashboard/reports/adjustments",
                      desc: "Audit trail of balance corrections.",
                    },
                  ].map((item, i) => (
                    <Link
                      key={i}
                      href={item.href}
                      className="group p-5 rounded-3xl border border-border/50 bg-card hover:border-primary/40 hover:bg-primary/[0.02] transition-all shadow-sm flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <h4 className="text-sm font-black group-hover:text-primary transition-colors">
                          {item.label}
                        </h4>
                        <p className="text-[10px] text-muted-foreground font-medium leading-relaxed max-w-[180px]">
                          {item.desc}
                        </p>
                      </div>
                      <div className="h-8 w-8 rounded-full border border-border/50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ReportLayout>
  );
}
