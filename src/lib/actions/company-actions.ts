"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { apiFetch, type Company, type Internship } from "@/lib/server-api";

export async function updateCompanyProfile(formData: FormData) {
  const session = await requireRole("company");
  await apiFetch("/accounts/company/profile/", session, {
    method: "PATCH",
    body: JSON.stringify({
      name: String(formData.get("name") ?? "").trim(),
      industry: String(formData.get("industry") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim(),
      address: String(formData.get("address") ?? "").trim(),
      website: String(formData.get("website") ?? "").trim(),
      contact_phone: String(formData.get("contactPhone") ?? "").trim(),
      license_number: String(formData.get("licenseNumber") ?? "").trim(),
    }),
  });
  revalidatePath("/company");
  redirect("/company");
}

export async function createInternship(formData: FormData) {
  const session = await requireRole("company");
  const company = await apiFetch<Company>("/accounts/company/profile/", session);
  if (!company.is_approved) redirect("/company");
  const required_skills = String(formData.get("requiredSkills") ?? "").split(/[،,]/).map(s => s.trim()).filter(Boolean);
  await apiFetch("/internships/company/", session, {
    method: "POST",
    body: JSON.stringify({
      title: String(formData.get("title") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim(),
      capacity: Math.max(1, Number(formData.get("capacity") ?? 1) || 1),
      required_skills,
      city: String(formData.get("city") ?? "").trim(),
      major: String(formData.get("major") ?? "").trim(),
      start_date: String(formData.get("startDate") ?? "").trim(),
      end_date: String(formData.get("endDate") ?? "").trim(),
      conditions: String(formData.get("conditions") ?? "").trim(),
    }),
  });
  revalidatePath("/company"); revalidatePath("/internships"); redirect("/company");
}

export async function toggleInternshipStatus(internshipId: number) {
  const session = await requireRole("company");
  await apiFetch(`/internships/company/${internshipId}/close/`, session, { method: "POST" });
  revalidatePath("/company"); revalidatePath("/internships"); redirect("/company");
}

export async function reviewApplication(applicationId: number, formData: FormData) {
  const session = await requireRole("company");
  const decision = String(formData.get("decision") ?? "");
  if (decision !== "accepted" && decision !== "rejected") redirect("/company");
  const application = await apiFetch<{ internship: Internship }>(`/internships/company/applications/${applicationId}/review/`, session, {
    method: "PATCH", body: JSON.stringify({ status: decision }),
  });
  revalidatePath("/company"); revalidatePath("/admin");
  redirect(`/company/internships/${application.internship.id}`);
}
