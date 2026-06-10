import { GenericReportsClient } from "./GenericReportsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reports Overview | Wisdom Finance",
  description: "View financial summary reports, student transaction statements, and income audit trials.",
};

export default function ReportsLandingPage() {
  return <GenericReportsClient />;
}
