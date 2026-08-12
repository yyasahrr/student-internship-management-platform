import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { applications, internships, students } from "@/db/schema";
import { applyToInternship } from "@/lib/actions/student-actions";
import { getSession } from "@/lib/auth";
import { Card, EmptyState, StatusBadge, btnPrimary, btnSecondary, inputCls } from "@/components/ui";
import { faDate, faDigits } from "@/lib/utils";

export const metadata: Metadata = { title: "جزئیات فرصت | کارآموزیار" };
export const dynamic = "force-dynamic";

export default async function InternshipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const internshipId = Number(id);
  if (!Number.isFinite(internshipId)) notFound();

  const internship = await db.query.internships.findFirst({
    where: eq(internships.id, internshipId),
    with: {
      company: true,
      applications: { where: eq(applications.status, "accepted") },
    },
  });
  if (!internship) notFound();

  const session = await getSession();
  let myApplication = null;
  if (session?.role === "student") {
    const student = await db.query.students.findFirst({
      where: eq(students.userId, session.userId),
    });
    if (student) {
      myApplication = await db.query.applications.findFirst({
        where: (t, { eq: e, and: a }) =>
          a(
            e(t.internshipId, internshipId),
            e(t.studentId, student.id)
          ),
      });
    }
  }

  const remaining = Math.max(0, internship.capacity - internship.applications.length);
  const applyAction = applyToInternship.bind(null, internshipId);

  return (
    <div className="py-8">
      <Link href="/internships" className="mb-4 inline-block text-sm font-bold text-teal-700 hover:underline">
        → بازگشت به لیست فرصت‌ها
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* ستون اصلی */}
        <div className="space-y-6">
          <Card className="p-6 sm:p-8">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <StatusBadge status={internship.status} />
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                ✓ شرکت تأییدشده
              </span>
            </div>
            <h1 className="mb-2 text-2xl font-black text-slate-900">
              {internship.title}
            </h1>
            <p className="mb-5 text-sm font-semibold text-teal-700">
              {internship.company.name}
            </p>

            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { icon: "📍", label: "شهر", value: internship.city ?? "—" },
                { icon: "🎓", label: "رشته مرتبط", value: internship.major ?? "—" },
                { icon: "🗓️", label: "شروع", value: faDate(internship.startDate) },
                { icon: "🏁", label: "پایان", value: faDate(internship.endDate) },
              ].map((f) => (
                <div key={f.label} className="rounded-xl bg-slate-50 p-3">
                  <div className="text-lg">{f.icon}</div>
                  <div className="text-[11px] font-semibold text-slate-400">
                    {f.label}
                  </div>
                  <div className="mt-0.5 text-sm font-bold text-slate-800">
                    {f.value}
                  </div>
                </div>
              ))}
            </div>

            <h2 className="mb-2 text-base font-extrabold text-slate-900">
              شرح موقعیت
            </h2>
            <p className="mb-5 whitespace-pre-line text-sm leading-7 text-slate-600">
              {internship.description || "—"}
            </p>

            <h2 className="mb-2 text-base font-extrabold text-slate-900">
              مهارت‌های مورد نیاز
            </h2>
            <div className="mb-5 flex flex-wrap gap-2">
              {(internship.requiredSkills ?? []).map((s) => (
                <span
                  key={s}
                  className="rounded-lg border border-teal-100 bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800"
                >
                  {s}
                </span>
              ))}
              {(internship.requiredSkills ?? []).length === 0 && (
                <span className="text-sm text-slate-400">مهارت خاصی اعلام نشده</span>
              )}
            </div>

            <h2 className="mb-2 text-base font-extrabold text-slate-900">
              شرایط کاری
            </h2>
            <p className="whitespace-pre-line rounded-xl bg-amber-50 p-4 text-sm leading-7 text-amber-900">
              {internship.conditions || "—"}
            </p>
          </Card>

          {/* فرم درخواست */}
          <Card className="p-6">
            <h2 className="mb-3 text-lg font-extrabold text-slate-900">
              ارسال درخواست کارآموزی
            </h2>

            {!session ? (
              <div className="rounded-xl bg-slate-50 p-5 text-center">
                <p className="mb-3 text-sm text-slate-600">
                  برای ارسال درخواست ابتدا وارد حساب دانشجویی خود شوید.
                </p>
                <Link
                  href={`/login?next=/internships/${internshipId}`}
                  className={btnPrimary}
                >
                  ورود به سامانه
                </Link>
              </div>
            ) : session.role !== "student" ? (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                فقط حساب‌های دانشجویی امکان ارسال درخواست دارند.
              </p>
            ) : myApplication ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-4">
                <div>
                  <div className="mb-1 text-sm font-bold text-slate-800">
                    درخواست شما ثبت شده است
                  </div>
                  <div className="text-xs text-slate-500">
                    وضعیت درخواست: <StatusBadge status={myApplication.status} />
                  </div>
                </div>
                <Link href="/student" className={btnSecondary}>
                  پیگیری در داشبورد من
                </Link>
              </div>
            ) : internship.status !== "active" || remaining <= 0 ? (
              <p className="rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-700">
                {internship.status !== "active"
                  ? "این فرصت بسته شده است و امکان ارسال درخواست وجود ندارد."
                  : "ظرفیت این موقعیت تکمیل شده است."}
              </p>
            ) : (
              <form action={applyAction} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    متن درخواست (اختیاری)
                  </label>
                  <textarea
                    name="coverLetter"
                    rows={5}
                    placeholder="کمی درباره مهارت‌ها، تجربه‌ها و انگیزه‌تان برای این موقعیت بنویسید..."
                    className={inputCls}
                  />
                </div>
                <button type="submit" className={btnPrimary}>
                  📨 ثبت درخواست کارآموزی
                </button>
              </form>
            )}
          </Card>
        </div>

        {/* ستون کناری — اطلاعات شرکت */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 text-2xl text-white">
                🏭
              </div>
              <div>
                <div className="font-extrabold text-slate-900">
                  {internship.company.name}
                </div>
                <div className="text-xs font-semibold text-slate-400">
                  {internship.company.industry || "شرکت / کارخانه"}
                </div>
              </div>
            </div>
            <dl className="space-y-3 text-sm">
              {[
                ["📍 آدرس", internship.company.address],
                ["📞 تماس", internship.company.contactPhone],
                ["🌐 وب‌سایت", internship.company.website],
                ["🏢 حوزه فعالیت", internship.company.industry],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <dt className="text-[11px] font-bold text-slate-400">{label}</dt>
                  <dd className="mt-0.5 font-semibold text-slate-700">
                    {(value as string) || "—"}
                  </dd>
                </div>
              ))}
            </dl>
            {internship.company.description && (
              <p className="mt-4 border-t border-slate-100 pt-4 text-xs leading-6 text-slate-500">
                {internship.company.description}
              </p>
            )}
          </Card>

          <Card className="p-6">
            <div className="mb-2 text-3xl font-black text-teal-700">
              {faDigits(remaining)}
              <span className="text-base font-bold text-slate-500">
                {" "}
                از {faDigits(internship.capacity)}
              </span>
            </div>
            <div className="mb-1 text-sm font-bold text-slate-700">
              ظرفیت باقی‌مانده
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-l from-teal-500 to-teal-700"
                style={{
                  width: `${(internship.applications.length / Math.max(1, internship.capacity)) * 100}%`,
                }}
              />
            </div>
            <div className="mt-2 text-xs text-slate-400">
              {faDigits(internship.applications.length)} نفر پذیرفته شده‌اند
            </div>
          </Card>

          <EmptyState
            icon="💡"
            title="نکته"
            description="پیش از ارسال درخواست، پروفایل و رزومه خود را در داشبورد دانشجویی تکمیل کنید تا شانس پذیرش افزایش یابد."
          />
        </div>
      </div>
    </div>
  );
}
