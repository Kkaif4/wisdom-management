"use client";

import React from "react";
import { Download, Printer, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ReportLayoutProps {
  title: string;
  description: string;
  onExportExcel?: () => void;
  isLoading?: boolean;
  hasData?: boolean;
  children: React.ReactNode;
}

export function ReportLayout({
  title,
  description,
  onExportExcel,
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
        </div>
      </div>

      {/* Main Content */}
      <div className="relative">
        {isLoading && (
          <div className="fixed bottom-8 right-8 z-50 bg-foreground text-background px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-10 duration-300">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-xs font-black uppercase tracking-widest">Updating Data...</span>
          </div>
        )}
        <div className={cn("transition-opacity duration-300", isLoading ? "opacity-70" : "opacity-100")}>
          {children}
        </div>
      </div>
    </div>
  );
}
