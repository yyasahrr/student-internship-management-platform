import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { students } from "@/db/schema";
import { updateStudentProfile } from "@/lib/actions/student-actions";
import { requireRole } from "@/lib/auth";
import { Card, Field, SectionTitle, btnPrimary, inputCls } from "@/components/ui";

export const metadata: Metadata = { title: "پروفایل و رزومه | کارآموزیار" };
export const dynamic = "force-dynamic";

export default async function StudentProfilePage() {
  const session = await requireRole("student");
  const student = await db.query.students.findFirst({
    where: eq(students.userId, session.userId),
  });

  const s = student ?? { skills: [] as string[] };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <SectionTitle
        title="پروفایل و رزومه من"
        subtitle="اطلاعات تحصیلی، مهارت‌ها و علاقه‌مندی‌های شما — این اطلاعات در بررسی درخواست‌ها توسط شرکت‌ها نمایش داده می‌شود"
      />

      <Card className="p-6 sm:p-8">
        <form action={updateStudentProfile} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="دانشگاه" required>
              <input
                name="university"
                required
                defaultValue={student?.university ?? ""}
                placeholder="مثلاً: دانشگاه صنعتی شریف"
                className={inputCls}
              />
            </Field>
            <Field label="رشته تحصیلی" required>
              <input
                name="major"
                required
                defaultValue={student?.major ?? ""}
                placeholder="مثلاً: مهندسی کامپیوتر"
                className={inputCls}
              />
            </Field>
            <Field label="مقطع تحصیلی">
              <select name="grade" defaultValue={student?.grade ?? "کارشناسی"} className={inputCls}>
                <option value="کارشناسی">کارشناسی</option>
                <option value="کارشناسی ارشد">کارشناسی ارشد</option>
                <option value="دکتری">دکتری</option>
              </select>
            </Field>
            <Field label="شماره دانشجویی" required>
              <input
                name="studentNumber"
                dir="ltr"
                required
                defaultValue={student?.studentNumber ?? ""}
                placeholder="مثلاً: 99120001"
                className={inputCls}
              />
            </Field>
            <Field label="معدل">
              <input
                name="gpa"
                dir="ltr"
                defaultValue={student?.gpa ?? ""}
                placeholder="مثلاً: 17.5"
                className={inputCls}
              />
            </Field>
            <Field label="لینک رزومه (فایل PDF)" hint="آدرس فایل رزومه خود را وارد کنید">
              <input
                name="resumeUrl"
                dir="ltr"
                defaultValue={student?.resumeUrl ?? ""}
                placeholder="https://..."
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="مهارت‌ها" hint="مهارت‌ها را با ویرگول جدا کنید، مثلاً: React، Node.js، SQL">
            <textarea
              name="skills"
              rows={3}
              defaultValue={s.skills?.join("، ")}
              className={inputCls}
            />
          </Field>

          <Field label="علاقه‌مندی‌ها">
            <input
              name="interests"
              defaultValue={student?.interests ?? ""}
              placeholder="مثلاً: توسعه فرانت‌اند، هوش مصنوعی..."
              className={inputCls}
            />
          </Field>

          <Field label="درباره من">
            <textarea
              name="about"
              rows={4}
              defaultValue={student?.about ?? ""}
              placeholder="چند جمله درباره خودتان، تجربه‌ها و اهداف‌تان بنویسید..."
              className={inputCls}
            />
          </Field>

          <button type="submit" className={btnPrimary}>
            💾 ذخیره پروفایل
          </button>
        </form>
      </Card>

      <Card className="p-5">
        <div className="text-sm font-bold text-slate-700">اطلاعات حساب کاربری</div>
        <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-3">
          <div>
            <span className="font-bold text-slate-400">نام: </span>
            {session.name}
          </div>
          <div dir="ltr" className="text-right">
            <span className="font-bold text-slate-400">ایمیل: </span>
            {session.email}
          </div>
          <div>
            <span className="font-bold text-slate-400">نقش: </span>
            دانشجو
          </div>
        </div>
      </Card>
    </div>
  );
}
