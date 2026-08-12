import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { applications, companies, internships, students } from "@/db/schema";
import { Card, SectionTitle, StatCard, btnPrimary, btnSecondary, cn } from "@/components/ui";
import { faDigits, faDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const [
    [{ value: activeInternships }],
    [{ value: approvedCompanies }],
    [{ value: totalStudents }],
    [{ value: acceptedApplications }],
    featured,
  ] = await Promise.all([
    db.select({ value: count() }).from(internships).where(eq(internships.status, "active")),
    db.select({ value: count() }).from(companies).where(eq(companies.status, "approved")),
    db.select({ value: count() }).from(students),
    db.select({ value: count() }).from(applications).where(eq(applications.status, "accepted")),
    db.query.internships.findMany({
      where: eq(internships.status, "active"),
      with: { company: true },
      orderBy: [desc(internships.createdAt)],
      limit: 3,
    }),
  ]);

  return (
    <div className="-mx-4 space-y-16">
      {/* ------------------------------ Hero ------------------------------ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-800 via-teal-700 to-teal-600 px-4 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:28px_28px]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 py-16 md:grid-cols-2 md:py-24">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold ring-1 ring-white/20">
              🌉 سامانه ملی کارآموزی و ارتباط با صنعت
            </span>
            <h1 className="text-3xl font-black leading-[1.3] md:text-5xl md:leading-[1.3]">
              پل ارتباطی بین{" "}
              <span className="text-amber-300">دانشجویان</span> و{" "}
              <span className="text-amber-300">صنعت</span>
            </h1>
            <p className="max-w-xl text-sm leading-7 text-teal-50/90 md:text-base">
              کارآموزیار، سامانه یکپارچه کاریابی و کارآموزی است؛ شرکت‌ها و
              کارخانجات ظرفیت‌های کارآموزی خود را اعلام می‌کنند، دانشجویان بر
              اساس رشته و مهارت‌هایشان درخواست می‌دهند و دانشگاه به‌صورت سیستمی
              بر فرآیند نظارت می‌کند.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/internships" className={cn(btnPrimary, "!bg-white !text-teal-800 hover:!bg-teal-50")}>
                🔍 جستجوی فرصت‌های کارآموزی
              </Link>
              <Link href="/register" className={cn(btnSecondary, "!border-white/40 !bg-transparent !text-white hover:!bg-white/10")}>
                ثبت‌نام رایگان
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-white/10 blur-2xl" />
            <img
              src="https://images.pexels.com/photos/8199634/pexels-photo-8199634.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
              alt="دانشجویان در حال همکاری و کارآموزی"
              className="relative aspect-[16/10] w-full rounded-3xl object-cover shadow-2xl ring-4 ring-white/20"
            />
            <div className="absolute -bottom-5 -right-3 rounded-2xl bg-white px-4 py-3 text-slate-900 shadow-xl md:-right-6">
              <div className="text-lg font-black text-teal-700">
                {faDigits(activeInternships)}+
              </div>
              <div className="text-xs font-semibold text-slate-500">
                فرصت کارآموزی فعال
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------- آمار سامانه --------------------------- */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon="💼" label="فرصت کارآموزی فعال" value={faDigits(activeInternships)} />
        <StatCard icon="🏭" label="شرکت تأییدشده" value={faDigits(approvedCompanies)} accent="bg-sky-50 text-sky-700" />
        <StatCard icon="🎓" label="دانشجوی ثبت‌نامی" value={faDigits(totalStudents)} accent="bg-violet-50 text-violet-700" />
        <StatCard icon="✅" label="پذیرش موفق" value={faDigits(acceptedApplications)} accent="bg-amber-50 text-amber-700" />
      </section>

      {/* ------------------------- فرآیند کار سامانه ------------------------- */}
      <section>
        <SectionTitle
          title="سامانه چگونه کار می‌کند؟"
          subtitle="سه گام ساده برای اتصال استعدادهای دانشگاهی به نیاز صنعت"
        />
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              icon: "🏭",
              step: "گام اول",
              title: "شرکت‌ها ظرفیت اعلام می‌کنند",
              desc: "شرکت‌ها و کارخانجات پس از تأیید اعتبار توسط دانشگاه، موقعیت‌های کارآموزی را با عنوان، ظرفیت، مهارت‌های مورد نیاز و شرایط کاری ثبت می‌کنند.",
            },
            {
              icon: "🧑‍🎓",
              step: "گام دوم",
              title: "دانشجویان درخواست می‌دهند",
              desc: "دانشجویان بر اساس شهر، رشته و نام شرکت جستجو می‌کنند، رزومه و مهارت‌هایشان را تکمیل می‌کنند و برای موقعیت‌های فعال درخواست ارسال می‌کنند.",
            },
            {
              icon: "📜",
              step: "گام سوم",
              title: "پذیرش و صدور معرفی‌نامه",
              desc: "شرکت متقاضیان را بررسی و تأیید یا رد می‌کند و دانشگاه به‌صورت سیستمی معرفی‌نامه رسمی برای پذیرش‌شدگان صادر و چاپ می‌کند.",
            },
          ].map((s) => (
            <Card key={s.step} className="relative p-6">
              <div className="absolute left-5 top-5 text-xs font-black text-teal-600/60">
                {s.step}
              </div>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-3xl">
                {s.icon}
              </div>
              <h3 className="mb-2 text-lg font-extrabold text-slate-900">{s.title}</h3>
              <p className="text-sm leading-6 text-slate-500">{s.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ------------------------ نقش‌های سامانه ------------------------ */}
      <section>
        <SectionTitle
          title="برای هر نقش، یک ورودی اختصاصی"
          subtitle="سه نقش اصلی با سطوح دسترسی کاملاً تفکیک‌شده"
        />
        <div className="grid gap-5 md:grid-cols-3">
          <Card className="border-t-4 border-t-teal-600 p-6">
            <div className="mb-3 text-3xl">🎓</div>
            <h3 className="mb-1 text-lg font-extrabold">دانشجویان</h3>
            <p className="mb-4 text-sm leading-6 text-slate-500">
              ثبت اطلاعات تحصیلی، رزومه و مهارت‌ها، جستجوی هوشمند فرصت‌ها و
              پیگیری وضعیت درخواست‌ها از موبایل.
            </p>
            <Link href="/register?role=student" className="text-sm font-bold text-teal-700 hover:underline">
              ثبت‌نام دانشجو ←
            </Link>
          </Card>
          <Card className="border-t-4 border-t-sky-600 p-6">
            <div className="mb-3 text-3xl">🏭</div>
            <h3 className="mb-1 text-lg font-extrabold">شرکت‌ها و کارخانجات</h3>
            <p className="mb-4 text-sm leading-6 text-slate-500">
              ثبت اطلاعات هویتی شرکت، انتشار فرصت‌های کارآموزی و مدیریت
              متقاضیان با تأیید یا رد درخواست‌ها.
            </p>
            <Link href="/register?role=company" className="text-sm font-bold text-sky-700 hover:underline">
              ثبت‌نام شرکت ←
            </Link>
          </Card>
          <Card className="border-t-4 border-t-amber-500 p-6">
            <div className="mb-3 text-3xl">🏛️</div>
            <h3 className="mb-1 text-lg font-extrabold">دانشگاه (مدیر سیستم)</h3>
            <p className="mb-4 text-sm leading-6 text-slate-500">
              تأیید اعتبار شرکت‌ها، پایش وضعیت کارآموزی دانشجویان و صدور و چاپ
              سیستمی معرفی‌نامه‌ها.
            </p>
            <Link href="/admin" className="text-sm font-bold text-amber-600 hover:underline">
              ورود مدیران ←
            </Link>
          </Card>
        </div>
      </section>

      {/* ---------------------- جدیدترین فرصت‌ها ---------------------- */}
      <section>
        <SectionTitle
          title="جدیدترین فرصت‌های کارآموزی"
          subtitle="نمونه‌ای از موقعیت‌های ثبت‌شده توسط شرکت‌های تأییدشده"
          action={
            <Link href="/internships" className={btnSecondary}>
              مشاهده همه فرصت‌ها
            </Link>
          }
        />
        <div className="grid gap-5 md:grid-cols-3">
          {featured.map((i) => (
            <Link key={i.id} href={`/internships/${i.id}`}>
              <Card className="h-full p-5 transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-700">
                    ✓ {i.company.name}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {i.city}
                  </span>
                </div>
                <h3 className="mb-1 text-base font-extrabold text-slate-900">
                  {i.title}
                </h3>
                <div className="mb-3 text-xs text-slate-500">
                  {i.major} · ظرفیت {faDigits(i.capacity)} نفر
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(i.requiredSkills ?? []).slice(0, 3).map((s) => (
                    <span
                      key={s}
                      className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <div className="mt-4 border-t border-slate-100 pt-3 text-[11px] font-medium text-slate-400">
                  شروع: {faDate(i.startDate)}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* ------------------------------ CTA ------------------------------ */}
      <section className="rounded-3xl bg-gradient-to-l from-teal-700 to-teal-800 px-6 py-10 text-center text-white">
        <h2 className="mb-3 text-2xl font-black md:text-3xl">
          آماده‌اید مسیر کارآموزی‌تان را شروع کنید؟
        </h2>
        <p className="mx-auto mb-6 max-w-xl text-sm text-teal-100">
          چه دانشجو باشید و چه نماینده شرکت، در کمتر از دو دقیقه حساب کاربری
          خود را بسازید و به شبکه کارآموزیار بپیوندید.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/register" className={cn(btnPrimary, "!bg-white !text-teal-800 hover:!bg-teal-50")}>
            ساخت حساب کاربری
          </Link>
          <Link href="/login" className={cn(btnSecondary, "!border-white/40 !bg-transparent !text-white hover:!bg-white/10")}>
            ورود به سامانه
          </Link>
        </div>
      </section>
    </div>
  );
}
