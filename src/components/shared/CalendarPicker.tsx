"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarPickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  onClose: () => void;
}

export function CalendarPicker({ value, onChange, onClose }: CalendarPickerProps) {
  const getInitialDate = () => {
    if (!value) return new Date();
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d);
  };
  const initialDate = getInitialDate();
  const [currentMonth, setCurrentMonth] = useState(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
  );

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const selectDate = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    onChange(`${y}-${m}-${d}`);
    onClose();
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth.getMonth() &&
      today.getFullYear() === currentMonth.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!value) return false;
    const selected = new Date(value);
    return (
      selected.getDate() === day &&
      selected.getMonth() === currentMonth.getMonth() &&
      selected.getFullYear() === currentMonth.getFullYear()
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[999] animate-in fade-in duration-200">
      <div className="bg-card border shadow-2xl rounded-3xl w-full max-w-[350px] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-sm font-black uppercase tracking-widest">
            {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </div>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1 p-4 pb-0">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-[10px] font-black text-muted-foreground uppercase text-center py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-1 p-4 pt-2">
          {padding.map((_, i) => (
            <div key={`p-${i}`} className="h-10" />
          ))}
          {days.map((day) => (
            <button
              key={day}
              onClick={() => selectDate(day)}
              className={cn(
                "h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center relative group",
                isSelected(day)
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : isToday(day)
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted text-foreground"
              )}
            >
              {day}
              {isToday(day) && !isSelected(day) && (
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-muted/30 flex justify-between gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-xs font-bold text-muted-foreground hover:bg-muted rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              const date = new Date();
              const y = date.getFullYear();
              const m = String(date.getMonth() + 1).padStart(2, "0");
              const d = String(date.getDate()).padStart(2, "0");
              onChange(`${y}-${m}-${d}`);
              onClose();
            }}
            className="flex-1 py-2 bg-foreground text-background text-xs font-black rounded-xl uppercase tracking-widest shadow-xl shadow-foreground/10 transition-all hover:scale-105 active:scale-95"
          >
            Today
          </button>
        </div>
      </div>
    </div>
  );
}
