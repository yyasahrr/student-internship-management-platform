"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function authHeaders(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };
}

/* --------------------- به‌روزرسانی پروفایل دانشجو --------------------- */

export async function updateStudentProfile(formData: FormData) {
  const session = await requireRole("student");

  const skills = String(formData.get("skills") ?? "")
    .split(/[،,]/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (!session.accessToken) redirect("/login");
  await fetch(`${API_URL}/accounts/student/profile/`, {
    method: "PATCH",
    headers: authHeaders(session.accessToken),
    body: JSON.stringify({
      university: String(formData.get("university") ?? "").trim(),
      major: String(formData.get("major") ?? "").trim(),
      grade: String(formData.get("grade") ?? "").trim(),
      student_number: String(formData.get("studentNumber") ?? "").trim(),
      gpa: String(formData.get("gpa") ?? "").trim(),
      skills,
      interests: String(formData.get("interests") ?? "").trim(),
      about: String(formData.get("about") ?? "").trim(),
    }),
    cache: "no-store",
  });

  revalidatePath("/student");
  redirect("/student");
}

/* ----------------------- ارسال درخواست کارآموزی ----------------------- */

export async function applyToInternship(internshipId: number, formData: FormData) {
  const session = await requireRole("student");
  if (!session.accessToken) redirect("/login");
  await fetch(`${API_URL}/internships/student/apply/${internshipId}/`, {
    method: "POST",
    headers: authHeaders(session.accessToken),
    body: JSON.stringify({
      cover_letter: String(formData.get("coverLetter") ?? "").trim(),
    }),
    cache: "no-store",
  });

  revalidatePath(`/internships/${internshipId}`);
  revalidatePath("/student");
  redirect(`/internships/${internshipId}`);
}

/* ------------------------ انصراف از درخواست ------------------------ */

export async function cancelApplication(applicationId: number) {
  const session = await requireRole("student");
  if (!session.accessToken) redirect("/login");
  await fetch(`${API_URL}/internships/student/applications/${applicationId}/cancel/`, {
    method: "DELETE",
    headers: authHeaders(session.accessToken),
    cache: "no-store",
  });
  revalidatePath("/student");
  redirect("/student");
}
