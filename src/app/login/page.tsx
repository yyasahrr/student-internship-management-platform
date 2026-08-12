import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import LoginForm from "@/components/login-form";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "ورود | کارآموزیار" };

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect(
      session.role === "admin"
        ? "/admin"
        : session.role === "company"
          ? "/company"
          : "/student"
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 text-3xl shadow-lg">
            🎓
          </div>
          <h1 className="text-2xl font-black text-slate-900">ورود به کارآموزیار</h1>
          <p className="mt-1 text-sm text-slate-500">
            به پل ارتباطی دانشجو و صنعت خوش آمدید
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <LoginForm />
        </div>
        <p className="mt-5 text-center text-sm text-slate-500">
          حساب کاربری ندارید؟{" "}
          <Link href="/register" className="font-bold text-teal-700 hover:underline">
            ثبت‌نام کنید
          </Link>
        </p>
      </div>
    </div>
  );
}
