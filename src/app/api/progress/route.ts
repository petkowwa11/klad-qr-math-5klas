import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireStudent } from "@/lib/session";

export async function GET(request: Request) {
  const session = await requireStudent();
  if (!session?.studentId) {
    return NextResponse.json({ error: "Не си влязъл като ученик." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const lessonId = searchParams.get("lessonId") ?? undefined;
  const levelId = searchParams.get("levelId") ?? undefined;

  const rows = await prisma.stationProgress.findMany({
    where: {
      studentId: session.studentId,
      ...(lessonId ? { lessonId } : {}),
      ...(levelId ? { levelId } : {}),
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ progress: rows });
}

export async function POST(request: Request) {
  const session = await requireStudent();
  if (!session?.studentId) {
    return NextResponse.json({ error: "Не си влязъл като ученик." }, { status: 401 });
  }

  const body = (await request.json()) as {
    lessonId?: string;
    levelId?: string;
    stationIndex?: number;
    status?: "correct" | "wrong" | "incomplete";
    wrongTries?: number;
  };

  const lessonId = body.lessonId?.trim();
  const levelId = body.levelId?.trim();
  const stationIndex = body.stationIndex;
  const status = body.status;
  const wrongTries = body.wrongTries ?? 0;

  if (
    !lessonId ||
    !levelId ||
    stationIndex === undefined ||
    !Number.isFinite(stationIndex) ||
    !status
  ) {
    return NextResponse.json({ error: "Непълни данни за напредък." }, { status: 400 });
  }

  const row = await prisma.stationProgress.upsert({
    where: {
      studentId_lessonId_levelId_stationIndex: {
        studentId: session.studentId,
        lessonId,
        levelId,
        stationIndex,
      },
    },
    create: {
      studentId: session.studentId,
      lessonId,
      levelId,
      stationIndex,
      status,
      wrongTries,
    },
    update: {
      status,
      wrongTries,
    },
  });

  return NextResponse.json({ progress: row });
}
