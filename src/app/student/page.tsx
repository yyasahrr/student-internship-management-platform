import Link from "next/link";
import type { Metadata } from "next";
import { and, count, desc, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { applications, internships, students } from "@/db/schema";
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

export default async function StudentDashboard() {
  const session = await requireRole("student");
  const student = await db.query.students.findFirst({
    where: eq(students.userId, session.userId),
  });
  if (!student) {
    return (
      <EmptyState
        icon="⚠️"
        title="پروفایل دانشجویی یافت نشد"
        description="حساب شما پروفایل دانشجویی ندارد."
      />
    );
  }

  const profileComplete =
    Boolean(student.university && student.major && student.studentNumber);

  const [myApplications, stats, recommendations] = await Promise.all([
    db.query.applications.findMany({
      where: eq(applications.studentId, student.id),
      with: {
        internship: { with: { company: true, applications: { where: eq(applications.status, "accepted") } } },
      },
      orderBy: [desc(applications.createdAt)],
    }),
    db
      .select({ status: applications.status, value: count() })
      .from(applications)
      .where(eq(applications.studentId, student.id))
      .groupBy(applications.status),
    db.query.internships.findMany({
      where: and(
        eq(internships.status, "active"),
        student.major ? eq(internships.major, student.major) : undefined,
        ne(internships.companyId, -1)
      ),
      with: { company: true },
      orderBy: [desc(internships.createdAt)],
      limit: 4,
    }),
  ]);

  const appliedIds = new Set(myApplications.map((a) => a.internshipId));
  const counts: Record<string, number> = { pending: 0, accepted: 0, rejected: 0 };
  for (const row of stats) counts[row.status] = row.value;

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
                    <span>🗓️ {faDate(app.internship.startDate)} تا {faDate(app.internship.endDate)}</span>
                  </div>
                  {app.status === "accepted" && app.internship.applications.length >= 0 && (
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
                    ظرفیت {faDigits(i.capacity)} نفر · شروع {faDate(i.startDate)}
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
