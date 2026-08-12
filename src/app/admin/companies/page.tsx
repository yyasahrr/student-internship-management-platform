import Link from "next/link";
import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { companies, internships } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import {
  Card,
  EmptyState,
  SectionTitle,
  StatusBadge,
  inputCls,
} from "@/components/ui";
import { setCompanyStatus } from "@/lib/actions/admin-actions";
import { faDate, faDigits } from "@/lib/utils";

export const metadata: Metadata = { title: "بررسی شرکت‌ها | کارآموزیار" };
export const dynamic = "force-dynamic";

export default async function AdminCompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireRole("admin");
  const { status } = await searchParams;

  const validStatuses = ["pending", "approved", "rejected"] as const;
  const statusFilter = validStatuses.includes(status as (typeof validStatuses)[number])
    ? (status as (typeof validStatuses)[number])
    : null;

  const allCompanies = statusFilter
    ? await db.query.companies.findMany({
        where: eq(companies.status, statusFilter),
        with: { user: true },
        orderBy: [desc(companies.createdAt)],
      })
    : await db.query.companies.findMany({
        with: { user: true },
        orderBy: [desc(companies.createdAt)],
      });

  // تعداد فرصت‌های هر شرکت
  const counts = await db
    .select({ companyId: internships.companyId, value: internships.id })
    .from(internships);
  const internshipCountByCompany = new Map<number, number>();
  for (const row of counts) {
    internshipCountByCompany.set(
      row.companyId,
      (internshipCountByCompany.get(row.companyId) ?? 0) + 1
    );
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        title="بررسی و اعتبارسنجی شرکت‌ها"
        subtitle="تأیید یا رد شرکت‌های ثبت‌نام‌کننده — فقط شرکت‌های تأییدشده امکان انتشار فرصت دارند"
      />

      <form
        method="GET"
        className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <select name="status" defaultValue={status ?? "all"} className={`${inputCls} max-w-xs`}>
          <option value="all">همه وضعیت‌ها</option>
          <option value="pending">در انتظار بررسی</option>
          <option value="approved">تأیید شده</option>
          <option value="rejected">رد شده</option>
        </select>
        <button
          type="submit"
          className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-900"
        >
          فیلتر
        </button>
      </form>

      {allCompanies.length === 0 ? (
        <EmptyState icon="🏢" title="شرکتی یافت نشد" />
      ) : (
        <div className="space-y-3">
          {allCompanies.map((c) => (
            <Card key={c.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="text-base font-extrabold text-slate-900">{c.name}</span>
                  <StatusBadge status={c.status} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-slate-500">
                  <span>🏢 حوزه: {c.industry || "—"}</span>
                  <span>🔖 مجوز: {c.licenseNumber || "—"}</span>
                  <span>📞 {c.contactPhone || "—"}</span>
                  <span>✉️ {c.user.email}</span>
                  <span>📍 {c.address || "—"}</span>
                  <span>💼 فرصت ثبت‌شده: {faDigits(internshipCountByCompany.get(c.id) ?? 0)}</span>
                  <span>🗓️ ثبت‌نام: {faDate(c.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {c.status !== "approved" && (
                  <form action={setCompanyStatus.bind(null, c.id)}>
                    <input type="hidden" name="decision" value="approved" />
                    <button
                      type="submit"
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white shadow-sm transition hover:bg-emerald-700"
                    >
                      ✓ تأیید
                    </button>
                  </form>
                )}
                {c.status !== "rejected" && (
                  <form action={setCompanyStatus.bind(null, c.id)}>
                    <input type="hidden" name="decision" value="rejected" />
                    <button
                      type="submit"
                      className="rounded-xl border border-rose-200 px-4 py-2 text-xs font-black text-rose-600 transition hover:bg-rose-50"
                    >
                      ✗ رد
                    </button>
                  </form>
                )}
                {c.status === "approved" && (
                  <Link
                    href="/admin"
                    className="rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                  >
                    بازگشت
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
