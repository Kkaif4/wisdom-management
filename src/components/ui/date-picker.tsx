"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CalendarPicker } from "@/components/shared/CalendarPicker";

interface DatePickerProps {
  value: string; // YYYY-MM-DD
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
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Convert YYYY-MM-DD to DD/MM/YYYY
  const toDisplayFormat = (val: string) => {
    if (!val) return "";
    const parts = val.split("-");
    if (parts.length !== 3) return "";
    const [y, m, d] = parts;
    return `${d}/${m}/${y}`;
  };

  // Keep input text synced with value changes
  useEffect(() => {
    if (value) {
      setInputValue(toDisplayFormat(value));
      setError(null);
    } else {
      setInputValue("");
    }
  }, [value]);

  const updateCoords = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX,
      });
    }
  };

  useEffect(() => {
    if (showCalendar) {
      updateCoords();
      window.addEventListener("resize", updateCoords);
      // capture: true ensures we catch scroll events in scrolling containers
      window.addEventListener("scroll", updateCoords, true);
    }
    return () => {
      window.removeEventListener("resize", updateCoords);
      window.removeEventListener("scroll", updateCoords, true);
    };
  }, [showCalendar]);

  const toggleCalendar = () => {
    if (!showCalendar) {
      updateCoords();
    }
    setShowCalendar(!showCalendar);
  };

  // Mask function: auto-insert slashes
  const formatAsDateMask = (val: string) => {
    const clean = val.replace(/\D/g, "");
    if (clean.length === 0) return "";

    if (clean.length <= 2) {
      return clean;
    } else if (clean.length <= 4) {
      return `${clean.slice(0, 2)}/${clean.slice(2)}`;
    } else {
      return `${clean.slice(0, 2)}/${clean.slice(2, 4)}/${clean.slice(4, 8)}`;
    }
  };

  const parseAndValidateDate = (input: string): { isValid: boolean; yyyymmdd?: string; error?: string } => {
    if (!input) return { isValid: true, yyyymmdd: "" };

    const parts = input.split("/");
    if (parts.length !== 3) {
      return { isValid: false, error: "Format must be DD/MM/YYYY" };
    }

    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const y = parseInt(parts[2], 10);

    if (isNaN(d) || isNaN(m) || isNaN(y)) {
      return { isValid: false, error: "Must be a valid date" };
    }

    if (y < 1000 || y > 9999) {
      return { isValid: false, error: "Year must be 4 digits" };
    }

    if (m < 1 || m > 12) {
      return { isValid: false, error: "Month must be 01 - 12" };
    }

    const daysInMonth = new Date(y, m, 0).getDate();
    if (d < 1 || d > daysInMonth) {
      return { isValid: false, error: `Day must be 01 - ${daysInMonth}` };
    }

    const yyyy = String(y);
    const mm = String(m).padStart(2, "0");
    const dd = String(d).padStart(2, "0");

    return { isValid: true, yyyymmdd: `${yyyy}-${mm}-${dd}` };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAsDateMask(e.target.value);
    setInputValue(formatted);

    if (formatted.length === 10) {
      const result = parseAndValidateDate(formatted);
      if (result.isValid && result.yyyymmdd) {
        onChange(result.yyyymmdd);
        setError(null);
      } else {
        setError(result.error || "Invalid date");
      }
    } else if (formatted.length === 0) {
      onChange("");
      setError(null);
    } else {
      setError(null); // Clear error while editing
    }
  };

  const handleBlur = () => {
    if (inputValue.length > 0 && inputValue.length < 10) {
      setError("Format must be DD/MM/YYYY");
    } else if (inputValue.length === 10) {
      const result = parseAndValidateDate(inputValue);
      if (result.isValid && result.yyyymmdd) {
        onChange(result.yyyymmdd);
        setError(null);
      } else {
        setError(result.error || "Invalid date");
      }
    } else if (inputValue.length === 0 && required) {
      setError("Date is required");
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      toggleCalendar();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder || "DD/MM/YYYY"}
          className={cn(
            "w-full bg-muted/20 border rounded-2xl pl-4 pr-12 py-3.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30",
            error ? "border-destructive text-destructive focus:ring-destructive/20 focus:border-destructive" : "border-border/50 hover:border-primary/20 text-foreground",
            className
          )}
        />
        <button
          type="button"
          onClick={toggleCalendar}
          className="absolute right-4 p-1 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
        >
          <CalendarIcon className="h-4 w-4 opacity-70 shrink-0" />
        </button>
      </div>

      {error && (
        <span className="text-[10px] text-destructive font-semibold mt-1.5 ml-2 block animate-in fade-in slide-in-from-top-1 duration-200">
          {error}
        </span>
      )}

      {showCalendar && mounted && typeof window !== "undefined" && createPortal(
        <CalendarPicker
          value={value}
          onChange={onChange}
          onClose={() => setShowCalendar(false)}
          style={coords ? {
            position: "absolute",
            top: `${coords.top}px`,
            left: `${coords.left}px`,
          } : undefined}
        />,
        document.body
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
