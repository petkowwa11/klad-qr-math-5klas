import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Въведи имейл и парола." },
      { status: 400 },
    );
  }

  const teacher = await prisma.teacher.findUnique({ where: { email } });
  if (!teacher || !(await bcrypt.compare(password, teacher.passwordHash))) {
    return NextResponse.json(
      { error: "Грешен имейл или парола." },
      { status: 401 },
    );
  }

  const session = await getSession();
  session.role = "teacher";
  session.teacherId = teacher.id;
  session.studentId = undefined;
  session.name = teacher.name;
  await session.save();

  return NextResponse.json({ ok: true, name: teacher.name });
}
