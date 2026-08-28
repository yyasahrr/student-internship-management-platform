"use server";

import { redirect } from "next/navigation";
import { createSession, dashboardPathForRole, destroySession } from "@/lib/auth";
import type { Role } from "@/lib/auth";

export type AuthFormState = { error?: string; success?: string };

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

type TokenResponse = { access: string; refresh: string };
type ApiUser = {
  id: number;
  email: string;
  full_name: string;
  role: Role;
};

async function apiError(response: Response): Promise<string> {
  const data = (await response.json().catch(() => null)) as
    | Record<string, unknown>
    | null;
  if (!data) return "ارتباط با سرویس احراز هویت ناموفق بود.";
  if (typeof data.detail === "string") return data.detail;
  const first = Object.values(data).flat().find((value) => typeof value === "string");
  return typeof first === "string" ? first : "اطلاعات واردشده معتبر نیست.";
}

async function authenticate(email: string, password: string) {
  const tokenResponse = await fetch(`${API_URL}/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });
  if (!tokenResponse.ok) throw new Error(await apiError(tokenResponse));
  const tokens = (await tokenResponse.json()) as TokenResponse;

  const meResponse = await fetch(`${API_URL}/auth/me/`, {
    headers: { Authorization: `Bearer ${tokens.access}` },
    cache: "no-store",
  });
  if (!meResponse.ok) throw new Error(await apiError(meResponse));
  return { tokens, user: (await meResponse.json()) as ApiUser };
}

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

  let auth;
  try {
    auth = await authenticate(email, password);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "ایمیل یا رمز عبور نادرست است.",
    };
  }

  await createSession({
    userId: auth.user.id,
    role: auth.user.role,
    name: auth.user.full_name,
    email: auth.user.email,
    accessToken: auth.tokens.access,
    refreshToken: auth.tokens.refresh,
  });

  redirect(dashboardPathForRole(auth.user.role));
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

  const registerResponse = await fetch(`${API_URL}/auth/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      username: email,
      full_name: fullName,
      password,
      password_confirm: password,
      role,
      phone,
      city,
    }),
    cache: "no-store",
  });
  if (!registerResponse.ok) return { error: await apiError(registerResponse) };

  let auth;
  try {
    auth = await authenticate(email, password);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "ورود پس از ثبت‌نام ناموفق بود." };
  }

  const profilePath = role === "student" ? "/accounts/student/profile/" : "/accounts/company/profile/";
  const profileBody = role === "student"
    ? {
        university: String(formData.get("university") ?? "").trim(),
        major: String(formData.get("major") ?? "").trim(),
        grade: String(formData.get("grade") ?? "").trim(),
        student_number: String(formData.get("studentNumber") ?? "").trim(),
      }
    : {
        name: String(formData.get("companyName") ?? fullName).trim(),
        industry: String(formData.get("industry") ?? "").trim(),
        license_number: String(formData.get("licenseNumber") ?? "").trim(),
        address: String(formData.get("address") ?? "").trim(),
        contact_phone: phone,
      };
  await fetch(`${API_URL}${profilePath}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.tokens.access}` },
    body: JSON.stringify(profileBody),
    cache: "no-store",
  });

  await createSession({
    userId: auth.user.id,
    role: auth.user.role,
    name: auth.user.full_name,
    email: auth.user.email,
    accessToken: auth.tokens.access,
    refreshToken: auth.tokens.refresh,
  });

  redirect(dashboardPathForRole(auth.user.role));
}

/* ------------------------------ خروج ------------------------------ */

export async function logoutAction() {
  await destroySession();
  redirect("/");
}
