import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { apiFetch, type Application, type Internship, type Paginated } from "@/lib/server-api";
import { reviewApplication } from "@/lib/actions/company-actions";
import {
  Card,
  EmptyState,
  SectionTitle,
  StatusBadge,
  btnPrimary,
} from "@/components/ui";
import { faDate, faDigits } from "@/lib/utils";

export const metadata: Metadata = { title: "متقاضیان فرصت | کارآموزیار" };
export const dynamic = "force-dynamic";

export default async function InternshipApplicantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole("company");
  const { id } = await params;
  const internshipId = Number(id);
  if (!Number.isFinite(internshipId)) notFound();

  let internship: Internship;
  let internshipApplications: Application[];
  try {
    [internship, { results: internshipApplications }] = await Promise.all([
      apiFetch<Internship>(`/internships/company/${internshipId}/`, session),
      apiFetch<Paginated<Application>>(`/internships/company/${internshipId}/applications/`, session),
    ]);
  } catch { notFound(); }

  const acceptedCount = internshipApplications.filter(
    (a) => a.status === "accepted"
  ).length;
  const capacityFull = acceptedCount >= internship.capacity;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/company"
          className="mb-3 inline-block text-sm font-bold text-sky-700 hover:underline"
        >
          → بازگشت به داشبورد شرکت
        </Link>
        <SectionTitle
          title={internship.title}
          subtitle={`📍 ${internship.city} · 🎓 ${internship.major} · 🗓️ ${faDate(internship.start_date)} تا ${faDate(internship.end_date)}`}
          action={<StatusBadge status={internship.status} />}
        />
      </div>

      {/* نوار ظرفیت */}
      <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="text-sm font-bold text-slate-700">
          ظرفیت پذیرش:{" "}
          <span className="text-teal-700">{faDigits(acceptedCount)}</span>
          <span className="text-slate-400"> / {faDigits(internship.capacity)}</span>
        </div>
        <div className="h-2.5 min-w-40 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-l from-teal-500 to-teal-700"
            style={{
              width: `${(acceptedCount / Math.max(1, internship.capacity)) * 100}%`,
            }}
          />
        </div>
        {capacityFull && (
          <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-rose-600">
            ظرفیت تکمیل شده است
          </span>
        )}
      </Card>

      {/* فهرست متقاضیان */}
      <SectionTitle
        title={`متقاضیان (${faDigits(internshipApplications.length)} نفر)`}
        subtitle="رزومه، مهارت‌ها و متن درخواست هر متقاضی را بررسی و تصمیم بگیرید"
      />

      {internshipApplications.length === 0 ? (
        <EmptyState
          icon="👥"
          title="هنوز متقاضی‌ای برای این فرصت ثبت نشده است"
          description="وقتی دانشجویان درخواست دهند، اطلاعات آن‌ها اینجا نمایش داده می‌شود."
        />
      ) : (
        <div className="space-y-4">
          {internshipApplications.map((app) => (
            <Card key={app.id} className="p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                {/* اطلاعات دانشجو */}
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 text-lg font-black text-white">
                      {app.student.user.full_name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-900">
                        {app.student.user.full_name}
                      </div>
                      <div className="text-xs font-medium text-slate-400">
                        {app.student.university || "دانشگاه ثبت نشده"} ·{" "}
                        {app.student.major || "رشته ثبت نشده"} ·{" "}
                        {app.student.grade || "مقطع ثبت نشده"}
                      </div>
                    </div>
                  </div>

                  <div className="mb-3 grid gap-1.5 text-xs font-medium text-slate-500 sm:grid-cols-3">
                    <span>🎓 شماره دانشجویی: {app.student.student_number || "—"}</span>
                    <span>📊 معدل: {app.student.gpa || "—"}</span>
                    <span>📞 تماس: {app.student.user.phone || "—"}</span>
                  </div>

                  {(app.student.skills ?? []).length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {app.student.skills!.map((s) => (
                        <span
                          key={s}
                          className="rounded-md bg-violet-50 px-2 py-0.5 text-[11px] font-bold text-violet-700"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {app.cover_letter && (
                    <div className="mb-3 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                      <span className="mb-1 block text-[11px] font-black text-slate-400">
                        متن درخواست:
                      </span>
                      {app.cover_letter}
                    </div>
                  )}

                  {app.student.resume && (
                    <Link
                      href={app.student.resume}
                      target="_blank"
                      className="text-xs font-bold text-violet-700 hover:underline"
                    >
                      📄 مشاهده فایل رزومه ←
                    </Link>
                  )}
                </div>

                {/* تصمیم‌گیری */}
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={app.status} />
                  {app.status === "pending" && (
                    <div className="flex gap-2">
                      <form action={reviewApplication.bind(null, app.id)}>
                        <input type="hidden" name="decision" value="accepted" />
                        <button
                          type="submit"
                          disabled={capacityFull}
                          className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          ✓ تأیید درخواست
                        </button>
                      </form>
                      <form action={reviewApplication.bind(null, app.id)}>
                        <input type="hidden" name="decision" value="rejected" />
                        <button
                          type="submit"
                          className="rounded-xl border border-rose-200 px-4 py-2 text-xs font-black text-rose-600 transition hover:bg-rose-50"
                        >
                          ✗ رد درخواست
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {internshipApplications.length > 0 && (
        <Link href="/company" className={`${btnPrimary} mt-4`}>
          بازگشت به داشبورد
        </Link>
      )}
    </div>
  );
}
