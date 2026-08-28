import Link from "next/link";
import type { Metadata } from "next";
import { Card, EmptyState, StatusBadge, inputCls } from "@/components/ui";
import { faDate, faDigits } from "@/lib/utils";

export const metadata: Metadata = {
  title: "فرصت‌های کارآموزی | کارآموزیار",
};
export const dynamic = "force-dynamic";

type Internship = {
  id: number; title: string; capacity: number; required_skills: string[];
  city: string; major: string; start_date: string; end_date: string;
  status: string; remaining_capacity: number; company: { name: string };
};
type InternshipResponse = {
  results: Internship[] | { results: Internship[]; filters?: Filters };
  filters?: Filters;
};
type Filters = { cities: string[]; majors: string[] };

export default async function InternshipsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; city?: string; major?: string }>;
}) {
  const { q, city, major } = await searchParams;
  const query = new URLSearchParams();
  if (q?.trim()) query.set("q", q.trim());
  if (city && city !== "all") query.set("city", city);
  if (major && major !== "all") query.set("major", major);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  const response = await fetch(`${apiUrl}/internships/?${query}`, { cache: "no-store" });
  if (!response.ok) throw new Error("دریافت فرصت‌های کارآموزی از بک‌اند ناموفق بود.");
  const data = (await response.json()) as InternshipResponse;
  const nested = Array.isArray(data.results) ? null : data.results;
  const rows = Array.isArray(data.results) ? data.results : data.results.results;
  const filters = data.filters ?? nested?.filters ?? { cities: [], majors: [] };
  const cities = [...new Set(filters.cities.filter(Boolean))];
  const majors = [...new Set(filters.majors.filter(Boolean))];

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
          {cities.map((cityName) => (
              <option key={cityName} value={cityName}>
                {cityName}
              </option>
            ))}
        </select>
        <select name="major" defaultValue={major ?? "all"} className={inputCls}>
          <option value="all">همه رشته‌ها</option>
          {majors.map((majorName) => (
              <option key={majorName} value={majorName}>
                {majorName}
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
            const remaining = i.remaining_capacity;
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
                      🗓️ {faDate(i.start_date)} تا {faDate(i.end_date)}
                    </span>
                  </div>
                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {(i.required_skills ?? []).map((s) => (
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
