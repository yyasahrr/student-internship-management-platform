import type { Metadata } from "next";
import RegisterForm from "@/components/register-form";

export const metadata: Metadata = { title: "ثبت‌نام | کارآموزیار" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  const selectedRole: "student" | "company" = role === "company" ? "company" : "student";

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-10">
      <div className="w-full max-w-2xl">
        <div className="mb-6 text-center">
          <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 text-3xl shadow-lg">
            ✨
          </div>
          <h1 className="text-2xl font-black text-slate-900">ثبت‌نام در کارآموزیار</h1>
          <p className="mt-1 text-sm text-slate-500">
            {selectedRole === "student"
              ? "اطلاعات تحصیلی خود را وارد کنید تا درخواست کارآموزی ارسال کنید"
              : "اطلاعات هویتی شرکت را وارد کنید؛ تأیید اعتبار توسط دانشگاه انجام می‌شود"}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <RegisterForm role={selectedRole} />
        </div>
      </div>
    </div>
  );
}
