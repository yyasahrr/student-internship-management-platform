import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  Role,
  SESSION_COOKIE,
  Session,
  signSessionToken,
  verifySessionToken,
} from "@/lib/jwt";

export type { Role, Session };

/** خواندن جلسه کاربر از کوکی (سمت سرور) */
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/** تنظیم کوکی جلسه پس از ورود موفق */
export async function createSession(session: Session) {
  const token = await signSessionToken(session);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** محافظت از صفحات: فقط نقش مشخص مجاز است، در غیر این صورت هدایت می‌شود */
export async function requireRole(role: Role): Promise<Session> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  if (session.role !== role) {
    redirect(
      session.role === "admin"
        ? "/admin"
        : session.role === "company"
          ? "/company"
          : "/student"
    );
  }
  return session;
}

export function dashboardPathForRole(role: Role): string {
  return role === "admin" ? "/admin" : role === "company" ? "/company" : "/student";
}
