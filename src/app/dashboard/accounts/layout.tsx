import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Financial Accounts | Wisdom Finance",
  description: "Track opening balances, adjust cash & bank levels, and review institutional deposit history.",
};

export default function AccountsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
