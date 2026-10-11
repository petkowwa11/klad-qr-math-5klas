import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AppHeader, PageShell, StatusBlock } from "@/components/site-chrome";
import { LogoutButton } from "@/components/logout-button";
import { LinkButton } from "@/components/link-button";
import { requireStudent } from "@/lib/session";
import { prisma } from "@/lib/db";
import { curriculum, getCurriculumStats } from "@/lib/curriculum/catalog";

async function StudentPortalLoader() {
  const session = await requireStudent();
  if (!session?.studentId) {
    redirect("/login/student");
  }

  const student = await prisma.student.findUnique({
    where: { id: session.studentId },
    include: {
      classGroup: true,
      progress: true,
    },
  });
  if (!student) {
    redirect("/login/student");
  }

  const stats = getCurriculumStats();
  const correct = student.progress.filter((p) => p.status === "correct").length;
  const featured = curriculum.terms[0]?.units.find((u) => u.id === "u-frac")
    ?.lessons[2];

  return (
    <div className="min-h-svh">
      <AppHeader action={<LogoutButton />} />
      <PageShell>
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-brass">
          Ученически портал
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-forest sm:text-4xl">
          Здравей, {student.name}
        </h1>
        <p className="mt-3 text-muted-foreground">
          Клас 5{student.classGroup.parallel}, номер {student.classNumber}. Верни станции
          досега: {correct}. В каталога има {stats.lessons} урока и {stats.stations}{" "}
          станции.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <LinkButton href="/curriculum" className="h-11 px-5">
            Към учебната програма
          </LinkButton>
          {featured ? (
            <LinkButton
              href={`/curriculum/${featured.id}`}
              variant="outline"
              className="h-11 px-5"
            >
              Продължи: {featured.title}
            </LinkButton>
          ) : null}
        </div>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold text-forest">
            Последни станции
          </h2>
          {student.progress.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Още няма записан напредък. Отвори урок, избери ниво и започни от QR или от
              списъка със станции.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {student.progress
                .slice()
                .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
                .slice(0, 8)
                .map((row) => (
                  <li
                    key={row.id}
                    className="flex flex-wrap items-center justify-between gap-2 border-b border-border py-3 text-sm"
                  >
                    <span>
                      {row.lessonId} · {row.levelId} · станция {row.stationIndex + 1}
                    </span>
                    <span
                      className={
                        row.status === "correct"
                          ? "text-primary"
                          : row.status === "wrong"
                            ? "text-destructive"
                            : "text-muted-foreground"
                      }
                    >
                      {row.status === "correct"
                        ? "вярно"
                        : row.status === "wrong"
                          ? "грешно"
                          : "недовършено"}
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </section>
      </PageShell>
    </div>
  );
}

export default function StudentPortalPage() {
  return (
    <Suspense
      fallback={
        <StatusBlock
          title="Зареждане…"
          description="Отваряме ученическия портал."
        />
      }
    >
      <StudentPortalLoader />
    </Suspense>
  );
}
