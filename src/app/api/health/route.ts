export const dynamic = "force-dynamic";

export async function GET() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  try {
    const response = await fetch(`${apiUrl}/`, { cache: "no-store" });
    return Response.json({ ok: response.ok, backend: apiUrl }, { status: response.ok ? 200 : 503 });
  } catch {
    return Response.json({ ok: false, backend: apiUrl }, { status: 503 });
  }
}
