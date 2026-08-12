"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AuthFormState, registerAction } from "@/lib/actions/auth-actions";
import { btnPrimary, cn, Field, inputCls } from "@/components/ui";

export default function RegisterForm({ role }: { role: "student" | "company" }) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    registerAction,
    {}
  );

  return (
    <div className="space-y-6">
      {/* انتخاب نقش */}
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5">
        <Link
          href="/register?role=student"
          className={cn(
            "rounded-xl px-4 py-2.5 text-center text-sm font-bold transition",
            role === "student"
              ? "bg-white text-teal-800 shadow"
              : "text-slate-500 hover:text-slate-700"
          )}
        >
          🎓 دانشجو
        </Link>
        <Link
          href="/register?role=company"
          className={cn(
            "rounded-xl px-4 py-2.5 text-center text-sm font-bold transition",
            role === "company"
              ? "bg-white text-teal-800 shadow"
              : "text-slate-500 hover:text-slate-700"
          )}
        >
          🏭 شرکت / کارخانه
        </Link>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="role" value={role} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="نام و نام خانوادگی" required>
            <input
              name="fullName"
              required
              placeholder={
                role === "student" ? "مثلاً: سارا محمدی" : "نام نماینده شرکت"
              }
              className={inputCls}
            />
          </Field>
          <Field label="ایمیل" required>
            <input
              type="email"
              name="email"
              dir="ltr"
              required
              placeholder="you@example.com"
              className={inputCls}
            />
          </Field>
          <Field label="رمز عبور" required hint="حداقل ۶ کاراکتر">
            <input
              type="password"
              name="password"
              dir="ltr"
              required
              minLength={6}
              placeholder="••••••••"
              className={inputCls}
            />
          </Field>
          <Field label="شماره تماس">
            <input name="phone" dir="ltr" placeholder="09xx xxx xxxx" className={inputCls} />
          </Field>
          <Field label="شهر" required>
            <input name="city" required placeholder="مثلاً: تهران" className={inputCls} />
          </Field>

          {role === "student" ? (
            <>
              <Field label="دانشگاه">
                <input name="university" placeholder="مثلاً: دانشگاه صنعتی شریف" className={inputCls} />
              </Field>
              <Field label="رشته تحصیلی">
                <input name="major" placeholder="مثلاً: مهندسی کامپیوتر" className={inputCls} />
              </Field>
              <Field label="مقطع تحصیلی">
                <select name="grade" className={inputCls} defaultValue="کارشناسی">
                  <option value="کارشناسی">کارشناسی</option>
                  <option value="کارشناسی ارشد">کارشناسی ارشد</option>
                  <option value="دکتری">دکتری</option>
                </select>
              </Field>
              <Field label="شماره دانشجویی">
                <input name="studentNumber" dir="ltr" placeholder="مثلاً: 99120001" className={inputCls} />
              </Field>
            </>
          ) : (
            <>
              <Field label="نام شرکت / کارخانه" required>
                <input name="companyName" required placeholder="نام رسمی شرکت" className={inputCls} />
              </Field>
              <Field label="حوزه فعالیت">
                <input name="industry" placeholder="مثلاً: فناوری اطلاعات، فولاد، انرژی" className={inputCls} />
              </Field>
              <Field label="شناسه صنعتی / مجوز فعالیت" required>
                <input name="licenseNumber" dir="ltr" required placeholder="شماره مجوز" className={inputCls} />
              </Field>
              <Field label="آدرس شرکت">
                <input name="address" placeholder="آدرس کامل" className={inputCls} />
              </Field>
            </>
          )}
        </div>

        {state.error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            ⚠️ {state.error}
          </div>
        )}

        <button type="submit" disabled={pending} className={`${btnPrimary} w-full`}>
          {pending ? "در حال ثبت‌نام..." : "ایجاد حساب کاربری"}
        </button>

        <p className="text-center text-xs text-slate-400">
          {role === "company" &&
            "پس از ثبت‌نام، اعتبار شرکت شما توسط دانشگاه بررسی و تأیید می‌شود."}
        </p>
      </form>
    </div>
  );
}
