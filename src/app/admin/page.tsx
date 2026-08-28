import Link from "next/link";
import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { apiFetch, type Company, type Paginated } from "@/lib/server-api";
import {
  Card,
  EmptyState,
  SectionTitle,
  StatCard,
  StatusBadge,
  btnSecondary,
} from "@/components/ui";
import { setCompanyStatus } from "@/lib/actions/admin-actions";
import { faDate, faDigits } from "@/lib/utils";

export const metadata: Metadata = { title: "پنل مدیریت | کارآموزیار" };
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await requireRole("admin");
  const [stats, companyData] = await Promise.all([
    apiFetch<{ pending_companies: number; total_students: number; active_internships: number; accepted_applications: number; issued_letters: number }>("/internships/stats/"),
    apiFetch<Paginated<Company>>("/admin/companies/", session),
  ]);
  const pendingCompanies = companyData.results.filter((item) => item.status === "pending").slice(0, 10);

  return (
    <div className="space-y-8">
      {/* سربرگ */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-gradient-to-l from-slate-800 to-slate-900 p-6 text-white">
        <div>
          <h1 className="text-2xl font-black">🏛️ پنل مدیریت دانشگاه</h1>
          <p className="mt-1 text-sm text-slate-300">
            نظارت بر شرکت‌ها، پذیرش‌ها و صدور معرفی‌نامه‌ها — {session.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/companies"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-800 transition hover:bg-slate-100"
          >
            🏢 بررسی شرکت‌ها
          </Link>
          <Link
            href="/admin/placements"
            className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
          >
            📜 پذیرش‌ها و نامه‌ها
          </Link>
        </div>
      </div>

      {/* آمار کلی */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard icon="🏢" label="شرکت در انتظار بررسی" value={faDigits(stats.pending_companies)} accent="bg-amber-50 text-amber-700" />
        <StatCard icon="🎓" label="دانشجویان" value={faDigits(stats.total_students)} accent="bg-violet-50 text-violet-700" />
        <StatCard icon="💼" label="فرصت فعال" value={faDigits(stats.active_internships)} />
        <StatCard icon="✅" label="پذیرش موفق" value={faDigits(stats.accepted_applications)} accent="bg-emerald-50 text-emerald-700" />
        <StatCard icon="📜" label="معرفی‌نامه صادرشده" value={faDigits(stats.issued_letters)} accent="bg-sky-50 text-sky-700" />
      </div>

      {/* شرکت‌های در انتظار تأیید */}
      <section>
        <SectionTitle
          title="شرکت‌های در انتظار تأیید اعتبار"
          subtitle="بررسی و تأیید یا رد شرکت‌های ثبت‌نام‌کننده"
          action={
            <Link href="/admin/companies" className={btnSecondary}>
              مشاهده همه شرکت‌ها
            </Link>
          }
        />
        {pendingCompanies.length === 0 ? (
          <Card className="p-6 text-center text-sm font-semibold text-slate-400">
            ✓ در حال حاضر شرکت جدیدی در انتظار بررسی نیست.
          </Card>
        ) : (
          <div className="space-y-3">
            {pendingCompanies.map((c) => (
              <Card key={c.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-base font-extrabold text-slate-900">{c.name}</span>
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-slate-500">
                    <span>🏢 حوزه: {c.industry || "—"}</span>
                    <span>🔖 مجوز: {c.license_number || "—"}</span>
                    <span>📞 {c.contact_phone || c.user.phone || "—"}</span>
                    <span>✉️ {c.user.email}</span>
                    <span>📍 {c.address || "—"}</span>
                    <span>🗓️ ثبت: {faDate(c.created_at)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <form action={setCompanyStatus.bind(null, c.id)}>
                    <input type="hidden" name="decision" value="approved" />
                    <button
                      type="submit"
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white shadow-sm transition hover:bg-emerald-700"
                    >
                      ✓ تأیید اعتبار
                    </button>
                  </form>
                  <form action={setCompanyStatus.bind(null, c.id)}>
                    <input type="hidden" name="decision" value="rejected" />
                    <button
                      type="submit"
                      className="rounded-xl border border-rose-200 px-4 py-2 text-xs font-black text-rose-600 transition hover:bg-rose-50"
                    >
                      ✗ رد درخواست
                    </button>
                  </form>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* دسترسی سریع */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/admin/placements">
          <Card className="h-full p-5 text-center transition hover:border-teal-300 hover:shadow-md">
            <div className="mb-2 text-3xl">📜</div>
            <div className="text-sm font-extrabold text-slate-900">
              صدور معرفی‌نامه
            </div>
            <div className="mt-1 text-xs text-slate-400">
              برای پذیرش‌های نهایی معرفی‌نامه سیستمی صادر و چاپ کنید
            </div>
          </Card>
        </Link>
        <Link href="/admin/companies">
          <Card className="h-full p-5 text-center transition hover:border-teal-300 hover:shadow-md">
            <div className="mb-2 text-3xl">🏢</div>
            <div className="text-sm font-extrabold text-slate-900">
              اعتبارسنجی شرکت‌ها
            </div>
            <div className="mt-1 text-xs text-slate-400">
              بررسی مدارک و تأیید یا رد شرکت‌های ثبت‌نامی
            </div>
          </Card>
        </Link>
        <Link href="/internships">
          <Card className="h-full p-5 text-center transition hover:border-teal-300 hover:shadow-md">
            <div className="mb-2 text-3xl">🔍</div>
            <div className="text-sm font-extrabold text-slate-900">
              پایش فرصت‌ها
            </div>
            <div className="mt-1 text-xs text-slate-400">
              مشاهده فرصت‌های فعال ثبت‌شده توسط شرکت‌ها
            </div>
          </Card>
        </Link>
      </div>

      {pendingCompanies.length === 0 && (
        <EmptyState
          icon="🎉"
          title="همه امور در وضعیت پایداری است"
          description="هیچ شرکت جدیدی در انتظار بررسی نیست. پذیرش‌های جدید در بخش نامه‌ها قابل مشاهده است."
        />
      )}
    </div>
  );
}
