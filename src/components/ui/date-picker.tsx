"use client";

import React, { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CalendarPicker } from "@/components/shared/CalendarPicker";

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
}

export function DatePicker({
  value,
  onChange,
  className,
  placeholder,
  required
}: DatePickerProps) {
  const [showCalendar, setShowCalendar] = useState(false);

  // Format date for display
  const getDisplayDate = () => {
    if (!value) return placeholder || "Select date";
    const [y, m, d] = value.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const displayDate = getDisplayDate();

  return (
    <div className="relative w-full">
      <div
        onClick={() => setShowCalendar(true)}
        className={cn(
          "w-full bg-muted/20 border border-border/50 rounded-2xl px-4 py-3.5 text-sm font-medium cursor-pointer transition-all hover:border-primary/20 flex items-center gap-3",
          !value && "text-muted-foreground",
          className
        )}
      >
        <CalendarIcon className="h-4 w-4 opacity-50 shrink-0" />
        <span className="flex-1 truncate">{displayDate}</span>
      </div>

      {showCalendar && (
        <CalendarPicker
          value={value}
          onChange={onChange}
          onClose={() => setShowCalendar(false)}
        />
      )}

      {/* Hidden input for form submission if needed */}
      <input
        type="hidden"
        value={value}
        required={required}
      />
    </div>
  );
}
