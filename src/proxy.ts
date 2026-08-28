import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/jwt";

const rolePaths: Array<{ prefix: string; role: "student" | "company" | "admin" }> = [
  { prefix: "/student", role: "student" },
  { prefix: "/company", role: "company" },
  { prefix: "/admin", role: "admin" },
];

function dashboardForRole(role: string) {
  return role === "admin" ? "/admin" : role === "company" ? "/company" : "/student";
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  for (const { prefix, role } of rolePaths) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      if (!session) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(loginUrl);
      }
      if (session.role !== role) {
        return NextResponse.redirect(
          new URL(dashboardForRole(session.role), req.url)
        );
      }
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/student/:path*", "/company/:path*", "/admin/:path*"],
};
