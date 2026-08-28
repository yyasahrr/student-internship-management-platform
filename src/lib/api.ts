/**
 * API Client for کارآموزیار Django Backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface LoginResponse {
  access: string;
  refresh: string;
}

interface User {
  id: number;
  email: string;
  full_name: string;
  role: "student" | "company" | "admin";
  phone?: string;
  city?: string;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("access_token");
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers);
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    if (this.token) {
      headers.set("Authorization", `Bearer ${this.token}`);
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Request failed" }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // ──── Auth ────
  async login(email: string, password: string): Promise<LoginResponse> {
    const data = await this.request<LoginResponse>("/auth/login/", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.access);
    if (typeof window !== "undefined") {
      localStorage.setItem("refresh_token", data.refresh);
    }
    return data;
  }

  async register(data: {
    email: string;
    username: string;
    full_name: string;
    password: string;
    password_confirm: string;
    role: "student" | "company";
    phone?: string;
    city?: string;
  }): Promise<User> {
    return this.request<User>("/auth/register/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getMe(): Promise<User> {
    return this.request<User>("/auth/me/");
  }

  logout() {
    this.clearToken();
  }

  // ──── Internships ────
  async getInternships(params?: { q?: string; city?: string; major?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.q) searchParams.set("q", params.q);
    if (params?.city) searchParams.set("city", params.city);
    if (params?.major) searchParams.set("major", params.major);

    const query = searchParams.toString();
    return this.request<any>(`/internships/${query ? `?${query}` : ""}`);
  }

  async getInternship(id: number) {
    return this.request<any>(`/internships/${id}/`);
  }

  async getStats() {
    return this.request<any>("/internships/stats/");
  }

  // ──── Student ────
  async getStudentProfile() {
    return this.request<any>("/accounts/student/profile/");
  }

  async updateStudentProfile(data: any) {
    return this.request<any>("/accounts/student/profile/", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async getMyApplications() {
    return this.request<any>("/internships/student/applications/");
  }

  async applyToInternship(internshipId: number, coverLetter?: string) {
    return this.request<any>(`/internships/student/apply/${internshipId}/`, {
      method: "POST",
      body: JSON.stringify({ cover_letter: coverLetter || "" }),
    });
  }

  async cancelApplication(applicationId: number) {
    return this.request<any>(`/internships/student/applications/${applicationId}/cancel/`, {
      method: "DELETE",
    });
  }

  // ──── Company ────
  async getCompanyProfile() {
    return this.request<any>("/accounts/company/profile/");
  }

  async updateCompanyProfile(data: any) {
    return this.request<any>("/accounts/company/profile/", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async getCompanyInternships() {
    return this.request<any>("/internships/company/");
  }

  async createInternship(data: any) {
    return this.request<any>("/internships/company/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getInternshipApplications(internshipId: number) {
    return this.request<any>(`/internships/company/${internshipId}/applications/`);
  }

  async reviewApplication(applicationId: number, status: "accepted" | "rejected") {
    return this.request<any>(`/internships/company/applications/${applicationId}/review/`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  // ──── Admin ────
  async getPendingCompanies() {
    return this.request<any>("/admin/companies/");
  }

  async approveCompany(companyId: number) {
    return this.request<any>(`/admin/companies/${companyId}/approve/`, {
      method: "POST",
    });
  }

  async rejectCompany(companyId: number) {
    return this.request<any>(`/admin/companies/${companyId}/reject/`, {
      method: "POST",
    });
  }

  async getPlacements() {
    return this.request<any>("/internships/admin/placements/");
  }

  async issueLetter(applicationId: number) {
    return this.request<any>(`/internships/admin/letters/issue/${applicationId}/`, {
      method: "POST",
    });
  }

  async getLetters() {
    return this.request<any>("/internships/admin/letters/");
  }
}

export const api = new ApiClient();
export type { User, LoginResponse };
