import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth";

export default async function StudentLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRole("student");
  return <div className="py-8">{children}</div>;
}
