/** تبدیل ارقام انگلیسی به فارسی */
export function faDigits(value: string | number): string {
  const fa = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(value).replace(/[0-9]/g, (d) => fa[Number(d)]);
}

/** نمایش تاریخ میلادی به صورت شمسی (با پشتیبان میلادی در صورت عدم پشتیبانی ICU) */
export function faDate(iso: string | Date | null | undefined): string {
  if (!iso) return "—";
  const date = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(date.getTime())) return "—";
  try {
    return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  }
}

/** برچسب فارسی وضعیت‌ها */
export const statusLabels: Record<string, { label: string; className: string }> = {
  pending: { label: "در انتظار بررسی", className: "bg-amber-100 text-amber-800 border-amber-200" },
  accepted: { label: "پذیرفته شده", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  rejected: { label: "رد شده", className: "bg-rose-100 text-rose-700 border-rose-200" },
  approved: { label: "تأیید شده", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  active: { label: "فعال", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  closed: { label: "بسته شده", className: "bg-slate-100 text-slate-600 border-slate-200" },
};

export function roleLabel(role: string): string {
  if (role === "student") return "دانشجو";
  if (role === "company") return "شرکت / کارخانه";
  return "مدیر سیستم (دانشگاه)";
}
