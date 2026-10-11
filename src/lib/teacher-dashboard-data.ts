import { curriculum } from "@/lib/curriculum/catalog";
import { prisma } from "@/lib/db";

export type StudentGap = {
  lessonId: string;
  lessonTitle: string;
  levelId: string;
  levelLabel: string;
  stationIndex: number;
  status: string;
  wrongTries: number;
};

export type StudentOverview = {
  id: string;
  name: string;
  classLabel: string;
  classNumber: number;
  correctCount: number;
  wrongCount: number;
  incompleteCount: number;
  gaps: StudentGap[];
};

function lessonTitle(lessonId: string): string {
  for (const term of curriculum.terms) {
    for (const unit of term.units) {
      const lesson = unit.lessons.find((item) => item.id === lessonId);
      if (lesson) return `Урок ${lesson.order}. ${lesson.title}`;
    }
  }
  return lessonId;
}

function levelLabel(levelId: string): string {
  if (levelId === "easy") return "Лесно";
  if (levelId === "medium") return "Средно";
  if (levelId === "hard") return "Трудно";
  return levelId;
}

export async function getTeacherPortalData(teacherId: string) {
  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
    include: {
      classes: {
        include: {
          students: {
            include: { progress: true },
            orderBy: { classNumber: "asc" },
          },
        },
        orderBy: { parallel: "asc" },
      },
    },
  });

  if (!teacher) return null;

  const students: StudentOverview[] = [];
  for (const cls of teacher.classes) {
    for (const student of cls.students) {
      const correct = student.progress.filter((p) => p.status === "correct");
      const wrong = student.progress.filter((p) => p.status === "wrong");
      const incomplete = student.progress.filter((p) => p.status === "incomplete");
      const gaps: StudentGap[] = [...wrong, ...incomplete]
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, 8)
        .map((row) => ({
          lessonId: row.lessonId,
          lessonTitle: lessonTitle(row.lessonId),
          levelId: row.levelId,
          levelLabel: levelLabel(row.levelId),
          stationIndex: row.stationIndex,
          status: row.status,
          wrongTries: row.wrongTries,
        }));

      students.push({
        id: student.id,
        name: student.name,
        classLabel: `${cls.grade}${cls.parallel}`,
        classNumber: student.classNumber,
        correctCount: correct.length,
        wrongCount: wrong.length,
        incompleteCount: incomplete.length,
        gaps,
      });
    }
  }

  return {
    teacher: { id: teacher.id, name: teacher.name, email: teacher.email },
    classLabels: teacher.classes.map((c) => `${c.grade}${c.parallel}`),
    students,
  };
}
