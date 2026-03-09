"use client";

import React from "react";
import { Download, Printer, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReportLayoutProps {
  title: string;
  description: string;
  onExportExcel?: () => void;
  onPrint?: () => void;
  isLoading?: boolean;
  hasData?: boolean;
  children: React.ReactNode;
}

export function ReportLayout({
  title,
  description,
  onExportExcel,
  onPrint,
  isLoading,
  hasData,
  children,
}: ReportLayoutProps) {
  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="max-w-2xl">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-xs md:text-sm font-medium text-muted-foreground mt-1">
            {description}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 hide-print no-scrollbar border-b border-border/20 lg:border-none">
          <Button
            variant="outline"
            onClick={onExportExcel}
            disabled={!hasData || isLoading}
            className="flex-1 lg:flex-none h-11 rounded-xl font-bold bg-muted/30 border-border/50"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button
            onClick={onPrint}
            disabled={!hasData || isLoading}
            className="flex-1 lg:flex-none h-11 rounded-xl font-bold shadow-lg shadow-primary/20"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print Report
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative">
        {isLoading && (
          <div className="fixed top-24 right-8 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 animate-bounce">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-xs font-bold">Refreshing...</span>
          </div>
        )}
        <div className={isLoading ? "opacity-50 pointer-events-none" : ""}>
          {children}
        </div>
      </div>

      {/* Global Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            background: white !important;
            color: black !important;
            font-size: 10pt;
          }
          .hide-print,
          .no-scrollbar {
            display: none !important;
          }
          .bg-card,
          .bg-muted,
          .bg-muted/10,
          .bg-primary/10 {
            background: transparent !important;
            border-color: #eee !important;
            box-shadow: none !important;
          }
          .rounded-3xl,
          .rounded-xl,
          .rounded-2xl {
            border-radius: 4px !important;
            border-width: 1px !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          th,
          td {
            border-bottom: 1px solid #eee !important;
            padding: 8px 4px !important;
          }
          th {
            background: #f9f9f9 !important;
            font-weight: bold !important;
            -webkit-print-color-adjust: exact;
          }
          .fixed,
          .animate-bounce,
          .animate-spin {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
