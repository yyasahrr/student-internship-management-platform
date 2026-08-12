import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { companies } from "@/db/schema";
import { updateCompanyProfile } from "@/lib/actions/company-actions";
import { requireRole } from "@/lib/auth";
import { Card, Field, SectionTitle, StatusBadge, btnPrimary, inputCls } from "@/components/ui";

export const metadata: Metadata = { title: "پروفایل شرکت | کارآموزیار" };
export const dynamic = "force-dynamic";

export default async function CompanyProfilePage() {
  const session = await requireRole("company");
  const company = await db.query.companies.findFirst({
    where: eq(companies.userId, session.userId),
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <SectionTitle
        title="پروفایل شرکت"
        subtitle="اطلاعات هویتی، حوزه فعالیت، آدرس و اطلاعات تماس — این اطلاعات پس از تأیید برای دانشجویان قابل مشاهده است"
      />

      <Card className="p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between rounded-xl bg-slate-50 p-4">
          <span className="text-sm font-bold text-slate-700">وضعیت تأیید اعتبار:</span>
          <StatusBadge status={company?.status ?? "pending"} />
        </div>

        <form action={updateCompanyProfile} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="نام شرکت / کارخانه" required>
              <input
                name="name"
                required
                defaultValue={company?.name ?? ""}
                className={inputCls}
              />
            </Field>
            <Field label="حوزه فعالیت" required>
              <input
                name="industry"
                required
                defaultValue={company?.industry ?? ""}
                placeholder="مثلاً: فناوری اطلاعات، فولاد، انرژی"
                className={inputCls}
              />
            </Field>
            <Field label="شناسه صنعتی / مجوز فعالیت" required>
              <input
                name="licenseNumber"
                dir="ltr"
                required
                defaultValue={company?.licenseNumber ?? ""}
                className={inputCls}
              />
            </Field>
            <Field label="شماره تماس شرکت">
              <input
                name="contactPhone"
                dir="ltr"
                defaultValue={company?.contactPhone ?? ""}
                className={inputCls}
              />
            </Field>
            <Field label="آدرس">
              <input
                name="address"
                defaultValue={company?.address ?? ""}
                className={inputCls}
              />
            </Field>
            <Field label="وب‌سایت">
              <input
                name="website"
                dir="ltr"
                defaultValue={company?.website ?? ""}
                placeholder="https://..."
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="معرفی شرکت">
            <textarea
              name="description"
              rows={5}
              defaultValue={company?.description ?? ""}
              placeholder="درباره شرکت، محصولات و خدمات خود بنویسید..."
              className={inputCls}
            />
          </Field>

          <button type="submit" className={btnPrimary}>
            💾 ذخیره پروفایل شرکت
          </button>
        </form>
      </Card>
    </div>
  );
}
