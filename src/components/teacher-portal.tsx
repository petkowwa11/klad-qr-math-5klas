"use client";

import { AppHeader, PageShell, StatusBlock } from "@/components/site-chrome";
import { LogoutButton } from "@/components/logout-button";
import { LinkButton } from "@/components/link-button";
import type { StudentOverview } from "@/lib/teacher-dashboard-data";

export function TeacherPortal({
  teacherName,
  classLabels,
  students,
}: {
  teacherName: string;
  classLabels: string[];
  students: StudentOverview[];
}) {
  return (
    <div className="min-h-svh">
      <AppHeader action={<LogoutButton />} />
      <PageShell>
        <div className="animate-fade-up">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-brass">
            Учителски портал
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-forest sm:text-4xl">
            Здравей, {teacherName}
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Паралелки: {classLabels.join(", ")}. Тук виждаш напредъка и местата, където
            учениците грешат или не са завършили станции — за да знаеш къде да наблегнеш.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <LinkButton href="/curriculum" variant="outline">
              Учебна програма
            </LinkButton>
            <LinkButton href="/teacher" variant="outline">
              Собствени ловни
            </LinkButton>
          </div>
        </div>

        {students.length === 0 ? (
          <StatusBlock
            title="Няма ученици"
            description="За тази учителска сметка още няма записани ученици."
          />
        ) : (
          <ul className="mt-10 space-y-5 animate-fade-up-delay">
            {students.map((student) => (
              <li
                key={student.id}
                className="rounded-2xl border border-border bg-card/80 p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass">
                      {student.classLabel} · №{student.classNumber}
                    </p>
                    <h2 className="mt-1 font-display text-xl font-semibold text-forest">
                      {student.name}
                    </h2>
                  </div>
                  <dl className="flex flex-wrap gap-3 text-sm">
                    <div className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                      Верни {student.correctCount}
                    </div>
                    <div className="rounded-full bg-destructive/10 px-3 py-1 text-destructive">
                      Грешни {student.wrongCount}
                    </div>
                    <div className="rounded-full bg-secondary px-3 py-1 text-secondary-foreground">
                      Недовършени {student.incompleteCount}
                    </div>
                  </dl>
                </div>

                {student.gaps.length === 0 ? (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Няма записани пропуски — ученикът още не е започнал или няма грешки.
                  </p>
                ) : (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-foreground/80">
                      Къде да наблегнеш
                    </p>
                    <ul className="mt-2 space-y-2">
                      {student.gaps.map((gap) => (
                        <li
                          key={`${gap.lessonId}-${gap.levelId}-${gap.stationIndex}`}
                          className="text-sm text-muted-foreground"
                        >
                          <span className="font-medium text-foreground">
                            {gap.lessonTitle}
                          </span>
                          {" · "}
                          {gap.levelLabel}, станция {gap.stationIndex + 1}
                          {" — "}
                          {gap.status === "wrong"
                            ? `грешен отговор (${gap.wrongTries} опита)`
                            : "недовършена"}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </PageShell>
    </div>
  );
}
