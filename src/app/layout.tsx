import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import Navbar from "@/components/navbar";

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-vazirmatn",
});

export const metadata: Metadata = {
  title: "کارآموزیار | پل ارتباطی دانشجو و صنعت",
  description:
    "سامانه یکپارچه کارآموزی و کاریابی: شرکت‌ها ظرفیت کارآموزی اعلام می‌کنند، دانشجویان درخواست می‌دهند و دانشگاه نظارت می‌کند.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 pb-16">{children}</main>
      </body>
    </html>
  );
}
