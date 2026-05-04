import {
  Calendar as CalendarIcon,
  ArrowRight,
  Filter,
  ChevronDown,
  Clock,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

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
    useState<PredefinedRange>("LAST_30_DAYS");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [paymentMode, setPaymentMode] = useState<string>("ALL");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [isExpanded, setIsExpanded] = useState(false);

  const applyPreset = (preset: PredefinedRange) => {
    setActiveRange(preset);
    if (preset === "CUSTOM") {
      setIsExpanded(true);
      return;
    }

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

    const y = start.getFullYear();
    const m = String(start.getMonth() + 1).padStart(2, "0");
    const d = String(start.getDate()).padStart(2, "0");
    const startStr = `${y}-${m}-${d}`;

    const ey = end.getFullYear();
    const em = String(end.getMonth() + 1).padStart(2, "0");
    const ed = String(end.getDate()).padStart(2, "0");
    const endStr = `${ey}-${em}-${ed}`;

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

  useEffect(() => {
    applyPreset("LAST_30_DAYS");
  }, []);

  const getRangeLabel = () => {
    if (activeRange === "CUSTOM") {
      return `${startDate} to ${endDate}`;
    }
    const label = [
      { id: "TODAY", label: "Today" },
      { id: "LAST_7_DAYS", label: "Last 7 Days" },
      { id: "LAST_30_DAYS", label: "Last 30 Days" },
      { id: "LAST_MONTH", label: "Last Month" },
      { id: "LAST_3_MONTHS", label: "Last Quarter" },
      { id: "THIS_YEAR", label: "Year-to-date" },
    ].find((p) => p.id === activeRange)?.label;
    return label || "Custom Range";
  };

  return (
    <div className="space-y-4 hide-print">
      <div
        className={cn(
          "bg-card border border-border/40 rounded-[2.5rem] shadow-sm overflow-hidden transition-all duration-500 ease-in-out",
          isExpanded
            ? "ring-1 ring-primary/10 shadow-xl"
            : "hover:border-primary/20",
        )}
      >
        {/* Header / Trigger */}
        <div
          className="flex flex-wrap items-center justify-between p-4 px-6 md:p-5 md:px-8 cursor-pointer group"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "h-10 w-10 rounded-2xl flex items-center justify-center transition-colors duration-300",
                isExpanded
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-primary",
              )}
            >
              <Filter className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground">
                Report Filters
              </h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Clock className="h-3 w-3" />
                {getRangeLabel()}
                {paymentMode !== "ALL" && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span className="text-primary">{paymentMode} ONLY</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="p-2 rounded-xl hover:bg-muted transition-colors"
            >
              <ChevronDown
                className={cn(
                  "h-5 w-5 text-muted-foreground transition-transform duration-500",
                  isExpanded ? "rotate-180 text-primary" : "",
                )}
              />
            </button>
          </div>
        </div>

        {/* Expandable Content */}
        <div
          className={cn(
            "grid transition-all duration-500 ease-in-out",
            isExpanded
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0 pointer-events-none",
          )}
        >
          <div className="overflow-hidden">
            <div className="p-6 px-8 md:p-8 md:px-10 border-t border-border/30 space-y-8 bg-muted/[0.02]">
              {/* Section 1: Presets */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    Quick Select Period
                  </label>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
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
                      className={cn(
                        "px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm",
                        activeRange === preset.id
                          ? "bg-primary text-primary-foreground border-primary shadow-primary/20 scale-[1.05]"
                          : "bg-card text-muted-foreground border-border/50 hover:border-primary/30 hover:bg-muted/10",
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid xl:grid-cols-2 gap-10">
                {/* Section 2: Custom Range */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-3.5 w-3.5 text-primary" />
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                      Or Set Custom Range
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <DatePicker
                        value={startDate}
                        onChange={setStartDate}
                        placeholder="From"
                        className="bg-card border-border/50 h-12"
                      />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 opacity-30" />
                    <div className="flex-1">
                      <DatePicker
                        value={endDate}
                        onChange={setEndDate}
                        placeholder="To"
                        className="bg-card border-border/50 h-12"
                      />
                    </div>
                    <Button
                      onClick={handleCustomApply}
                      disabled={isLoading || !startDate || !endDate}
                      className="h-12 rounded-2xl px-6 font-black text-[10px] uppercase tracking-widest bg-foreground text-background hover:bg-foreground/90"
                    >
                      Apply
                    </Button>
                  </div>
                </div>

                {/* Section 3: Filters */}
                <div className="flex flex-wrap gap-8">
                  {showPaymentMode && (
                    <div className="space-y-4 min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <Filter className="h-3.5 w-3.5 text-primary" />
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                          Payment Method
                        </label>
                      </div>
                      <div className="flex items-center bg-muted/40 p-1 rounded-2xl border border-border/30 w-fit">
                        {["ALL", "CASH", "BANK"].map((mode) => (
                          <button
                            key={mode}
                            onClick={() => handlePaymentModeClick(mode)}
                            className={cn(
                              "px-6 py-2.5 rounded-xl text-[10px] font-black tracking-[0.1em] transition-all",
                              paymentMode === mode
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/10"
                                : "text-muted-foreground hover:text-foreground",
                            )}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {showCategory && categories.length > 0 && (
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-2">
                        <Search className="h-3.5 w-3.5 text-primary" />
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                          Categorization
                        </label>
                      </div>
                      <div className="relative">
                        <select
                          value={activeCategory}
                          onChange={handleCategoryChange}
                          className="w-full bg-card border border-border/50 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-bold appearance-none cursor-pointer hover:border-primary/30 h-12"
                        >
                          <option value="ALL">All Categories</option>
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground opacity-50">
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
