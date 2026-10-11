import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    grade?: number | string;
    parallel?: string;
    password?: string;
  };
  const grade = Number(body.grade);
  const parallel = (body.parallel ?? "").trim().toLowerCase();
  const password = (body.password ?? "").trim();

  if (grade !== 5 || !["а", "б", "в", "г"].includes(parallel) || !password) {
    return NextResponse.json(
      { error: "Избери клас, паралелка и номер в класа." },
      { status: 400 },
    );
  }

  const classGroup = await prisma.classGroup.findUnique({
    where: { grade_parallel: { grade, parallel } },
    include: { students: true },
  });
  if (!classGroup) {
    return NextResponse.json(
      { error: "Тази паралелка не е намерена." },
      { status: 404 },
    );
  }

  const classNumber = Number.parseInt(password, 10);
  const student = classGroup.students.find((s) => s.classNumber === classNumber);
  if (!student || !(await bcrypt.compare(password, student.passwordHash))) {
    return NextResponse.json(
      { error: "Грешен номер в класа." },
      { status: 401 },
    );
  }

  const session = await getSession();
  session.role = "student";
  session.studentId = student.id;
  session.teacherId = undefined;
  session.name = student.name;
  await session.save();

  return NextResponse.json({
    ok: true,
    name: student.name,
    classLabel: `5${parallel}`,
  });
}
