"use server";

import { and, count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { applications, internships, students } from "@/db/schema";
import { requireRole } from "@/lib/auth";

/* --------------------- به‌روزرسانی پروفایل دانشجو --------------------- */

export async function updateStudentProfile(formData: FormData) {
  const session = await requireRole("student");

  const skills = String(formData.get("skills") ?? "")
    .split(/[،,]/)
    .map((s) => s.trim())
    .filter(Boolean);

  await db
    .update(students)
    .set({
      university: String(formData.get("university") ?? "").trim(),
      major: String(formData.get("major") ?? "").trim(),
      grade: String(formData.get("grade") ?? "").trim(),
      studentNumber: String(formData.get("studentNumber") ?? "").trim(),
      gpa: String(formData.get("gpa") ?? "").trim(),
      skills,
      interests: String(formData.get("interests") ?? "").trim(),
      about: String(formData.get("about") ?? "").trim(),
      resumeUrl: String(formData.get("resumeUrl") ?? "").trim(),
    })
    .where(eq(students.userId, session.userId));

  revalidatePath("/student");
  redirect("/student");
}

/* ----------------------- ارسال درخواست کارآموزی ----------------------- */

export async function applyToInternship(internshipId: number, formData: FormData) {
  const session = await requireRole("student");

  const internship = await db.query.internships.findFirst({
    where: eq(internships.id, internshipId),
  });
  if (!internship || internship.status !== "active") {
    redirect("/internships");
  }

  const student = await db.query.students.findFirst({
    where: eq(students.userId, session.userId),
  });
  if (!student) {
    redirect("/student/profile");
  }

  // جلوگیری از درخواست تکراری
  const existing = await db.query.applications.findFirst({
    where: and(
      eq(applications.internshipId, internshipId),
      eq(applications.studentId, student.id)
    ),
  });
  if (existing) {
    redirect(`/internships/${internshipId}`);
  }

  // بررسی ظرفیت
  const [{ value: acceptedCount }] = await db
    .select({ value: count() })
    .from(applications)
    .where(
      and(
        eq(applications.internshipId, internshipId),
        eq(applications.status, "accepted")
      )
    );
  if (acceptedCount >= internship.capacity) {
    redirect(`/internships/${internshipId}`);
  }

  await db.insert(applications).values({
    internshipId,
    studentId: student.id,
    coverLetter: String(formData.get("coverLetter") ?? "").trim(),
  });

  revalidatePath(`/internships/${internshipId}`);
  revalidatePath("/student");
  redirect(`/internships/${internshipId}`);
}

/* ------------------------ انصراف از درخواست ------------------------ */

export async function cancelApplication(applicationId: number) {
  const session = await requireRole("student");
  const student = await db.query.students.findFirst({
    where: eq(students.userId, session.userId),
  });
  if (!student) redirect("/student");

  const app = await db.query.applications.findFirst({
    where: eq(applications.id, applicationId),
  });
  if (!app || app.studentId !== student.id) redirect("/student");

  await db.delete(applications).where(eq(applications.id, applicationId));
  revalidatePath("/student");
  redirect("/student");
}
