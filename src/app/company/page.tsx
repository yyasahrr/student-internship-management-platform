import Link from "next/link";
import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { apiFetch, type Company, type Internship, type Paginated } from "@/lib/server-api";
import {
  Card,
  EmptyState,
  SectionTitle,
  StatCard,
  StatusBadge,
  btnPrimary,
  btnSecondary,
} from "@/components/ui";
import { toggleInternshipStatus } from "@/lib/actions/company-actions";
import { faDate, faDigits } from "@/lib/utils";

export const metadata: Metadata = { title: "داشبورد شرکت | کارآموزیار" };
export const dynamic = "force-dynamic";

export default async function CompanyDashboard() {
  const session = await requireRole("company");
  const [company, internshipData] = await Promise.all([
    apiFetch<Company>("/accounts/company/profile/", session),
    apiFetch<Paginated<Internship>>("/internships/company/", session),
  ]);
  const myInternships = internshipData.results;

  const applicationLists = await Promise.all(myInternships.map((item) =>
    apiFetch<Paginated<{ status: string }>>(`/internships/company/${item.id}/applications/`, session)
  ));
  const applicationsById = new Map(myInternships.map((item, index) => [item.id, applicationLists[index].results]));
  const allApplications = applicationLists.flatMap((item) => item.results);
  const totalApplications = allApplications.length;
  const pendingApplications = allApplications.filter((item) => item.status === "pending").length;
  const acceptedApplications = allApplications.filter((item) => item.status === "accepted").length;

  return (
    <div className="space-y-8">
      {/* سربرگ */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-gradient-to-l from-sky-700 to-sky-800 p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-3xl">
            🏭
          </div>
          <div>
            <h1 className="text-2xl font-black">{company.name}</h1>
            <p className="mt-1 text-sm text-sky-100">
              {company.industry || "حوزه فعالیت ثبت نشده"} · {session.email}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/company/internships/new"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-sky-800 transition hover:bg-sky-50"
          >
            ➕ ثبت فرصت جدید
          </Link>
          <Link
            href="/company/profile"
            className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
          >
            ✏️ پروفایل شرکت
          </Link>
        </div>
      </div>

      {/* وضعیت تأیید اعتبار */}
      {company.status === "pending" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="mb-1 text-base font-extrabold text-amber-800">
            ⏳ حساب شرکت شما در انتظار تأیید دانشگاه است
          </h2>
          <p className="text-sm text-amber-700">
            پس از تأیید اعتبار شرکت توسط مدیر سیستم، امکان انتشار فرصت‌های
            کارآموزی برای شما فعال می‌شود. در صورت نقص اطلاعات، پروفایل شرکت را
            تکمیل کنید.
          </p>
        </div>
      )}
      {company.status === "rejected" && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
          <h2 className="mb-1 text-base font-extrabold text-rose-800">
            ❌ درخواست تأیید شرکت شما رد شده است
          </h2>
          <p className="text-sm text-rose-700">
            لطفاً اطلاعات هویتی شرکت را اصلاح کرده و مجدداً منتظر بررسی دانشگاه
            باشید.
          </p>
        </div>
      )}
      {company.status === "approved" && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">
          ✓ اعتبار شرکت شما توسط دانشگاه تأیید شده است — امکان انتشار فرصت‌ها
          فعال است.
        </div>
      )}

      {/* آمار */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon="💼" label="فرصت فعال" value={faDigits(myInternships.filter((i) => i.status === "active").length)} />
        <StatCard icon="📨" label="کل درخواست‌ها" value={faDigits(totalApplications)} accent="bg-sky-50 text-sky-700" />
        <StatCard icon="⏳" label="در انتظار بررسی" value={faDigits(pendingApplications)} accent="bg-amber-50 text-amber-700" />
        <StatCard icon="✅" label="پذیرفته شده" value={faDigits(acceptedApplications)} accent="bg-emerald-50 text-emerald-700" />
      </div>

      {/* فرصت‌های شرکت */}
      <section>
        <SectionTitle
          title="فرصت‌های کارآموزی شرکت"
          subtitle="مدیریت موقعیت‌ها و بررسی متقاضیان"
          action={
            <Link href="/company/internships/new" className={btnPrimary}>
              ➕ ثبت فرصت جدید
            </Link>
          }
        />
        {myInternships.length === 0 ? (
          <EmptyState
            icon="💼"
            title="هنوز فرصتی ثبت نکرده‌اید"
            description="اولین فرصت کارآموزی شرکت خود را ثبت کنید تا دانشجویان بتوانند درخواست دهند."
            action={
              <Link href="/company/internships/new" className={btnPrimary}>
                ثبت اولین فرصت
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {myInternships.map((i) => {
              const internshipApplications = applicationsById.get(i.id) ?? [];
              const pendingCount = internshipApplications.filter(
                (a) => a.status === "pending"
              ).length;
              const acceptedCount = internshipApplications.filter(
                (a) => a.status === "accepted"
              ).length;
              return (
                <Card key={i.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-extrabold text-slate-900">{i.title}</h3>
                      <StatusBadge status={i.status} />
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-slate-500">
                      <span>📍 {i.city}</span>
                      <span>🎓 {i.major}</span>
                      <span>🗓️ {faDate(i.start_date)} تا {faDate(i.end_date)}</span>
                      <span>
                        ظرفیت: {faDigits(acceptedCount)}/{faDigits(i.capacity)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {pendingCount > 0 && (
                      <Link
                        href={`/company/internships/${i.id}`}
                        className="rounded-xl bg-amber-100 px-3 py-2 text-xs font-black text-amber-800 transition hover:bg-amber-200"
                      >
                        {faDigits(pendingCount)} درخواست جدید
                      </Link>
                    )}
                    <Link
                      href={`/company/internships/${i.id}`}
                      className="rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      👥 متقاضیان
                    </Link>
                    {company.status === "approved" && (
                      <form action={toggleInternshipStatus.bind(null, i.id)}>
                        <button
                          type="submit"
                          className={
                            i.status === "active"
                              ? "rounded-xl border border-rose-200 px-3.5 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50"
                              : "rounded-xl border border-emerald-200 px-3.5 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-50"
                          }
                        >
                          {i.status === "active" ? "بستن فرصت" : "فعال‌سازی مجدد"}
                        </button>
                      </form>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {company.status !== "approved" && (
        <p className="text-center text-xs text-slate-400">
          {company.status === "pending"
            ? "ثبت فرصت جدید پس از تأیید اعتبار شرکت توسط دانشگاه فعال می‌شود."
            : "برای انتشار فرصت، ابتدا اطلاعات شرکت را اصلاح کنید."}
        </p>
      )}
    </div>
  );
}
