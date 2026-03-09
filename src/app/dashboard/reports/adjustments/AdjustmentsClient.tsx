"use client";

import React, { useState } from "react";
import { ReportLayout } from "@/components/dashboard/reports/ReportLayout";
import {
  ReportFilters,
  PredefinedRange,
} from "@/components/dashboard/reports/ReportFilters";
import { DataTable } from "@/components/dashboard/reports/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { exportToExcel, formatCurrency } from "@/lib/reportExport";
import { FileText, AlertCircle, TrendingUp } from "lucide-react";

interface Adjustment {
  id: string;
  date: string;
  account: string;
  amount: number;
  type: string;
  reason: string;
  createdBy: string;
}

interface AdjustmentsData {
  adjustments: Adjustment[];
  summary: {
    totalAdjustments: number;
    netAdjustmentAmount: number;
  };
}

export function AdjustmentsClient() {
  const [data, setData] = useState<AdjustmentsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    start: "",
    end: "",
    paymentMode: "ALL",
  });

  const fetchReport = async (start: string, end: string, mode: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/reports/adjustments?startDate=${start}&endDate=${end}&paymentMode=${mode}`,
      );
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch adjustments report:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRangeChange = (
    start: string,
    end: string,
    range: PredefinedRange,
  ) => {
    setFilters((prev) => ({ ...prev, start, end }));
    fetchReport(start, end, filters.paymentMode);
  };

  const handlePaymentModeChange = (mode: string) => {
    setFilters((prev) => ({ ...prev, paymentMode: mode }));
    fetchReport(filters.start, filters.end, mode);
  };

  const handleExport = () => {
    if (!data) return;
    const exportData = data.adjustments.map((a) => ({
      Date: new Date(a.date).toLocaleDateString(),
      Account: a.account,
      Type: a.type,
      Amount: a.amount,
      Reason: a.reason,
      "Performed By": a.createdBy,
    }));

    exportToExcel("Balance_Adjustments_Report", [
      { name: "Adjustments", data: exportData },
      {
        name: "Summary",
        data: [
          ["Metric", "Value"],
          ["Count", data.summary.totalAdjustments],
          ["Net Impact", data.summary.netAdjustmentAmount],
        ],
      },
    ]);
  };

  const columns: ColumnDef<Adjustment>[] = [
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
      accessorKey: "account",
      header: "Account",
      cell: ({ row }) => (
        <span className="text-[10px] font-black uppercase bg-muted px-2 py-1 rounded">
          {row.getValue("account") as string}
        </span>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <span
          className={`text-[10px] font-black ${row.getValue("type") === "INCREASE" ? "text-emerald-600" : "text-rose-600"}`}
        >
          {row.getValue("type")}
        </span>
      ),
    },
    {
      accessorKey: "amount",
      header: () => <div className="text-right">Amount</div>,
      cell: ({ row }) => (
        <div
          className={`text-right font-bold ${row.getValue("type") === "INCREASE" ? "text-emerald-600" : "text-rose-600"}`}
        >
          {formatCurrency(row.getValue("amount"))}
        </div>
      ),
    },
    { accessorKey: "reason", header: "Reason/Justification" },
    { accessorKey: "createdBy", header: "User" },
  ];

  return (
    <ReportLayout
      title="Balance Adjustments"
      description="Audit trail of manual balance corrections performed by administrators."
      onExportExcel={handleExport}
      onPrint={() => window.print()}
      isLoading={loading}
      hasData={!!data}
    >
      <div className="space-y-8">
        <ReportFilters
          onRangeChange={handleRangeChange}
          onPaymentModeChange={handlePaymentModeChange}
          isLoading={loading}
          showPaymentMode={true}
        />

        {data && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm flex flex-col group hover:border-amber-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Total Events
                  </h3>
                </div>
                <p className="text-2xl font-black text-amber-600">
                  {data.summary.totalAdjustments}
                </p>
              </div>

              <div className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm flex flex-col group hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Net Monetary Impact
                  </h3>
                </div>
                <p className="text-2xl font-black text-primary">
                  {formatCurrency(Math.abs(data.summary.netAdjustmentAmount))}{" "}
                  {data.summary.netAdjustmentAmount >= 0 ? "(+)" : "(-)"}
                </p>
              </div>
            </div>

            <div className="bg-card rounded-3xl border border-border/50 shadow-sm p-6">
              <DataTable columns={columns} data={data.adjustments} />
            </div>
          </>
        )}
      </div>
    </ReportLayout>
  );
}
