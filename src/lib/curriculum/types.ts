export type LevelId = "easy" | "medium" | "hard";

export type CurriculumStation = {
  id: string;
  title: string;
  task: string;
  hint: string;
};

export type LessonLevel = {
  id: LevelId;
  label: string;
  blurb: string;
  stations: CurriculumStation[];
};

export type Lesson = {
  id: string;
  order: number;
  title: string;
  summary: string;
  levels: LessonLevel[];
};

export type Unit = {
  id: string;
  title: string;
  summary: string;
  lessons: Lesson[];
};

export type Term = {
  id: string;
  title: string;
  summary: string;
  units: Unit[];
};

export type CurriculumCatalog = {
  version: number;
  grade: string;
  title: string;
  description: string;
  terms: Term[];
};

export const LEVEL_ORDER: LevelId[] = ["easy", "medium", "hard"];

export const LEVEL_LABELS: Record<LevelId, string> = {
  easy: "Лесно",
  medium: "Средно",
  hard: "Трудно",
};
