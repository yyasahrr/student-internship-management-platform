"use server";

import { compare, hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { companies, students, users } from "@/db/schema";
import { createSession, dashboardPathForRole, destroySession } from "@/lib/auth";

export type AuthFormState = { error?: string; success?: string };

/* ------------------------------ ورود ------------------------------ */

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "ایمیل و رمز عبور را وارد کنید." };
  }

  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user || !(await compare(password, user.passwordHash))) {
    return { error: "ایمیل یا رمز عبور نادرست است." };
  }

  await createSession({
    userId: user.id,
    role: user.role,
    name: user.fullName,
    email: user.email,
  });

  redirect(dashboardPathForRole(user.role));
}

/* ---------------------------- ثبت‌نام ------------------------------ */

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const role = String(formData.get("role") ?? "student") as "student" | "company";
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const phone = String(formData.get("phone") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();

  if (!fullName || !email || !password) {
    return { error: "نام کامل، ایمیل و رمز عبور الزامی است." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "ایمیل وارد شده معتبر نیست." };
  }
  if (password.length < 6) {
    return { error: "رمز عبور باید حداقل ۶ کاراکتر باشد." };
  }

  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) {
    return { error: "این ایمیل قبلاً ثبت شده است. وارد شوید." };
  }

  const passwordHash = await hash(password, 10);

  const [user] = await db
    .insert(users)
    .values({ fullName, email, passwordHash, role, phone, city })
    .returning();

  if (role === "student") {
    await db
      .insert(students)
      .values({
        userId: user.id,
        university: String(formData.get("university") ?? "").trim(),
        major: String(formData.get("major") ?? "").trim(),
        grade: String(formData.get("grade") ?? "").trim(),
        studentNumber: String(formData.get("studentNumber") ?? "").trim(),
      })
      .returning();
  } else {
    const companyName = String(formData.get("companyName") ?? "").trim();
    if (!companyName) {
      return { error: "نام شرکت الزامی است." };
    }
    await db
      .insert(companies)
      .values({
        userId: user.id,
        name: companyName,
        industry: String(formData.get("industry") ?? "").trim(),
        licenseNumber: String(formData.get("licenseNumber") ?? "").trim(),
        contactPhone: phone,
        address: String(formData.get("address") ?? "").trim(),
      })
      .returning();
  }

  await createSession({
    userId: user.id,
    role: user.role,
    name: user.fullName,
    email: user.email,
  });

  redirect(dashboardPathForRole(user.role));
}

/* ------------------------------ خروج ------------------------------ */

export async function logoutAction() {
  await destroySession();
  redirect("/");
}
