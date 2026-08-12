import Link from "next/link";
import { getSession } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth-actions";
import { cn } from "@/components/ui";

const navLinkCls =
  "rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900";

export default async function Navbar() {
  const session = await getSession();

  const links: Array<{ href: string; label: string }> = [];
  if (!session) {
    links.push({ href: "/", label: "خانه" });
    links.push({ href: "/internships", label: "فرصت‌های کارآموزی" });
  } else if (session.role === "student") {
    links.push({ href: "/student", label: "داشبورد من" });
    links.push({ href: "/internships", label: "فرصت‌های کارآموزی" });
    links.push({ href: "/student/profile", label: "پروفایل و رزومه" });
  } else if (session.role === "company") {
    links.push({ href: "/company", label: "داشبورد شرکت" });
    links.push({ href: "/company/internships/new", label: "ثبت فرصت جدید" });
    links.push({ href: "/company/profile", label: "پروفایل شرکت" });
  } else {
    links.push({ href: "/admin", label: "داشبورد مدیریت" });
    links.push({ href: "/admin/companies", label: "بررسی شرکت‌ها" });
    links.push({ href: "/admin/placements", label: "پذیرش‌ها و نامه‌ها" });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        {/* لوگو */}
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 text-xl shadow-sm">
            🎓
          </span>
          <span className="leading-tight">
            <span className="block text-base font-black text-slate-900">
              کارآموزیار
            </span>
            <span className="hidden text-[11px] font-medium text-slate-500 sm:block">
              پل ارتباطی دانشجو و صنعت
            </span>
          </span>
        </Link>

        {/* ناوبری دسکتاپ */}
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={navLinkCls}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {session ? (
            <>
              <span className="hidden max-w-40 truncate rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 lg:block">
                {session.name}
              </span>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  خروج
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                ورود
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-teal-700 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
              >
                ثبت‌نام
              </Link>
            </>
          )}
        </div>

        {/* منوی موبایل */}
        <details className="group relative md:hidden">
          <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-lg border border-slate-300 text-slate-700">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </summary>
          <div className="absolute left-0 top-12 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn("block", navLinkCls)}
              >
                {l.label}
              </Link>
            ))}
            <div className="my-1 border-t border-slate-100" />
            {session ? (
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-rose-50 px-3 py-2 text-right text-sm font-semibold text-rose-700"
                >
                  خروج از حساب ({session.name})
                </button>
              </form>
            ) : (
              <div className="flex gap-2 pt-1">
                <Link
                  href="/login"
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-center text-sm font-semibold text-slate-700"
                >
                  ورود
                </Link>
                <Link
                  href="/register"
                  className="flex-1 rounded-lg bg-teal-700 px-3 py-2 text-center text-sm font-semibold text-white"
                >
                  ثبت‌نام
                </Link>
              </div>
            )}
          </div>
        </details>
      </div>
    </header>
  );
}
