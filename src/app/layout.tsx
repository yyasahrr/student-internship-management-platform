import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Navbar from "@/components/navbar";
import { ensureSeed } from "@/db/seed";

export const metadata: Metadata = {
  title: "کارآموزیار | پل ارتباطی دانشجو و صنعت",
  description:
    "سامانه یکپارچه کارآموزی و کاریابی: شرکت‌ها ظرفیت کارآموزی اعلام می‌کنند، دانشجویان درخواست می‌دهند و دانشگاه نظارت می‌کند.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  await ensureSeed();

  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 pb-16">{children}</main>
      </body>
    </html>
  );
}
