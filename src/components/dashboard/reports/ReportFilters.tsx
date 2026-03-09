"use client";

import React from "react";
import { Calendar as CalendarIcon, ArrowRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

export type PredefinedRange =
  | "TODAY"
  | "LAST_7_DAYS"
  | "LAST_30_DAYS"
  | "LAST_MONTH"
  | "LAST_3_MONTHS"
  | "THIS_YEAR"
  | "CUSTOM";

interface ReportFiltersProps {
  onRangeChange: (start: string, end: string, range: PredefinedRange) => void;
  onPaymentModeChange?: (mode: string) => void;
  onCategoryChange?: (category: string) => void;
  categories?: string[];
  isLoading?: boolean;
  showPaymentMode?: boolean;
  showCategory?: boolean;
}

export function ReportFilters({
  onRangeChange,
  onPaymentModeChange,
  onCategoryChange,
  categories = [],
  isLoading,
  showPaymentMode = true,
  showCategory = false,
}: ReportFiltersProps) {
  const [activeRange, setActiveRange] =
    React.useState<PredefinedRange>("LAST_30_DAYS");
  const [startDate, setStartDate] = React.useState<string>("");
  const [endDate, setEndDate] = React.useState<string>("");
  const [paymentMode, setPaymentMode] = React.useState<string>("ALL");
  const [activeCategory, setActiveCategory] = React.useState<string>("ALL");

  const applyPreset = (preset: PredefinedRange) => {
    setActiveRange(preset);
    if (preset === "CUSTOM") return;

    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (preset) {
      case "TODAY":
        start = new Date();
        break;
      case "LAST_7_DAYS":
        start.setDate(today.getDate() - 7);
        break;
      case "LAST_30_DAYS":
        start.setDate(today.getDate() - 30);
        break;
      case "LAST_MONTH":
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case "LAST_3_MONTHS":
        start.setDate(today.getDate() - 90);
        break;
      case "THIS_YEAR":
        start = new Date(today.getFullYear(), 0, 1);
        break;
    }

    const startStr = start.toISOString().split("T")[0];
    const endStr = end.toISOString().split("T")[0];
    setStartDate(startStr);
    setEndDate(endStr);
    onRangeChange(startStr, endStr, preset);
  };

  const handleCustomApply = () => {
    if (startDate && endDate) {
      setActiveRange("CUSTOM");
      onRangeChange(startDate, endDate, "CUSTOM");
    }
  };

  const handlePaymentModeClick = (mode: string) => {
    setPaymentMode(mode);
    onPaymentModeChange?.(mode);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cat = e.target.value;
    setActiveCategory(cat);
    onCategoryChange?.(cat);
  };

  React.useEffect(() => {
    applyPreset("LAST_30_DAYS");
  }, []);

  return (
    <div className="space-y-4 hide-print">
      <div className="bg-card border border-border/50 rounded-3xl p-5 md:p-6 shadow-sm overflow-hidden relative group/filters transition-all hover:border-primary/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-end gap-6 md:gap-8">
          {/* 1. Date Presets */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Time Period
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3">
              {[
                { id: "TODAY", label: "Today" },
                { id: "LAST_7_DAYS", label: "7 Days" },
                { id: "LAST_30_DAYS", label: "30 Days" },
                { id: "LAST_MONTH", label: "Monthly" },
                { id: "LAST_3_MONTHS", label: "Quarterly" },
                { id: "THIS_YEAR", label: "Year-to-date" },
              ].map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset.id as PredefinedRange)}
                  className={`px-3 py-2.5 rounded-xl text-[10px] md:text-xs font-bold transition-all border border-transparent shadow-sm ${
                    activeRange === preset.id
                      ? "bg-primary text-primary-foreground shadow-primary/20 scale-[1.02]"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted hover:border-border/50"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden xl:block w-[1px] h-12 bg-border/50 mb-1" />

          {/* 2. Custom Range */}
          <div className="flex-none space-y-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-3.5 w-3.5 text-primary" />
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Custom Range
              </label>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-muted/40 border border-border/50 rounded-xl px-4 py-2.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                />
                <span className="text-[10px] font-black uppercase text-muted-foreground opacity-50">
                  to
                </span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-muted/40 border border-border/50 rounded-xl px-4 py-2.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                />
              </div>
              <Button
                onClick={handleCustomApply}
                disabled={isLoading}
                className="h-11 rounded-xl px-6 font-black text-xs uppercase tracking-widest"
              >
                Apply
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* 3. Secondary Filters (Payment Mode & Category) */}
        {(showPaymentMode || showCategory) && (
          <div className="mt-8 pt-6 border-t border-border/50 relative z-10 flex flex-wrap items-center gap-8">
            {showPaymentMode && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-3.5 w-3.5 text-primary" />
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Payment Mode
                  </label>
                </div>
                <div className="flex items-center gap-2 bg-muted/20 p-1 rounded-xl w-fit border border-border/30">
                  {["ALL", "CASH", "BANK"].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => handlePaymentModeClick(mode)}
                      className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                        paymentMode === mode
                          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {showCategory && categories.length > 0 && (
              <div className="space-y-3 flex-1 min-w-[200px] max-w-sm">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Category Filter
                  </label>
                </div>
                <select
                  value={activeCategory}
                  onChange={handleCategoryChange}
                  className="w-full bg-muted/40 border border-border/50 rounded-xl px-4 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold appearance-none cursor-pointer hover:bg-muted/60"
                >
                  <option value="ALL">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
