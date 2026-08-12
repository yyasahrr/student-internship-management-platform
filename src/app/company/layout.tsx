import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth";

export default async function CompanyLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRole("company");
  return <div className="py-8">{children}</div>;
}
