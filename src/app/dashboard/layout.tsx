"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { SplashScreen } from "@/components/shared/SplashScreen";

const SPLASH_SHOWN_KEY = "wisdom_splash_shown";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const mountTime = useRef(Date.now());

  // Determine if this is a fresh login (splash not yet shown)
  const [isFreshLogin] = useState(() => {
    if (typeof window === "undefined") return false;
    return !sessionStorage.getItem(SPLASH_SHOWN_KEY);
  });

  // Minimum splash display timer (only for fresh login)
  const [minTimeElapsed, setMinTimeElapsed] = useState(!isFreshLogin);

  useEffect(() => {
    if (!isFreshLogin) return;
    sessionStorage.setItem(SPLASH_SHOWN_KEY, "1");
    const timer = setTimeout(() => setMinTimeElapsed(true), 5000);
    return () => clearTimeout(timer);
  }, [isFreshLogin]);

  const sessionDone = status !== "loading";
  const isReady = sessionDone && minTimeElapsed;

  if (!isReady) {
    return <SplashScreen />;
  }

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
