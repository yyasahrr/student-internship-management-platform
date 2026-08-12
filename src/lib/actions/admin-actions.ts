"use server";

import { count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { applications, companies, letters } from "@/db/schema";
import { requireRole } from "@/lib/auth";

/* ------------------- بررسی و تأیید اعتبار شرکت‌ها ------------------- */

export async function setCompanyStatus(companyId: number, formData: FormData) {
  await requireRole("admin");
  const decision = String(formData.get("decision") ?? "") as
    | "approved"
    | "rejected";
  if (decision !== "approved" && decision !== "rejected") redirect("/admin");

  await db
    .update(companies)
    .set({ status: decision })
    .where(eq(companies.id, companyId));

  revalidatePath("/admin");
  revalidatePath("/admin/companies");
  redirect("/admin");
}

/* ----------------------- صدور معرفی‌نامه سیستمی ----------------------- */

export async function issueLetter(applicationId: number) {
  await requireRole("admin");

  const application = await db.query.applications.findFirst({
    where: eq(applications.id, applicationId),
    with: {
      internship: { with: { company: true } },
      student: { with: { user: true } },
    },
  });

  if (!application || application.status !== "accepted") redirect("/admin");

  // جلوگیری از صدور معرفی‌نامه تکراری برای یک پذیرش
  const existing = await db.query.letters.findFirst({
    where: eq(letters.applicationId, applicationId),
  });
  if (existing) {
    redirect(`/admin/letters/${existing.id}`);
  }

  const [{ value: letterCount }] = await db
    .select({ value: count() })
    .from(letters);
  const serialNo = `MN-1404-${String(letterCount + 1).padStart(4, "0")}`;

  const [letter] = await db
    .insert(letters)
    .values({
      studentId: application.student.id,
      internshipId: application.internshipId,
      applicationId: application.id,
      serialNo,
      university: application.student.university ?? "دانشگاه",
      studentName: application.student.user.fullName,
      studentNumber: application.student.studentNumber,
      studentMajor: application.student.major,
      studentGrade: application.student.grade,
      companyName: application.internship.company.name,
      internshipTitle: application.internship.title,
      startDate: application.internship.startDate ?? "",
      endDate: application.internship.endDate ?? "",
    })
    .returning();

  revalidatePath("/admin");
  redirect(`/admin/letters/${letter.id}`);
}
