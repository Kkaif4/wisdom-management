import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile | Wisdom Finance",
  description: "View your employee account details, check permission level, and update password settings securely.",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
