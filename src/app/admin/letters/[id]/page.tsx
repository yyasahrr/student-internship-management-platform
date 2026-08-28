import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { apiFetch, type Letter } from "@/lib/server-api";
import PrintButton from "@/components/print-button";
import { faDate } from "@/lib/utils";

export const metadata: Metadata = { title: "معرفی‌نامه | کارآموزیار" };
export const dynamic = "force-dynamic";

export default async function LetterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole("admin");

  const { id } = await params;
  const letterId = Number(id);
  if (!Number.isFinite(letterId)) notFound();

  let letter: Letter;
  try { letter = await apiFetch<Letter>(`/internships/admin/letters/${letterId}/`, session); }
  catch { notFound(); }

  return (
    <div className="space-y-6 py-4">
      {/* نوار ابزار — در حالت چاپ مخفی می‌شود */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/placements"
          className="text-sm font-bold text-teal-700 hover:underline"
        >
          → بازگشت به پذیرش‌ها و نامه‌ها
        </Link>
        <div className="flex gap-2">
          <PrintButton />
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          >
            داشبورد مدیریت
          </Link>
        </div>
      </div>

      {/* برگه معرفی‌نامه */}
      <div className="letter-sheet mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
        {/* سربرگ */}
        <div className="mb-2 text-center">
          <div className="mb-1 text-lg font-black text-slate-900">بسمه تعالی</div>
          <div className="mx-auto mb-1 h-px w-24 bg-slate-300" />
        </div>

        <div className="mb-6 text-center">
          <div className="text-base font-black text-slate-900">{letter.university}</div>
          <div className="mt-1 text-sm font-bold text-slate-600">
            امور آموزش و ارتباط با صنعت
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4 text-xs font-semibold text-slate-500">
          <span>
            شماره نامه: <span className="font-black text-slate-800">{letter.serial_no}</span>
          </span>
          <span>
            تاریخ: <span className="font-black text-slate-800">{faDate(letter.issued_at)}</span>
          </span>
        </div>

        <div className="mb-6 text-center">
          <h1 className="inline-block rounded-full bg-slate-100 px-6 py-2 text-lg font-black text-slate-900">
            معرفی‌نامه کارآموزی
          </h1>
        </div>

        <div className="space-y-4 text-justify text-[15px] leading-9 text-slate-800">
          <p>
            <span className="font-black">گیرنده:</span> سرپرست محترم{" "}
            {letter.company_name ?? "—"}
          </p>
          <p>
            <span className="font-black">موضوع:</span> معرفی دانشجو جهت گذراندن
            دوره کارآموزی
          </p>
          <p>با سلام و احترام؛</p>
          <p>
            بدین‌وسیله{" "}
            <span className="font-black text-slate-900">
              {letter.student_name}
            </span>{" "}
            به شماره دانشجویی{" "}
            <span className="font-black text-slate-900">
              {letter.student_number ?? "—"}
            </span>
            {letter.student_major && (
              <>
                {" "}
                ، دانشجوی مقطع {letter.student_grade ?? "—"} رشته{" "}
                <span className="font-black text-slate-900">
                  {letter.student_major}
                </span>
              </>
            )}{" "}
            از {letter.university}، جهت گذراندن دوره کارآموزی با عنوان{" "}
            <span className="font-black text-slate-900">
              «{letter.internship_title}»
            </span>{" "}
            {letter.start_date && letter.end_date && (
              <>
                از تاریخ {faDate(letter.start_date)} لغایت {faDate(letter.end_date)}{" "}
              </>
            )}
            به آن {(letter.company_name ?? "").includes("کارخانه") ? "کارخانه" : "شرکت"} محترم
            معرفی می‌گردد.
          </p>
          <p>
            خواهشمند است دستور فرمایید همکاری لازم با ایشان به عمل آید و در
            پایان دوره، فرم ارزیابی عملکرد کارآموز به این دانشگاه ارسال شود. پیشاپیش
            از همکاری آن مجموعه محترم صمیمانه سپاسگزاریم.
          </p>
          <p>با تجدید احترام</p>
        </div>

        {/* امضاها */}
        <div className="mt-12 flex items-end justify-between text-center text-sm">
          <div className="w-40">
            <div className="mx-auto mb-1 h-14 w-32 rounded-lg border-2 border-dashed border-slate-300" />
            <div className="text-xs font-bold text-slate-500">مهر دانشگاه</div>
          </div>
          <div className="w-48">
            <div className="mb-1 h-10" />
            <div className="font-black text-slate-900">مدیر امور آموزش و ارتباط با صنعت</div>
            <div className="mt-1 border-t border-slate-300 pt-1 text-xs text-slate-400">
              امضای مدیر
            </div>
          </div>
        </div>

        {/* پانوشت */}
        <div className="mt-10 border-t border-dashed border-slate-200 pt-3 text-center text-[11px] text-slate-400">
          این معرفی‌نامه توسط سامانه کارآموزیار به‌صورت سیستمی صادر شده است ·
          شماره پیگیری: {letter.serial_no}
        </div>
      </div>
    </div>
  );
}
