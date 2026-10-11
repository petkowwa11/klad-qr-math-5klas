import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export type SessionData = {
  role?: "teacher" | "student";
  teacherId?: string;
  studentId?: string;
  name?: string;
};

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET ?? "klad-thesis-demo-session-secret-change-me-32chars",
  cookieName: "klad_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function requireTeacher() {
  const session = await getSession();
  if (session.role !== "teacher" || !session.teacherId) {
    return null;
  }
  return session;
}

export async function requireStudent() {
  const session = await getSession();
  if (session.role !== "student" || !session.studentId) {
    return null;
  }
  return session;
}
