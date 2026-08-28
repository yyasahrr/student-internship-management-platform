import Link from "next/link";
import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import {
  Card,
  EmptyState,
  SectionTitle,
  StatCard,
  StatusBadge,
  btnPrimary,
  btnSecondary,
} from "@/components/ui";
import { cancelApplication } from "@/lib/actions/student-actions";
import { faDate, faDigits } from "@/lib/utils";

export const metadata: Metadata = { title: "داشبورد دانشجو | کارآموزیار" };
export const dynamic = "force-dynamic";

type Internship = {
  id: number; title: string; city: string; major: string; capacity: number;
  start_date: string; end_date: string; company: { name: string };
};
type Application = { id: number; status: string; internship: Internship };
type StudentProfile = {
  university: string; major: string; student_number: string; profile_complete: boolean;
};
type Paginated<T> = { results: T[] | { results: T[] } };

function resultsOf<T>(data: Paginated<T>): T[] {
  return Array.isArray(data.results) ? data.results : data.results.results;
}

export default async function StudentDashboard() {
  const session = await requireRole("student");
  if (!session.accessToken) {
    return (
      <EmptyState
        icon="🔐"
        title="نشست شما منقضی شده است"
        description="لطفاً یک‌بار از حساب خارج شوید و دوباره وارد شوید."
      />
    );
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  const headers = { Authorization: `Bearer ${session.accessToken}` };
  const [profileResponse, applicationsResponse, internshipsResponse] = await Promise.all([
    fetch(`${apiUrl}/accounts/student/profile/`, { headers, cache: "no-store" }),
    fetch(`${apiUrl}/internships/student/applications/`, { headers, cache: "no-store" }),
    fetch(`${apiUrl}/internships/`, { cache: "no-store" }),
  ]);
  if (!profileResponse.ok || !applicationsResponse.ok || !internshipsResponse.ok) {
    throw new Error("دریافت اطلاعات داشبورد از بک‌اند ناموفق بود.");
  }
  const student = (await profileResponse.json()) as StudentProfile;
  const myApplications = resultsOf((await applicationsResponse.json()) as Paginated<Application>);
  const allInternships = resultsOf((await internshipsResponse.json()) as Paginated<Internship>);
  const recommendations = allInternships
    .filter((item) => !student.major || item.major === student.major)
    .slice(0, 4);
  const profileComplete = student.profile_complete;

  const appliedIds = new Set(myApplications.map((a) => a.internship.id));
  const counts: Record<string, number> = { pending: 0, accepted: 0, rejected: 0 };
  for (const application of myApplications) counts[application.status]++;

  return (
    <div className="space-y-8">
      {/* خوش‌آمد */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-gradient-to-l from-teal-700 to-teal-800 p-6 text-white">
        <div>
          <h1 className="text-2xl font-black">
            سلام، {session.name.split(" ")[0]}! 👋
          </h1>
          <p className="mt-1 text-sm text-teal-100">
            {student.university || "دانشگاه ثبت نشده"} · {student.major || "رشته ثبت نشده"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/internships"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-teal-800 transition hover:bg-teal-50"
          >
            🔍 جستجوی فرصت‌ها
          </Link>
          <Link
            href="/student/profile"
            className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
          >
            ✏️ پروفایل من
          </Link>
        </div>
      </div>

      {!profileComplete && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-800">
            ⚠️ برای افزایش شانس پذیرش، دانشگاه، رشته و شماره دانشجویی خود را در
            پروفایل تکمیل کنید.
          </p>
          <Link href="/student/profile" className="text-sm font-black text-amber-700 hover:underline">
            تکمیل پروفایل ←
          </Link>
        </div>
      )}

      {/* آمار درخواست‌ها */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon="📨" label="کل درخواست‌ها" value={faDigits(myApplications.length)} />
        <StatCard icon="⏳" label="در انتظار بررسی" value={faDigits(counts.pending)} accent="bg-amber-50 text-amber-700" />
        <StatCard icon="✅" label="پذیرفته شده" value={faDigits(counts.accepted)} accent="bg-emerald-50 text-emerald-700" />
        <StatCard icon="❌" label="رد شده" value={faDigits(counts.rejected)} accent="bg-rose-50 text-rose-700" />
      </div>

      {/* درخواست‌های من */}
      <section>
        <SectionTitle title="درخواست‌های من" subtitle="وضعیت درخواست‌های کارآموزی شما" />
        {myApplications.length === 0 ? (
          <EmptyState
            icon="📭"
            title="هنوز درخواستی ارسال نکرده‌اید"
            description="فرصت‌های کارآموزی را مرور کنید و برای موقعیت‌های مناسب درخواست دهید."
            action={
              <Link href="/internships" className={btnPrimary}>
                مشاهده فرصت‌های کارآموزی
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {myApplications.map((app) => (
              <Card key={app.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/internships/${app.internship.id}`}
                    className="text-base font-extrabold text-slate-900 hover:text-teal-700"
                  >
                    {app.internship.title}
                  </Link>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-slate-500">
                    <span>🏭 {app.internship.company.name}</span>
                    <span>📍 {app.internship.city}</span>
                    <span>🗓️ {faDate(app.internship.start_date)} تا {faDate(app.internship.end_date)}</span>
                  </div>
                  {app.status === "accepted" && (
                    <div className="mt-2 text-xs text-slate-400">
                      ظرفیت دوره: {faDigits(app.internship.capacity)} نفر
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={app.status} />
                  {app.status === "pending" && (
                    <form action={cancelApplication.bind(null, app.id)}>
                      <button
                        type="submit"
                        className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50"
                      >
                        انصراف
                      </button>
                    </form>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* پیشنهادهای مناسب */}
      <section>
        <SectionTitle
          title="پیشنهادهای مناسب شما"
          subtitle={student.major ? `بر اساس رشته ${student.major}` : "فرصت‌های فعال سامانه"}
          action={
            <Link href="/internships" className={btnSecondary}>
              مشاهده همه
            </Link>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {recommendations
            .filter((r) => !appliedIds.has(r.id))
            .slice(0, 4)
            .map((i) => (
              <Link key={i.id} href={`/internships/${i.id}`}>
                <Card className="h-full p-5 transition hover:border-teal-300 hover:shadow-md">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-600">
                      ✓ {i.company.name}
                    </span>
                    <span className="text-[11px] text-slate-400">📍 {i.city}</span>
                  </div>
                  <h3 className="mb-1 text-sm font-extrabold text-slate-900">{i.title}</h3>
                  <div className="text-[11px] text-slate-400">
                    ظرفیت {faDigits(i.capacity)} نفر · شروع {faDate(i.start_date)}
                  </div>
                </Card>
              </Link>
            ))}
        </div>
        {recommendations.filter((r) => !appliedIds.has(r.id)).length === 0 && (
          <p className="text-sm text-slate-400">
            در حال حاضر پیشنهاد جدیدی برای شما وجود ندارد.
          </p>
        )}
      </section>
    </div>
  );
}
