import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Organization Settings | Wisdom Finance",
  description: "Configure your school / organization details and manage account preferences.",
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
