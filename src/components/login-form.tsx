"use client";

import { useActionState } from "react";
import { AuthFormState, loginAction } from "@/lib/actions/auth-actions";
import { btnPrimary, inputCls } from "@/components/ui";

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

    </div>
  );
}
