import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Wisdom Finance",
  description: "Log in to your Wisdom Finance administrative account to manage ledger books, receipts, student lists, and school expenses.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
