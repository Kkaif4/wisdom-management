"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";

interface MobileHeaderProps {
  onMenuToggle: () => void;
  isOpen: boolean;
}

export function MobileHeader({ onMenuToggle, isOpen }: MobileHeaderProps) {
  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-xl border-b border-border z-40 px-4 flex items-center justify-between shadow-sm no-print">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-bold italic tracking-tighter shadow-md">
          W
        </div>
        <span className="font-black tracking-tight text-foreground text-sm uppercase">
          Wisdom Finance
        </span>
      </div>

      <button
        onClick={onMenuToggle}
        className="p-2 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>
    </header>
  );
}
