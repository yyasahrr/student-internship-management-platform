"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { apiFetch, type Letter } from "@/lib/server-api";

export async function setCompanyStatus(companyId: number, formData: FormData) {
  const session = await requireRole("admin");
  const decision = String(formData.get("decision") ?? "");
  if (decision !== "approved" && decision !== "rejected") redirect("/admin/companies");
  await apiFetch(`/admin/companies/${companyId}/${decision === "approved" ? "approve" : "reject"}/`, session, { method: "POST" });
  revalidatePath("/admin"); revalidatePath("/admin/companies"); redirect("/admin/companies");
}

export async function issueLetter(applicationId: number) {
  const session = await requireRole("admin");
  const letter = await apiFetch<Letter>(`/internships/admin/letters/issue/${applicationId}/`, session, { method: "POST" });
  revalidatePath("/admin/placements"); redirect(`/admin/letters/${letter.id}`);
}
