import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import { LayoutDashboard } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Wisdom Finance",
  description:
    "Review the privacy policy and data governance practices implemented within Wisdom Finance.",
};

export default async function PrivacyPage() {
  const session = await auth();
  const isLoggedIn = !!session;

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans selection:bg-primary/20">
      {/* Background Grid */}
      <div className="fixed inset-0 z-[-1] bg-[linear-gradient(to_right,#8080800d_1px,transparent_1px),linear-gradient(to_bottom,#8080800d_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]"></div>

      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/" className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg overflow-hidden border border-zinc-100 bg-white p-0.5">
                <Image
                  src="/icon.png"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                  priority
                />
              </div>
              <span className="font-bold tracking-tight text-foreground uppercase flex items-baseline text-sm sm:text-lg">
                Wisdom
                <span className="font-mono text-[8px] sm:text-[10px] ml-1 sm:ml-2 text-muted-foreground tracking-widest hidden sm:inline-block">
                  FINANCE_OS
                </span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-6 font-mono text-xs uppercase tracking-widest">
            <Link
              href="/features"
              aria-label="Features Page"
              className="text-muted-foreground hover:text-foreground transition-colors min-h-[48px] flex items-center px-2"
            >
              Capabilities
            </Link>
            <Link
              href="/faq"
              aria-label="FAQ Page"
              className="text-muted-foreground hover:text-foreground transition-colors min-h-[48px] flex items-center px-2"
            >
              FAQ
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href={isLoggedIn ? "/dashboard" : "/login"}
              aria-label={isLoggedIn ? "Open Dashboard" : "Sign In to system"}
              className="flex min-h-[44px] md:min-h-[48px] items-center px-2 md:px-4 font-mono text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors group"
            >
              {isLoggedIn ? (
                <>
                  <LayoutDashboard className="h-3 w-3 mr-2 text-primary" />
                  <span className="hidden sm:inline">[ System_Dashboard ]</span>
                  <span className="sm:hidden">[ Dashboard ]</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">[ Auth_Sign_In ]</span>
                  <span className="sm:hidden">[ Auth_Login ]</span>
                </>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 pt-32 pb-32">
        <section className="mx-auto max-w-4xl px-6 animate-fade-in-up">
          <div className="border-l-2 border-primary pl-4 mb-8">
            <span className="font-mono text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Governance & Policies
            </span>
          </div>

          <h1 className="text-4xl font-black tracking-tighter text-foreground md:text-5xl uppercase mb-12">
            Privacy Policy & Data Security
          </h1>

          <div className="border-t border-border/50 pt-12 space-y-10 text-muted-foreground text-sm md:text-base leading-relaxed">
            <div className="space-y-4">
              <h2 className="text-xl font-bold uppercase tracking-tight text-foreground">
                1. Data Isolation & Multi-Tenancy
              </h2>
              <p>
                All student details, academic configurations, and financial ledgers are bounded within distinct organizations. Cross-tenant database reads are strictly prevented at both ORM and application runtime layers.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold uppercase tracking-tight text-foreground">
                2. Audit Trails & Accountability
              </h2>
              <p>
                To maintain financial transparency, the system records immutable logs of operations including creation, CSV imports, and receipt cancellations. This logging covers user context, modified values, and timestamps.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold uppercase tracking-tight text-foreground">
                3. Encryption & Communications
              </h2>
              <p>
                All user accounts and authentication state checks are governed by modern cryptographic standards. Communication channels enforce secure transport protocols (HTTPS/TLS) to secure school credentials and ledger details.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="mx-auto max-w-7xl px-6 py-12 flex flex-col md:flex-row items-start lg:items-center justify-between gap-12">
          <div className="flex flex-col gap-2">
            <span className="text-2xl font-black uppercase tracking-tighter text-foreground">
              Wisdom
            </span>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              SYS.VER.2.4.0 // SECURE FINANCIAL ENGINE
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-12 lg:gap-24">
            <div className="flex flex-col gap-4">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-foreground">
                Index
              </span>
              <Link
                href="/"
                className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
              >
                Home
              </Link>
              <Link
                href="/features"
                className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
              >
                Capabilities
              </Link>
              <Link
                href="/faq"
                className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
              >
                FAQ
              </Link>
              <Link
                href="/privacy"
                className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
              >
                Privacy Policy
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-foreground">
                Actions
              </span>
              <Link
                href={isLoggedIn ? "/dashboard" : "/login"}
                className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground min-h-[44px] sm:min-h-0 flex items-center"
              >
                {isLoggedIn ? "System Dashboard" : "Authenticate"}
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-border py-6 px-6 text-center md:text-left">
          <div className="mx-auto max-w-7xl font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            © {new Date().getFullYear()} Wisdom Management Systems. Strictly Confidential Operations.
          </div>
        </div>
      </footer>
    </div>
  );
}
