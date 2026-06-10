"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarPickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  onClose: () => void;
  style?: React.CSSProperties;
}

export function CalendarPicker({ value, onChange, onClose, style }: CalendarPickerProps) {
  const getInitialDate = () => {
    if (!value) return new Date();
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d);
  };
  const initialDate = getInitialDate();
  const [currentMonth, setCurrentMonth] = useState(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
  );

  const [focusedDate, setFocusedDate] = useState<Date>(initialDate);

  const containerRef = useRef<HTMLDivElement>(null);

  // Focus the calendar container on mount for keyboard accessibility
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  // Update currentMonth when focusedDate changes (e.g. via arrow keys)
  useEffect(() => {
    setCurrentMonth(new Date(focusedDate.getFullYear(), focusedDate.getMonth(), 1));
  }, [focusedDate]);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentYear = new Date().getFullYear();
  // 100 years past, 50 years future
  const years = Array.from({ length: 151 }, (_, i) => currentYear - 100 + i);

  const prevMonth = () => {
    const newDate = new Date(focusedDate);
    newDate.setMonth(focusedDate.getMonth() - 1);
    setFocusedDate(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(focusedDate);
    newDate.setMonth(focusedDate.getMonth() + 1);
    setFocusedDate(newDate);
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
    const [y, m, d] = value.split("-").map(Number);
    return (
      d === day &&
      (m - 1) === currentMonth.getMonth() &&
      y === currentMonth.getFullYear()
    );
  };

  const isFocused = (day: number) => {
    return (
      focusedDate.getDate() === day &&
      focusedDate.getMonth() === currentMonth.getMonth() &&
      focusedDate.getFullYear() === currentMonth.getFullYear()
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    let handled = false;
    const newDate = new Date(focusedDate);

    switch (e.key) {
      case "ArrowLeft":
        newDate.setDate(focusedDate.getDate() - 1);
        setFocusedDate(newDate);
        handled = true;
        break;
      case "ArrowRight":
        newDate.setDate(focusedDate.getDate() + 1);
        setFocusedDate(newDate);
        handled = true;
        break;
      case "ArrowUp":
        newDate.setDate(focusedDate.getDate() - 7);
        setFocusedDate(newDate);
        handled = true;
        break;
      case "ArrowDown":
        newDate.setDate(focusedDate.getDate() + 7);
        setFocusedDate(newDate);
        handled = true;
        break;
      case "Enter":
        const y = focusedDate.getFullYear();
        const m = String(focusedDate.getMonth() + 1).padStart(2, "0");
        const d = String(focusedDate.getDate()).padStart(2, "0");
        onChange(`${y}-${m}-${d}`);
        onClose();
        handled = true;
        break;
      case "Escape":
        onClose();
        handled = true;
        break;
      default:
        break;
    }

    if (handled) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[999] md:bg-transparent bg-black/40 flex md:block items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        tabIndex={0}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        className={cn(
          "bg-card border border-border/80 shadow-2xl rounded-3xl w-full max-w-[350px] overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all",
          "md:absolute"
        )}
        style={style}
      >
        {/* Header */}
        <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
          <button
            type="button"
            onClick={prevMonth}
            className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-1 font-bold">
            <select
              value={currentMonth.getMonth()}
              onChange={(e) => {
                const m = parseInt(e.target.value, 10);
                const nextFocused = new Date(focusedDate);
                nextFocused.setMonth(m);
                setFocusedDate(nextFocused);
              }}
              className="bg-transparent text-sm font-extrabold border-none outline-none cursor-pointer text-foreground hover:text-primary transition-colors focus:ring-0"
            >
              {months.map((m, idx) => (
                <option key={m} value={idx} className="bg-card text-foreground">
                  {m}
                </option>
              ))}
            </select>

            <select
              value={currentMonth.getFullYear()}
              onChange={(e) => {
                const y = parseInt(e.target.value, 10);
                const nextFocused = new Date(focusedDate);
                nextFocused.setFullYear(y);
                setFocusedDate(nextFocused);
              }}
              className="bg-transparent text-sm font-extrabold border-none outline-none cursor-pointer text-foreground hover:text-primary transition-colors focus:ring-0"
            >
              {years.map((y) => (
                <option key={y} value={y} className="bg-card text-foreground">
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
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
              type="button"
              onClick={() => selectDate(day)}
              className={cn(
                "h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center relative group focus:outline-none",
                isSelected(day)
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : isToday(day)
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted text-foreground",
                isFocused(day) && "ring-2 ring-primary ring-offset-2 ring-offset-card"
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
            type="button"
            onClick={onClose}
            className="flex-1 py-2 text-xs font-bold text-muted-foreground hover:bg-muted rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
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
