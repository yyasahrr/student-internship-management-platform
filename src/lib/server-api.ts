import { redirect } from "next/navigation";
import type { Session } from "@/lib/auth";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export type Paginated<T> = { results: T[]; count?: number };
export type NestedPaginated<T> = { results: T[] | NestedPaginated<T>; count?: number };

export function apiResults<T>(data: NestedPaginated<T>): T[] {
  let results: T[] | NestedPaginated<T> = data.results;
  while (!Array.isArray(results)) results = results.results;
  return results;
}

export async function apiFetch<T>(path: string, session?: Session, init: RequestInit = {}): Promise<T> {
  if (session && !session.accessToken) redirect("/login");
  const headers = new Headers(init.headers);
  if (session?.accessToken) headers.set("Authorization", `Bearer ${session.accessToken}`);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const response = await fetch(`${API_URL}${path}`, { ...init, headers, cache: "no-store" });
  if (response.status === 401 && session) redirect("/login");
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(data?.detail || `درخواست به بک‌اند ناموفق بود (${response.status}).`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export type ApiUser = { id: number; email: string; full_name: string; role: string; phone: string; city: string };
export type Company = {
  id: number; user: ApiUser; name: string; industry: string; description: string;
  address: string; website: string; contact_phone: string; license_number: string;
  status: string; is_approved: boolean; created_at: string;
};
export type Student = {
  id: number; user: ApiUser; university: string; major: string; grade: string;
  student_number: string; gpa: string; skills: string[]; interests: string;
  about: string; resume: string | null;
};
export type Internship = {
  id: number; company: Company; title: string; description: string; capacity: number;
  required_skills: string[]; city: string; major: string; start_date: string;
  end_date: string; conditions?: string; status: string; accepted_count: number;
  remaining_capacity: number; created_at: string;
};
export type Application = {
  id: number; internship: Internship; student: Student; status: string;
  cover_letter: string; created_at: string;
};
export type Letter = {
  id: number; application?: number; serial_no: string; university: string; student_name: string;
  student_number: string; student_major: string; student_grade: string;
  company_name: string; internship_title: string; start_date: string;
  end_date: string; issued_at: string;
};
