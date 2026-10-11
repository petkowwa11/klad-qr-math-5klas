"use client";

import { useMemo, useState } from "react";
import { AppHeader, PageShell, StatusBlock } from "@/components/site-chrome";
import { LinkButton } from "@/components/link-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { curriculum, getCurriculumStats } from "@/lib/curriculum/catalog";
import { BookOpen, Layers3, MapPinned, Search } from "lucide-react";

export function CurriculumBrowser() {
  const stats = useMemo(() => getCurriculumStats(), []);
  const [query, setQuery] = useState("");
  const [openTerm, setOpenTerm] = useState(curriculum.terms[0]?.id ?? "");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return curriculum.terms;
    return curriculum.terms
      .map((term) => ({
        ...term,
        units: term.units
          .map((unit) => ({
            ...unit,
            lessons: unit.lessons.filter(
              (lesson) =>
                lesson.title.toLowerCase().includes(q) ||
                lesson.summary.toLowerCase().includes(q) ||
                unit.title.toLowerCase().includes(q),
            ),
          }))
          .filter((unit) => unit.lessons.length > 0),
      }))
      .filter((term) => term.units.length > 0);
  }, [query]);

  return (
    <div className="min-h-svh">
      <AppHeader
        action={
          <LinkButton href="/teacher" size="sm" variant="outline">
            Моите ловни
          </LinkButton>
        }
      />
      <PageShell>
        <div className="animate-fade-up">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-brass">
            Учебна година · {curriculum.grade}
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-forest sm:text-4xl">
            {curriculum.title}
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {curriculum.description} Избери урок, ниво и отпечатай QR станциите.
          </p>

          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Срокове", stats.terms],
              ["Теми", stats.units],
              ["Уроци", stats.lessons],
              ["Станции", stats.stations],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-border bg-card/80 px-4 py-3"
              >
                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-brass">
                  {label}
                </dt>
                <dd className="mt-1 font-display text-2xl font-semibold text-forest">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="relative mt-8 max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Търси урок — напр. дроби, проценти, периметър…"
              className="h-11 bg-card pl-10"
              aria-label="Търсене в учебната програма"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <StatusBlock
            title="Няма намерени уроци"
            description="Опитай друга дума — например „десетични“, „триъгълник“ или „НОД“."
            action={
              <Button type="button" variant="outline" onClick={() => setQuery("")}>
                Изчисти търсенето
              </Button>
            }
          />
        ) : (
          <div className="mt-10 space-y-4 animate-fade-up-delay">
            {filtered.map((term) => {
              const expanded = openTerm === term.id || Boolean(query.trim());
              const lessonCount = term.units.reduce(
                (n, unit) => n + unit.lessons.length,
                0,
              );
              return (
                <section
                  key={term.id}
                  className="overflow-hidden rounded-2xl border border-border bg-card/70"
                >
                  <button
                    type="button"
                    className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition hover:bg-muted/40"
                    onClick={() =>
                      setOpenTerm((current) =>
                        current === term.id ? "" : term.id,
                      )
                    }
                    aria-expanded={expanded}
                  >
                    <div>
                      <h2 className="font-display text-2xl font-semibold text-forest">
                        {term.title}
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {term.summary}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                      {lessonCount} урока
                    </span>
                  </button>

                  {expanded ? (
                    <div className="space-y-6 border-t border-border px-5 py-5">
                      {term.units.map((unit) => (
                        <div key={unit.id}>
                          <div className="flex items-start gap-2">
                            <Layers3 className="mt-1 size-4 text-brass" />
                            <div>
                              <h3 className="font-display text-lg font-semibold text-forest">
                                {unit.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {unit.summary}
                              </p>
                            </div>
                          </div>
                          <ul className="mt-4 space-y-2">
                            {unit.lessons.map((lesson) => (
                              <li
                                key={lesson.id}
                                className="flex flex-col gap-3 border-b border-border/70 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                              >
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass">
                                    Урок {lesson.order}
                                  </p>
                                  <p className="font-medium text-foreground">
                                    {lesson.title}
                                  </p>
                                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                    {lesson.summary}
                                  </p>
                                  <p className="mt-2 inline-flex flex-wrap items-center gap-3 text-xs text-foreground/70">
                                    <span className="inline-flex items-center gap-1">
                                      <BookOpen className="size-3.5 text-brass" />
                                      3 нива
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                      <MapPinned className="size-3.5 text-brass" />
                                      {lesson.levels.reduce(
                                        (n, level) => n + level.stations.length,
                                        0,
                                      )}{" "}
                                      станции
                                    </span>
                                  </p>
                                </div>
                                <LinkButton href={`/curriculum/${lesson.id}`}>
                                  Отвори урока
                                </LinkButton>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </section>
              );
            })}
          </div>
        )}
      </PageShell>
    </div>
  );
}
