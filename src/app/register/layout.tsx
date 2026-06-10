import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register Organization | Wisdom Finance",
  description: "Initialize your school's ledger and set up opening cash and bank balances to start using Wisdom Finance.",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
