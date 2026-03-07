"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background/50 font-sans">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      <MobileHeader
        onMenuToggle={() => setSidebarOpen(!isSidebarOpen)}
        isOpen={isSidebarOpen}
      />

      <main className="min-h-screen transition-all duration-300 ease-in-out pt-16 lg:pt-0 lg:pl-[280px]">
        <div className="p-4 md:p-10 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
