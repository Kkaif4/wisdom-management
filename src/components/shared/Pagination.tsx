"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          disabled={isLoading}
          onClick={() => onPageChange(i)}
          className={`h-10 w-10 rounded-xl text-xs font-black transition-all ${
            currentPage === i
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
              : "bg-muted/10 text-muted-foreground hover:bg-muted active:scale-95"
          } disabled:opacity-50`}
        >
          {i}
        </button>,
      );
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <button
        disabled={currentPage === 1 || isLoading}
        onClick={() => onPageChange(currentPage - 1)}
        className="h-10 px-4 rounded-xl bg-muted/10 text-muted-foreground hover:bg-muted transition-all active:scale-95 disabled:opacity-50 disabled:hover:bg-transparent flex items-center gap-2 text-xs font-black uppercase tracking-widest"
      >
        <ChevronLeft className="h-4 w-4" />
        Prev
      </button>

      <div className="flex items-center gap-1.5">{renderPageNumbers()}</div>

      <button
        disabled={currentPage === totalPages || isLoading}
        onClick={() => onPageChange(currentPage + 1)}
        className="h-10 px-4 rounded-xl bg-muted/10 text-muted-foreground hover:bg-muted transition-all active:scale-95 disabled:opacity-50 disabled:hover:bg-transparent flex items-center gap-2 text-xs font-black uppercase tracking-widest"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
