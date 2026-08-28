import Link from "next/link";
import type { Metadata } from "next";
import { createInternship } from "@/lib/actions/company-actions";
import { requireRole } from "@/lib/auth";
import { apiFetch, type Company } from "@/lib/server-api";
import { Card, Field, SectionTitle, btnPrimary, inputCls } from "@/components/ui";

export const metadata: Metadata = { title: "ثبت فرصت جدید | کارآموزیار" };
export const dynamic = "force-dynamic";

const majorOptions = [
  "مهندسی کامپیوتر",
  "مهندسی برق",
  "مهندسی مکانیک",
  "مهندسی صنایع",
  "مهندسی عمران",
  "مهندسی شیمی",
  "مدیریت",
  "حسابداری",
  "معماری",
  "علوم کامپیوتر",
  "سایر رشته‌ها",
];

const cityOptions = [
  "تهران",
  "اصفهان",
  "مشهد",
  "شیراز",
  "تبریز",
  "کرج",
  "یزد",
  "اهواز",
  "قم",
  "ارومیه",
  "سایر شهرها",
];

export default async function NewInternshipPage() {
  const session = await requireRole("company");
  const company = await apiFetch<Company>("/accounts/company/profile/", session);

  if (!company.is_approved) {
    return (
      <div className="mx-auto max-w-xl py-10 text-center">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8">
          <div className="mb-3 text-4xl">⏳</div>
          <h1 className="mb-2 text-xl font-black text-amber-800">
            انتشار فرصت غیرفعال است
          </h1>
          <p className="mb-5 text-sm leading-6 text-amber-700">
            برای ثبت فرصت کارآموزی، ابتدا باید اعتبار شرکت شما توسط دانشگاه
            تأیید شود.
          </p>
          <Link href="/company" className={btnPrimary}>
            بازگشت به داشبورد
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <SectionTitle
        title="ثبت فرصت کارآموزی جدید"
        subtitle="عنوان، ظرفیت، مهارت‌های مورد نیاز، تاریخ‌ها و شرایط کاری موقعیت را مشخص کنید"
      />

      <Card className="p-6 sm:p-8">
        <form action={createInternship} className="space-y-5">
          <Field label="عنوان موقعیت" required>
            <input
              name="title"
              required
              placeholder="مثلاً: کارآموز توسعه فرانت‌اند (React)"
              className={inputCls}
            />
          </Field>

          <Field label="شرح موقعیت و وظایف" required>
            <textarea
              name="description"
              rows={5}
              required
              placeholder="شرح وظایف، خروجی‌های مورد انتظار و مسیر یادگیری کارآموز..."
              className={inputCls}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ظرفیت پذیرش" required>
              <input
                type="number"
                name="capacity"
                min={1}
                max={100}
                required
                defaultValue={2}
                dir="ltr"
                className={inputCls}
              />
            </Field>
            <Field label="شهر">
              <select name="city" defaultValue="تهران" className={inputCls}>
                {cityOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="رشته مرتبط">
              <select name="major" defaultValue="مهندسی کامپیوتر" className={inputCls}>
                {majorOptions.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="تاریخ شروع">
              <input type="date" name="startDate" className={inputCls} />
            </Field>
            <Field label="تاریخ پایان">
              <input type="date" name="endDate" className={inputCls} />
            </Field>
          </div>

          <Field label="مهارت‌های مورد نیاز" hint="با ویرگول جدا کنید، مثلاً: React، Git، SQL">
            <input
              name="requiredSkills"
              placeholder="React، TypeScript، Git"
              className={inputCls}
            />
          </Field>

          <Field label="شرایط کاری" hint="مثلاً: حضوری/دورکاری، ساعات کاری، کمکهزینه، بیمه، امکان جذب">
            <textarea
              name="conditions"
              rows={4}
              placeholder="حضوری (۳ روز در هفته)، کمکهزینه ماهانه، بیمه کارآموزی..."
              className={inputCls}
            />
          </Field>

          <div className="flex flex-wrap gap-3">
            <button type="submit" className={btnPrimary}>
              📢 انتشار فرصت کارآموزی
            </button>
            <Link
              href="/company"
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              انصراف
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
