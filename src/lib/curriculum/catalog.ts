import catalogJson from "@/data/curriculum.json";
import {
  LEVEL_LABELS,
  LEVEL_ORDER,
  type CurriculumCatalog,
  type CurriculumStation,
  type Lesson,
  type LessonLevel,
  type LevelId,
  type Term,
  type Unit,
} from "@/lib/curriculum/types";
import type { ShareableHunt } from "@/lib/hunt";

export const curriculum = catalogJson as CurriculumCatalog;

export type LessonRef = {
  term: Term;
  unit: Unit;
  lesson: Lesson;
};

export function getCurriculumStats() {
  let lessons = 0;
  let levels = 0;
  let stations = 0;
  let units = 0;
  for (const term of curriculum.terms) {
    units += term.units.length;
    for (const unit of term.units) {
      for (const lesson of unit.lessons) {
        lessons += 1;
        for (const level of lesson.levels) {
          levels += 1;
          stations += level.stations.length;
        }
      }
    }
  }
  return {
    terms: curriculum.terms.length,
    units,
    lessons,
    levels,
    stations,
  };
}

export function findLesson(lessonId: string): LessonRef | null {
  for (const term of curriculum.terms) {
    for (const unit of term.units) {
      const lesson = unit.lessons.find((item) => item.id === lessonId);
      if (lesson) return { term, unit, lesson };
    }
  }
  return null;
}

export function getLevel(lesson: Lesson, levelId: string): LessonLevel | null {
  return lesson.levels.find((level) => level.id === levelId) ?? null;
}

export function isLevelId(value: string): value is LevelId {
  return LEVEL_ORDER.includes(value as LevelId);
}

export function levelToShareable(
  lesson: Lesson,
  level: LessonLevel,
): ShareableHunt {
  return {
    t: `${lesson.title} · ${level.label}`,
    g: lesson.summary,
    s: level.stations.map((station: CurriculumStation) => ({
      i: station.id,
      t: station.title,
      a: station.task,
      ...(station.hint ? { h: station.hint } : {}),
      ...(station.answer ? { r: station.answer } : {}),
      ...(station.answers?.length ? { v: station.answers } : {}),
    })),
  };
}

export function catalogPlayUrl(
  origin: string,
  lessonId: string,
  levelId: LevelId,
  index = 0,
): string {
  const url = new URL("/play", origin);
  url.searchParams.set("c", lessonId);
  url.searchParams.set("lv", levelId);
  url.searchParams.set("n", String(index));
  return url.toString();
}

export function resolvePlayPayload(params: {
  c?: string | null;
  lv?: string | null;
  d?: string | null;
}): ShareableHunt | null {
  const lessonId = params.c;
  const levelId = params.lv;
  if (lessonId && levelId && isLevelId(levelId)) {
    const ref = findLesson(lessonId);
    if (!ref) return null;
    const level = getLevel(ref.lesson, levelId);
    if (!level) return null;
    return levelToShareable(ref.lesson, level);
  }
  return null;
}

export { LEVEL_LABELS, LEVEL_ORDER };
