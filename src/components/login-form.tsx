"use client";

import { useActionState } from "react";
import { AuthFormState, loginAction } from "@/lib/actions/auth-actions";
import { btnPrimary, inputCls } from "@/components/ui";

const demoAccounts = [
  { label: "🎓 ورود سریع دانشجو", email: "sara@student.ac.ir", hint: "سارا محمدی" },
  { label: "🏭 ورود سریع شرکت", email: "hr@parstech.ir", hint: "پارس تکنولوژی" },
  { label: "🏛️ ورود سریع مدیر", email: "admin@university.ac.ir", hint: "مدیر دانشگاه" },
];

export default function LoginForm() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    loginAction,
    {}
  );

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            ایمیل
          </label>
          <input
            type="email"
            name="email"
            dir="ltr"
            required
            placeholder="you@example.com"
            className={inputCls}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            رمز عبور
          </label>
          <input
            type="password"
            name="password"
            dir="ltr"
            required
            placeholder="••••••••"
            className={inputCls}
          />
        </div>
        {state.error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            ⚠️ {state.error}
          </div>
        )}
        <button type="submit" disabled={pending} className={`${btnPrimary} w-full`}>
          {pending ? "در حال ورود..." : "ورود به سامانه"}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs font-semibold text-slate-400">
            حساب‌های نمایشی سامانه
          </span>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {demoAccounts.map((acc) => (
          <form key={acc.email} action={formAction}>
            <input type="hidden" name="email" value={acc.email} />
            <input type="hidden" name="password" value="Password@1234" />
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl border border-dashed border-teal-300 bg-teal-50/50 px-3 py-3 text-xs font-bold text-teal-800 transition hover:bg-teal-50"
            >
              {acc.label}
              <span className="mt-0.5 block text-[10px] font-medium text-teal-600/70">
                {acc.hint}
              </span>
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
