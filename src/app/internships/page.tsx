import Link from "next/link";
import type { Metadata } from "next";
import { and, desc, eq, ilike, inArray, isNotNull, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { applications, companies, internships } from "@/db/schema";
import { Card, EmptyState, StatusBadge, inputCls } from "@/components/ui";
import { faDate, faDigits } from "@/lib/utils";

export const metadata: Metadata = {
  title: "فرصت‌های کارآموزی | کارآموزیار",
};
export const dynamic = "force-dynamic";

export default async function InternshipsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; city?: string; major?: string }>;
}) {
  const { q, city, major } = await searchParams;
  const q_ = q?.trim() ?? "";

  const conditions = [
    eq(internships.status, "active"),
    inArray(
      internships.companyId,
      db
        .select({ id: companies.id })
        .from(companies)
        .where(eq(companies.status, "approved"))
    ),
  ];

  if (q_) {
    conditions.push(
      or(
        ilike(internships.title, `%${q_}%`),
        ilike(sql`${internships.requiredSkills}::text`, `%${q_}%`),
        inArray(
          internships.companyId,
          db
            .select({ id: companies.id })
            .from(companies)
            .where(ilike(companies.name, `%${q_}%`))
        )
      )!
    );
  }
  if (city && city !== "all") conditions.push(eq(internships.city, city));
  if (major && major !== "all") conditions.push(eq(internships.major, major));

  const [rows, cities, majors] = await Promise.all([
    db.query.internships.findMany({
      where: and(...conditions),
      with: {
        company: true,
        applications: { where: eq(applications.status, "accepted") },
      },
      orderBy: [desc(internships.createdAt)],
      limit: 60,
    }),
    db
      .selectDistinct({ city: internships.city })
      .from(internships)
      .where(and(eq(internships.status, "active"), isNotNull(internships.city))),
    db
      .selectDistinct({ major: internships.major })
      .from(internships)
      .where(and(eq(internships.status, "active"), isNotNull(internships.major))),
  ]);

  return (
    <div className="py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900">فرصت‌های کارآموزی</h1>
        <p className="mt-1 text-sm text-slate-500">
          جستجو و فیلتر بر اساس شهر، رشته و نام شرکت
        </p>
      </div>

      {/* فیلترها — فرم GET ساده بدون نیاز به جاوااسکریپت */}
      <form
        method="GET"
        className="mb-8 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_auto_auto_auto]"
      >
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="🔍 جستجو در عنوان، مهارت‌ها یا نام شرکت..."
          className={inputCls}
        />
        <select name="city" defaultValue={city ?? "all"} className={inputCls}>
          <option value="all">همه شهرها</option>
          {cities
            .filter((c) => c.city)
            .map((c) => (
              <option key={c.city} value={c.city!}>
                {c.city}
              </option>
            ))}
        </select>
        <select name="major" defaultValue={major ?? "all"} className={inputCls}>
          <option value="all">همه رشته‌ها</option>
          {majors
            .filter((m) => m.major)
            .map((m) => (
              <option key={m.major} value={m.major!}>
                {m.major}
              </option>
            ))}
        </select>
        <button
          type="submit"
          className="rounded-xl bg-teal-700 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-teal-800"
        >
          اعمال فیلتر
        </button>
      </form>

      {rows.length === 0 ? (
        <EmptyState
          icon="🔎"
          title="فرصتی مطابق جستجوی شما یافت نشد"
          description="فیلترها را تغییر دهید یا عبارت دیگری را جستجو کنید."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((i) => {
            const remaining = Math.max(0, i.capacity - i.applications.length);
            return (
              <Link key={i.id} href={`/internships/${i.id}`} className="block">
                <Card className="flex h-full flex-col p-5 transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <StatusBadge status={i.status} />
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                      ✓ {i.company.name}
                    </span>
                  </div>
                  <h2 className="mb-1 text-lg font-extrabold text-slate-900">
                    {i.title}
                  </h2>
                  <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-slate-500">
                    <span>📍 {i.city}</span>
                    <span>🎓 {i.major}</span>
                    <span>
                      🗓️ {faDate(i.startDate)} تا {faDate(i.endDate)}
                    </span>
                  </div>
                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {(i.requiredSkills ?? []).map((s) => (
                      <span
                        key={s}
                        className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-xs font-bold text-slate-500">
                      ظرفیت کل: {faDigits(i.capacity)} نفر
                    </span>
                    <span
                      className={
                        remaining > 0
                          ? "text-xs font-bold text-emerald-600"
                          : "text-xs font-bold text-rose-600"
                      }
                    >
                      {remaining > 0
                        ? `${faDigits(remaining)} ظرفیت باقی‌مانده`
                        : "ظرفیت تکمیل شده"}
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
