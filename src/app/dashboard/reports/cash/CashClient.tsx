"use client";

import React, { useState } from "react";
import { ReportLayout } from "@/components/dashboard/reports/ReportLayout";
import { DateRangePicker } from "@/components/dashboard/reports/DateRangePicker";
import { DataTable } from "@/components/dashboard/reports/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { exportToExcel, formatCurrency } from "@/lib/reportExport";
import { Wallet, TrendingUp, TrendingDown, Landmark } from "lucide-react";

interface CashTransaction {
  id: string;
  date: string;
  type: string;
  description: string;
  debit: number;
  credit: number;
  balanceAfter: number;
}

interface CashReportData {
  transactions: CashTransaction[];
  summary: {
    openingBalance: number;
    totalInflow: number;
    totalOutflow: number;
    closingBalance: number;
  };
}

export function CashClient() {
  const [data, setData] = useState<CashReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [dates, setDates] = useState({ start: "", end: "" });

  const fetchReport = async (start: string, end: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/reports/cash?startDate=${start}&endDate=${end}`,
      );
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch cash report:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRangeChange = (start: string, end: string) => {
    setDates({ start, end });
    fetchReport(start, end);
  };

  const handleExport = () => {
    if (!data) return;
    const exportData = data.transactions.map((t) => ({
      Date: new Date(t.date).toLocaleDateString(),
      Type: t.type.replace(/_/g, " "),
      Description: t.description,
      Inflow: t.debit,
      Outflow: t.credit,
      "Balance After": t.balanceAfter,
    }));

    exportToExcel("Cash_Ledger_Report", [
      { name: "Ledger", data: exportData },
      {
        name: "Summary",
        data: [
          ["Metric", "Value"],
          ["Opening Balance", data.summary.openingBalance],
          ["Total Inflow", data.summary.totalInflow],
          ["Total Outflow", data.summary.totalOutflow],
          ["Closing Balance", data.summary.closingBalance],
        ],
      },
    ]);
  };

  const columns: ColumnDef<CashTransaction>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <span className="font-medium">
          {new Date(row.getValue("date")).toLocaleDateString()}
        </span>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
          {(row.getValue("type") as string).replace(/_/g, " ")}
        </span>
      ),
    },
    { accessorKey: "description", header: "Description" },
    {
      accessorKey: "debit",
      header: () => <div className="text-right">Inflow (Dr)</div>,
      cell: ({ row }) => (
        <div className="text-right font-bold text-emerald-600">
          {row.getValue("debit") ? formatCurrency(row.getValue("debit")) : "—"}
        </div>
      ),
    },
    {
      accessorKey: "credit",
      header: () => <div className="text-right">Outflow (Cr)</div>,
      cell: ({ row }) => (
        <div className="text-right font-bold text-rose-600">
          {row.getValue("credit")
            ? formatCurrency(row.getValue("credit"))
            : "—"}
        </div>
      ),
    },
    {
      accessorKey: "balanceAfter",
      header: () => <div className="text-right">Balance</div>,
      cell: ({ row }) => (
        <div className="text-right font-black text-foreground">
          {formatCurrency(row.getValue("balanceAfter"))}
        </div>
      ),
    },
  ];

  return (
    <ReportLayout
      title="Cash Ledger Report"
      description="Historical list of all physical cash transactions and running balance."
      onExportExcel={handleExport}
      onPrint={() => window.print()}
      isLoading={loading}
      hasData={!!data}
    >
      <div className="space-y-8">
        <DateRangePicker
          onRangeChange={handleRangeChange}
          isLoading={loading}
        />

        {data && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm flex flex-col group hover:border-blue-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Opening
                  </h3>
                </div>
                <p className="text-2xl font-black text-blue-600">
                  {formatCurrency(data.summary.openingBalance)}
                </p>
              </div>

              <div className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm flex flex-col group hover:border-emerald-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Total Inflow
                  </h3>
                </div>
                <p className="text-2xl font-black text-emerald-600">
                  {formatCurrency(data.summary.totalInflow)}
                </p>
              </div>

              <div className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm flex flex-col group hover:border-rose-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                    <TrendingDown className="h-5 w-5" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Total Outflow
                  </h3>
                </div>
                <p className="text-2xl font-black text-rose-600">
                  {formatCurrency(data.summary.totalOutflow)}
                </p>
              </div>

              <div className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm flex flex-col group hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Landmark className="h-5 w-5" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Closing
                  </h3>
                </div>
                <p className="text-2xl font-black text-primary">
                  {formatCurrency(data.summary.closingBalance)}
                </p>
              </div>
            </div>

            <div className="bg-card rounded-3xl border border-border/50 shadow-sm p-6">
              <DataTable columns={columns} data={data.transactions} />
            </div>
          </>
        )}
      </div>
    </ReportLayout>
  );
}
