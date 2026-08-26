import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { COOKIE_NAME } from "@/lib/auth-constants";
import { queryOne } from "@/lib/db";
import type { Profile } from "@/types/database";

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("Missing AUTH_SECRET");
  }
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export async function createAdminSession(profile: Profile): Promise<void> {
  const token = await new SignJWT({
    sub: profile.id,
    email: profile.email,
    role: profile.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getAdminSession(): Promise<{
  id: string;
  email: string;
  role: string;
} | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      payload.role !== "admin"
    ) {
      return null;
    }
    return {
      id: payload.sub,
      email: payload.email,
      role: "admin",
    };
  } catch {
    return null;
  }
}

export async function findAdminByEmail(
  email: string
): Promise<(Profile & { password_hash: string }) | null> {
  return queryOne<Profile & { password_hash: string }>(
    `select * from profiles where lower(email) = lower($1) and role = 'admin' limit 1`,
    [email.trim()]
  );
}
