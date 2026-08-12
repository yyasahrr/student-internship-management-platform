import type { ReactNode } from "react";
import { statusLabels } from "@/lib/utils";

export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

/* ------------------------------ دکمه‌ها ------------------------------ */

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50";

export const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50";

export const btnSuccess =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50";

export const btnDanger =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50";

/* ------------------------------ کارت‌ها ------------------------------ */

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon,
  accent = "bg-teal-50 text-teal-700",
}: {
  label: string;
  value: string | number;
  icon: string;
  accent?: string;
}) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl",
          accent
        )}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-extrabold text-slate-900">{value}</div>
        <div className="truncate text-xs font-medium text-slate-500">{label}</div>
      </div>
    </Card>
  );
}

export function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---------------------------- بج وضعیت‌ها ---------------------------- */

export function StatusBadge({ status }: { status: string }) {
  const meta = statusLabels[status] ?? {
    label: status,
    className: "bg-slate-100 text-slate-600 border-slate-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold",
        meta.className
      )}
    >
      {meta.label}
    </span>
  );
}

/* --------------------------- فرم و فیلدها --------------------------- */

export const inputCls =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20";

export function Field({
  label,
  children,
  required,
  hint,
}: {
  label: string;
  children: ReactNode;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

export function EmptyState({
  icon = "🗂️",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <div className="text-4xl">{icon}</div>
      <div className="text-base font-bold text-slate-800">{title}</div>
      {description && (
        <div className="max-w-md text-sm text-slate-500">{description}</div>
      )}
      {action && <div className="mt-3">{action}</div>}
    </Card>
  );
}
