import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "@/components/shared/Toast";

/*
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
*/

export const metadata: Metadata = {
  title: "Wisdom Finance | Enterprise School Ledger & Financial OS",
  description:
    "An institutional-grade financial ledger and administrative operating system engineered for school billing, receipt tracking, student promotions, and automated financial auditing.",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

import { NextAuthProvider } from "@/components/providers/NextAuthProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased font-sans`}>
        <NextAuthProvider>
          {children}
          <ToastContainer />
        </NextAuthProvider>
      </body>
    </html>
  );
}
