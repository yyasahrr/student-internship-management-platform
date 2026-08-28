import { SignJWT, jwtVerify } from "jose";

export type Role = "student" | "company" | "admin";

export type Session = {
  userId: number;
  role: Role;
  name: string;
  email: string;
  accessToken?: string;
  refreshToken?: string;
};

export const SESSION_COOKIE = "karamoozyar_session";

const authSecret = process.env.AUTH_SECRET;
if (!authSecret && process.env.NODE_ENV === "production") {
  throw new Error("AUTH_SECRET is required in production");
}

const secret = new TextEncoder().encode(
  authSecret ?? "local-development-secret-change-me"
);

export async function signSessionToken(session: Session): Promise<string> {
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySessionToken(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (
      typeof payload.userId !== "number" ||
      typeof payload.role !== "string" ||
      typeof payload.name !== "string" ||
      typeof payload.email !== "string"
    ) {
      return null;
    }
    return {
      userId: payload.userId,
      role: payload.role as Role,
      name: payload.name,
      email: payload.email,
      accessToken:
        typeof payload.accessToken === "string" ? payload.accessToken : undefined,
      refreshToken:
        typeof payload.refreshToken === "string" ? payload.refreshToken : undefined,
    };
  } catch {
    return null;
  }
}
