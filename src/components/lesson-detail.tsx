"use client";

import { useEffect, useMemo, useState } from "react";
import { AppHeader, PageShell, StatusBlock } from "@/components/site-chrome";
import { LinkButton } from "@/components/link-button";
import { StationQr } from "@/components/station-qr";
import { Button } from "@/components/ui/button";
import {
  catalogPlayUrl,
  findLesson,
  getLevel,
  isLevelId,
  LEVEL_ORDER,
} from "@/lib/curriculum/catalog";
import type { LevelId } from "@/lib/curriculum/types";
import { ExternalLink, Printer } from "lucide-react";

export function LessonDetail({
  lessonId,
  initialLevel,
}: {
  lessonId: string;
  initialLevel?: string;
}) {
  const ref = useMemo(() => findLesson(lessonId), [lessonId]);
  const defaultLevel =
    initialLevel && isLevelId(initialLevel) ? initialLevel : "easy";
  const [levelId, setLevelId] = useState<LevelId>(defaultLevel);
  const [tab, setTab] = useState<"stations" | "qr">("stations");
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  if (!ref) {
    return (
      <div className="min-h-svh">
        <AppHeader />
        <StatusBlock
          title="Урокът не е намерен"
          description="Този урок липсва в каталога. Върни се към учебната програма."
          action={
            <LinkButton href="/curriculum">Към програмата</LinkButton>
          }
        />
      </div>
    );
  }

  const { term, unit, lesson } = ref;
  const level = getLevel(lesson, levelId);
  if (!level) {
    return (
      <div className="min-h-svh">
        <AppHeader />
        <StatusBlock
          title="Нивото липсва"
          description="Избери друго ниво за този урок."
          action={
            <LinkButton href={`/curriculum/${lesson.id}`}>Към урока</LinkButton>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-svh">
      <AppHeader
        action={
          <LinkButton
            href={catalogPlayUrl(origin || "http://127.0.0.1:3847", lesson.id, levelId, 0)}
            size="sm"
          >
            Старт за ученик
          </LinkButton>
        }
      />
      <PageShell>
        <div className="animate-fade-up no-print">
          <LinkButton href="/curriculum" variant="ghost" size="sm" className="px-0">
            ← Учебна програма
          </LinkButton>
          <p className="mt-3 text-sm text-muted-foreground">
            {term.title} · {unit.title}
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-forest sm:text-4xl">
            Урок {lesson.order}. {lesson.title}
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">{lesson.summary}</p>
        </div>

        <div className="no-print mt-8 grid gap-3 sm:grid-cols-3">
          {LEVEL_ORDER.map((id) => {
            const item = getLevel(lesson, id);
            if (!item) return null;
            const active = levelId === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setLevelId(id)}
                className={`rounded-2xl border px-4 py-4 text-left transition ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <p
                  className={`text-xs font-semibold uppercase tracking-[0.14em] ${
                    active ? "text-primary-foreground/80" : "text-brass"
                  }`}
                >
                  Ниво
                </p>
                <p className="mt-1 font-display text-xl font-semibold">
                  {item.label}
                </p>
                <p
                  className={`mt-2 text-sm ${
                    active ? "text-primary-foreground/85" : "text-muted-foreground"
                  }`}
                >
                  {item.blurb}
                </p>
                <p
                  className={`mt-3 text-xs ${
                    active ? "text-primary-foreground/75" : "text-foreground/65"
                  }`}
                >
                  {item.stations.length} станции
                </p>
              </button>
            );
          })}
        </div>

        <div
          className="no-print mt-8 flex flex-wrap items-center gap-2 border-b border-border pb-3"
          role="tablist"
          aria-label="Изгледи за урока"
        >
          {(
            [
              ["stations", "Станции"],
              ["qr", "QR лист"],
            ] as const
          ).map(([key, label]) => {
            const active = tab === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                className={`inline-flex h-8 items-center rounded-lg px-3 text-sm font-medium transition ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/80 hover:bg-muted"
                }`}
                onClick={() => setTab(key)}
              >
                {label}
              </button>
            );
          })}
          <LinkButton
            href={catalogPlayUrl(origin || "http://127.0.0.1:3847", lesson.id, levelId, 0)}
            size="sm"
            variant="outline"
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink data-icon="inline-start" />
            Преглед
          </LinkButton>
        </div>

        {tab === "stations" ? (
          <ol className="mt-8 space-y-4 animate-fade-up no-print">
            {level.stations.map((station, index) => (
              <li
                key={station.id}
                className="rounded-2xl border border-border bg-card/80 p-4 sm:p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass">
                  Станция {index + 1} · {level.label}
                </p>
                <h2 className="mt-2 font-display text-xl font-semibold text-forest">
                  {station.title}
                </h2>
                <p className="mt-3 whitespace-pre-wrap text-foreground">
                  {station.task}
                </p>
                {station.hint ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Подсказка: {station.hint}
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
        ) : (
          <div className="mt-8 animate-fade-up">
            <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-semibold text-forest">
                  QR лист · {level.label}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Кратки връзки към каталога — удобни за печат и сканиране.
                </p>
              </div>
              <Button type="button" onClick={() => window.print()}>
                <Printer data-icon="inline-start" />
                Печат / PDF
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {level.stations.map((station, index) => {
                const url = catalogPlayUrl(
                  origin || "http://127.0.0.1:3847",
                  lesson.id,
                  levelId,
                  index,
                );
                return (
                  <article
                    key={station.id}
                    className="qr-print-sheet flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-5 text-center"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brass">
                      КЛАД · урок {lesson.order} · {level.label}
                    </p>
                    <h3 className="font-display text-xl font-semibold text-forest">
                      {station.title}
                    </h3>
                    <StationQr
                      value={url}
                      title={`${lesson.id}-${levelId}-${index + 1}`}
                    />
                    <p className="break-all text-[11px] leading-relaxed text-muted-foreground">
                      {url}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </PageShell>
    </div>
  );
}
