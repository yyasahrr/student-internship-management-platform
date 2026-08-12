import Link from "next/link";
import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { applications, letters } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import {
  Card,
  EmptyState,
  SectionTitle,
  StatusBadge,
} from "@/components/ui";
import { issueLetter } from "@/lib/actions/admin-actions";
import { faDate, faDigits } from "@/lib/utils";

export const metadata: Metadata = { title: "پذیرش‌ها و نامه‌ها | کارآموزیار" };
export const dynamic = "force-dynamic";

export default async function AdminPlacementsPage() {
  await requireRole("admin");

  const [acceptedApplications, issuedLetters] = await Promise.all([
    db.query.applications.findMany({
      where: eq(applications.status, "accepted"),
      with: {
        student: { with: { user: true } },
        internship: { with: { company: true } },
      },
      orderBy: [desc(applications.createdAt)],
    }),
    db.query.letters.findMany({
      with: { student: { with: { user: true } }, internship: { with: { company: true } } },
      orderBy: [desc(letters.issuedAt)],
    }),
  ]);

  const letterByApplication = new Map(issuedLetters.map((l) => [l.applicationId, l]));

  return (
    <div className="space-y-10">
      {/* پذیرش‌ها */}
      <section>
        <SectionTitle
          title="وضعیت کارآموزی دانشجویان"
          subtitle="دانشجویانی که در یک شرکت/کارخانه پذیرفته شده‌اند — برای هر پذیرش معرفی‌نامه صادر کنید"
        />
        {acceptedApplications.length === 0 ? (
          <EmptyState
            icon="🎓"
            title="هنوز پذیرشی ثبت نشده است"
            description="وقتی شرکت‌ها درخواست دانشجویان را تأیید کنند، پذیرش‌ها اینجا نمایش داده می‌شوند."
          />
        ) : (
          <div className="space-y-3">
            {acceptedApplications.map((app) => {
              const letter = letterByApplication.get(app.id);
              return (
                <Card key={app.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="text-base font-extrabold text-slate-900">
                        {app.student.user.fullName}
                      </span>
                      <StatusBadge status="accepted" />
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-slate-500">
                      <span>🎓 {app.student.major || "—"} · {app.student.grade || "—"}</span>
                      <span>🏫 {app.student.university || "—"}</span>
                      <span>🔢 شماره دانشجویی: {app.student.studentNumber || "—"}</span>
                      <span className="font-bold text-teal-700">
                        🏭 {app.internship.company.name}
                      </span>
                      <span>💼 {app.internship.title}</span>
                      <span>
                        🗓️ {faDate(app.internship.startDate)} تا {faDate(app.internship.endDate)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {letter ? (
                      <Link
                        href={`/admin/letters/${letter.id}`}
                        className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white shadow-sm transition hover:bg-emerald-700"
                      >
                        📜 مشاهده / چاپ نامه
                      </Link>
                    ) : (
                      <form action={issueLetter.bind(null, app.id)}>
                        <button
                          type="submit"
                          className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-black text-white shadow-sm transition hover:bg-slate-900"
                        >
                          📜 صدور معرفی‌نامه
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

      {/* نامه‌های صادرشده */}
      <section>
        <SectionTitle
          title={`معرفی‌نامه‌های صادرشده (${faDigits(issuedLetters.length)})`}
          subtitle="آرشیو معرفی‌نامه‌های سیستمی — قابل مشاهده و چاپ"
        />
        {issuedLetters.length === 0 ? (
          <Card className="p-6 text-center text-sm font-semibold text-slate-400">
            هنوز معرفی‌نامه‌ای صادر نشده است.
          </Card>
        ) : (
          <div className="space-y-3">
            {issuedLetters.map((l) => (
              <Card key={l.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-extrabold text-slate-900">
                      {l.student.user.fullName}
                    </span>
                    <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-black text-sky-700">
                      شماره: {l.serialNo}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-slate-500">
                    <span>🏭 {l.companyName}</span>
                    <span>💼 {l.internshipTitle}</span>
                    <span>🗓️ صادرشده: {faDate(l.issuedAt)}</span>
                  </div>
                </div>
                <Link
                  href={`/admin/letters/${l.id}`}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  👁️ مشاهده نامه
                </Link>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
