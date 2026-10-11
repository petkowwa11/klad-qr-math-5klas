import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session.role) {
    return NextResponse.json({ role: null });
  }
  return NextResponse.json({
    role: session.role,
    name: session.name ?? null,
    teacherId: session.teacherId ?? null,
    studentId: session.studentId ?? null,
  });
}
