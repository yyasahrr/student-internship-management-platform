"use server";

import { and, count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { applications, companies, internships } from "@/db/schema";
import { requireRole } from "@/lib/auth";

async function getCompanyForSession() {
  const session = await requireRole("company");
  const company = await db.query.companies.findFirst({
    where: eq(companies.userId, session.userId),
  });
  if (!company) redirect("/company");
  return company;
}

/* ---------------------- به‌روزرسانی پروفایل شرکت ---------------------- */

export async function updateCompanyProfile(formData: FormData) {
  const company = await getCompanyForSession();

  await db
    .update(companies)
    .set({
      name: String(formData.get("name") ?? "").trim(),
      industry: String(formData.get("industry") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim(),
      address: String(formData.get("address") ?? "").trim(),
      website: String(formData.get("website") ?? "").trim(),
      contactPhone: String(formData.get("contactPhone") ?? "").trim(),
      licenseNumber: String(formData.get("licenseNumber") ?? "").trim(),
    })
    .where(eq(companies.id, company.id));

  revalidatePath("/company");
  redirect("/company");
}

/* ----------------------- ثبت فرصت کارآموزی جدید ----------------------- */

export async function createInternship(formData: FormData) {
  const company = await getCompanyForSession();

  // فقط شرکت‌های تأییدشده توسط دانشگاه مجاز به انتشار فرصت هستند
  if (company.status !== "approved") {
    redirect("/company");
  }

  const title = String(formData.get("title") ?? "").trim();
  if (!title) redirect("/company/internships/new");

  const skills = String(formData.get("requiredSkills") ?? "")
    .split(/[،,]/)
    .map((s) => s.trim())
    .filter(Boolean);

  await db.insert(internships).values({
    companyId: company.id,
    title,
    description: String(formData.get("description") ?? "").trim(),
    capacity: Math.max(1, Number(formData.get("capacity") ?? 1) || 1),
    requiredSkills: skills,
    city: String(formData.get("city") ?? "").trim(),
    major: String(formData.get("major") ?? "").trim(),
    startDate: String(formData.get("startDate") ?? "").trim() || null,
    endDate: String(formData.get("endDate") ?? "").trim() || null,
    conditions: String(formData.get("conditions") ?? "").trim(),
  });

  revalidatePath("/company");
  revalidatePath("/internships");
  redirect("/company");
}

/* ------------------ فعال / بسته کردن فرصت کارآموزی ------------------ */

export async function toggleInternshipStatus(internshipId: number) {
  const company = await getCompanyForSession();

  const internship = await db.query.internships.findFirst({
    where: eq(internships.id, internshipId),
  });
  if (!internship || internship.companyId !== company.id) redirect("/company");

  await db
    .update(internships)
    .set({ status: internship.status === "active" ? "closed" : "active" })
    .where(eq(internships.id, internshipId));

  revalidatePath("/company");
  revalidatePath("/internships");
  redirect("/company");
}

/* --------------------- تأیید / رد درخواست دانشجو --------------------- */

export async function reviewApplication(applicationId: number, formData: FormData) {
  const company = await getCompanyForSession();
  const decision = String(formData.get("decision") ?? "") as
    | "accepted"
    | "rejected";
  if (decision !== "accepted" && decision !== "rejected") redirect("/company");

  const application = await db.query.applications.findFirst({
    where: eq(applications.id, applicationId),
    with: { internship: true },
  });
  if (
    !application ||
    application.internship.companyId !== company.id
  ) {
    redirect("/company");
  }

  if (decision === "accepted") {
    // بررسی ظرفیت قبل از پذیرش
    const [{ value: acceptedCount }] = await db
      .select({ value: count() })
      .from(applications)
      .where(
        and(
          eq(applications.internshipId, application.internshipId),
          eq(applications.status, "accepted")
        )
      );
    if (acceptedCount >= application.internship.capacity) {
      redirect(`/company/internships/${application.internshipId}`);
    }
  }

  await db
    .update(applications)
    .set({ status: decision })
    .where(eq(applications.id, applicationId));

  // اگر ظرفیت تکمیل شد، فرصت به صورت خودکار بسته می‌شود
  if (decision === "accepted") {
    const [{ value: acceptedCount }] = await db
      .select({ value: count() })
      .from(applications)
      .where(
        and(
          eq(applications.internshipId, application.internshipId),
          eq(applications.status, "accepted")
        )
      );
    if (acceptedCount >= application.internship.capacity) {
      await db
        .update(internships)
        .set({ status: "closed" })
        .where(eq(internships.id, application.internshipId));
    }
  }

  revalidatePath(`/company/internships/${application.internshipId}`);
  revalidatePath("/company");
  revalidatePath("/admin");
  redirect(`/company/internships/${application.internshipId}`);
}
