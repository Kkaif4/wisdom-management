"use client";

import React from "react";
import { GraduationCap, ShieldCheck, Loader2 } from "lucide-react";

export function SplashScreen() {
  const [msgIndex, setMsgIndex] = React.useState(0);
  const loadingMessages = [
    "Synchronizing Secure Session...",
    "Loading Organization Policies...",
    "Fetching Financial Ledger...",
    "Decrypting Student Records...",
    "Preparing Dashboard Interface...",
    "Finalizing Security Handshake...",
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background overflow-hidden">
      {/* Dynamic Background Gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      <div className="relative flex flex-col items-center">
        {/* Animated Logo Container */}
        <div className="relative mb-8 group">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150 animate-pulse" />
          <div className="relative h-24 w-24 bg-primary rounded-[2rem] flex items-center justify-center shadow-2xl shadow-primary/40 transform transition-transform group-hover:scale-105 duration-500">
            <GraduationCap className="h-12 w-12 text-primary-foreground stroke-[2.5]" />
          </div>
          
          {/* Decorative Rings */}
          <div className="absolute -inset-4 border border-primary/10 rounded-[2.5rem] animate-[spin_8s_linear_infinite]" />
          <div className="absolute -inset-8 border border-primary/5 rounded-[3rem] animate-[spin_12s_linear_infinite_reverse]" />
        </div>

        {/* Branding */}
        <div className="text-center space-y-2 mb-12">
          <h1 className="text-4xl font-black tracking-tighter text-foreground flex items-center gap-3">
            WISDOM <span className="text-primary">FINANCE</span>
          </h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground font-bold tracking-widest text-[10px] uppercase">
            <ShieldCheck className="h-3 w-3 text-emerald-500" />
            Enterprise Grade Security
          </div>
        </div>

        {/* Loading Indicator */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative h-1 w-48 bg-muted rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-primary w-1/3 rounded-full animate-[loading_1.5s_ease-in-out_infinite]" />
          </div>
          
          <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground/60 h-5">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {loadingMessages[msgIndex]}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-10 left-0 right-0 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">
          Powered by Wisdom Management Systems
        </p>
      </div>

      <style jsx global>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(200%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}
