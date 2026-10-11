"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BrandMark, StatusBlock } from "@/components/site-chrome";
import { LinkButton } from "@/components/link-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { checkAnswer } from "@/lib/answers";
import { resolvePlayPayload } from "@/lib/curriculum/catalog";
import {
  decodeHunt,
  loadProgress,
  markStationDone,
  MAX_WRONG_BEFORE_REVEAL,
  stationAcceptedAnswers,
  type ShareableHunt,
} from "@/lib/hunt";
import { CheckCircle2, ChevronRight, Lightbulb, MapPinned } from "lucide-react";

type AuthMe = {
  role: "teacher" | "student" | null;
  studentId?: string | null;
};

async function saveDbProgress(payload: {
  lessonId: string;
  levelId: string;
  stationIndex: number;
  status: "correct" | "wrong" | "incomplete";
  wrongTries: number;
}) {
  await fetch("/api/progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function StudentPlay() {
  const searchParams = useSearchParams();
  const [hunt, setHunt] = useState<ShareableHunt | null>(null);
  const [index, setIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hintOpen, setHintOpen] = useState(false);
  const [done, setDone] = useState<number[]>([]);
  const [answer, setAnswer] = useState("");
  const [wrongTries, setWrongTries] = useState(0);
  const [feedback, setFeedback] = useState<"idle" | "correct" | "wrong">("idle");
  const [revealed, setRevealed] = useState(false);
  const [authedStudent, setAuthedStudent] = useState(false);
  const previewMode = searchParams.get("preview") === "1";

  const encoded = searchParams.get("d") ?? "";
  const catalogId = searchParams.get("c") ?? "";
  const levelId = searchParams.get("lv") ?? "";
  const rawIndex = searchParams.get("n") ?? "0";

  const nextHref = useMemo(() => {
    const params = new URLSearchParams();
    if (catalogId && levelId) {
      params.set("c", catalogId);
      params.set("lv", levelId);
    } else if (encoded) {
      params.set("d", encoded);
    }
    if (previewMode) params.set("preview", "1");
    params.set("n", String(index + 1));
    return `/play?${params.toString()}`;
  }, [catalogId, encoded, index, levelId, previewMode]);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      setLoading(true);
      setHintOpen(false);
      setAnswer("");
      setWrongTries(0);
      setFeedback("idle");
      setRevealed(false);

      const meRes = await fetch("/api/auth/me");
      const me = (await meRes.json()) as AuthMe;
      const isStudent = me.role === "student" && Boolean(me.studentId);
      if (!cancelled) setAuthedStudent(isStudent);

      const fromCatalog = resolvePlayPayload({
        c: catalogId,
        lv: levelId,
        d: encoded,
      });
      const parsed = fromCatalog ?? (encoded ? decodeHunt(encoded) : null);
      const nextIndex = Number.parseInt(rawIndex, 10);
      if (!parsed) {
        if (!cancelled) {
          setHunt(null);
          setError("QR връзката е повредена или непълна. Попитай учителя за нов код.");
          setLoading(false);
        }
        return;
      }
      if (!Number.isFinite(nextIndex) || nextIndex < 0 || nextIndex >= parsed.s.length) {
        if (!cancelled) {
          setHunt(parsed);
          setError("Тази станция не съществува в маршрута.");
          setLoading(false);
        }
        return;
      }

      let doneIndexes = loadProgress(parsed.t);
      let stationWrong = 0;
      let alreadyCorrect = false;

      if (isStudent && catalogId && levelId) {
        const progRes = await fetch(
          `/api/progress?lessonId=${encodeURIComponent(catalogId)}&levelId=${encodeURIComponent(levelId)}`,
        );
        if (progRes.ok) {
          const data = (await progRes.json()) as {
            progress: Array<{
              stationIndex: number;
              status: string;
              wrongTries: number;
            }>;
          };
          doneIndexes = data.progress
            .filter((row) => row.status === "correct")
            .map((row) => row.stationIndex);
          const current = data.progress.find((row) => row.stationIndex === nextIndex);
          if (current) {
            stationWrong = current.wrongTries;
            alreadyCorrect = current.status === "correct";
          }
        }
      }

      if (!cancelled) {
        setHunt(parsed);
        setIndex(nextIndex);
        setDone(doneIndexes);
        setWrongTries(stationWrong);
        setFeedback(alreadyCorrect ? "correct" : "idle");
        setError(null);
        setLoading(false);
      }
    }
    void boot();
    return () => {
      cancelled = true;
    };
  }, [catalogId, encoded, levelId, rawIndex]);

  const station = hunt?.s[index];
  const accepted = station ? stationAcceptedAnswers(station) : [];
  const isLast = hunt ? index >= hunt.s.length - 1 : true;
  const completedHere = done.includes(index) || feedback === "correct";
  const canReveal = wrongTries >= MAX_WRONG_BEFORE_REVEAL || hintOpen;
  const progressLabel = useMemo(() => {
    if (!hunt) return "";
    const count = new Set([...done, ...(feedback === "correct" ? [index] : [])]).size;
    return `${count} / ${hunt.s.length} станции`;
  }, [done, feedback, hunt, index]);

  async function persist(
    status: "correct" | "wrong" | "incomplete",
    tries: number,
  ) {
    if (!authedStudent || !catalogId || !levelId) return;
    await saveDbProgress({
      lessonId: catalogId,
      levelId,
      stationIndex: index,
      status,
      wrongTries: tries,
    });
  }

  async function submitAnswer() {
    if (!hunt || !station) return;
    if (accepted.length === 0) {
      setFeedback("wrong");
      return;
    }
    if (checkAnswer(answer, accepted)) {
      setFeedback("correct");
      setDone(markStationDone(hunt.t, index));
      setRevealed(false);
      await persist("correct", wrongTries);
      return;
    }
    const nextWrong = wrongTries + 1;
    setFeedback("wrong");
    setWrongTries(nextWrong);
    await persist("wrong", nextWrong);
  }

  async function previewSkip() {
    if (!hunt || !previewMode) return;
    setFeedback("correct");
    setDone(markStationDone(hunt.t, index));
    await persist("correct", wrongTries);
  }

  if (loading) {
    return (
      <main className="min-h-svh px-4 py-10">
        <StatusBlock
          title="Отваряме станцията…"
          description="Зареждаме задачата от QR кода."
        />
      </main>
    );
  }

  if (error || !hunt || !station) {
    return (
      <main className="min-h-svh px-4 py-6">
        <BrandMark className="px-1" />
        <StatusBlock
          title="Станцията не се отвори"
          description={error ?? "Опитай отново със свеж QR код."}
          action={
            <LinkButton href="/portal/student" variant="outline">
              Към портала
            </LinkButton>
          }
        />
      </main>
    );
  }

  return (
    <main className="relative min-h-svh overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-56 klad-atmosphere opacity-90"
        aria-hidden="true"
      />
      <div className="relative mx-auto flex min-h-svh w-full max-w-lg flex-col px-4 pb-10 pt-5 sm:px-6">
        <div className="flex items-start justify-between gap-3 animate-fade-up">
          <BrandMark tone="light" className="text-parchment [&_span]:text-parchment" />
          <div className="rounded-full bg-parchment/15 px-3 py-1 text-xs font-medium text-parchment backdrop-blur">
            {progressLabel}
          </div>
        </div>

        <div className="mt-10 animate-fade-up-delay rounded-3xl border border-border bg-card/95 p-5 shadow-lg shadow-forest/10 sm:p-7">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brass">
            <MapPinned className="size-3.5" />
            Станция {index + 1} от {hunt.s.length}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{hunt.t}</p>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-forest">
            {station.t}
          </h1>

          <section className="mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-foreground/70">
              Задача
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-lg leading-relaxed text-ink">
              {station.a}
            </p>
          </section>

          {station.h ? (
            <section className="mt-6">
              {!hintOpen ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setHintOpen(true)}
                  className="w-full sm:w-auto"
                >
                  <Lightbulb data-icon="inline-start" />
                  Покажи подсказка
                </Button>
              ) : (
                <div className="animate-hint-reveal rounded-2xl border border-brass/35 bg-brass/10 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass">
                    Подсказка
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-foreground">{station.h}</p>
                </div>
              )}
            </section>
          ) : null}

          <section className="mt-8 space-y-3">
            {!completedHere ? (
              <>
                <label className="block text-sm font-semibold text-foreground/80" htmlFor="answer">
                  Твоят отговор
                </label>
                <Input
                  id="answer"
                  value={answer}
                  onChange={(e) => {
                    setAnswer(e.target.value);
                    if (feedback !== "idle") setFeedback("idle");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void submitAnswer();
                  }}
                  placeholder="Напр. 3/4 или 0,75"
                  className="h-12 bg-background text-base"
                  autoComplete="off"
                  inputMode="text"
                />
                <Button
                  type="button"
                  size="lg"
                  className="h-12 w-full text-base"
                  onClick={() => void submitAnswer()}
                  disabled={!answer.trim()}
                >
                  <CheckCircle2 data-icon="inline-start" />
                  Провери
                </Button>

                {feedback === "wrong" ? (
                  <div className="animate-hint-reveal rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    Още не — опитай пак. {wrongTries > 0 ? `(опит ${wrongTries})` : null}
                    {canReveal && accepted[0] ? (
                      <div className="mt-2">
                        {!revealed ? (
                          <button
                            type="button"
                            className="font-medium underline underline-offset-2"
                            onClick={() => setRevealed(true)}
                          >
                            Покажи верния отговор
                          </button>
                        ) : (
                          <p className="text-foreground">
                            Верен отговор: <span className="font-semibold">{accepted[0]}</span>
                          </p>
                        )}
                      </div>
                    ) : wrongTries > 0 && wrongTries < MAX_WRONG_BEFORE_REVEAL ? (
                      <p className="mt-1 text-destructive/80">
                        След {MAX_WRONG_BEFORE_REVEAL - wrongTries} грешни опита можеш да разкриеш
                        отговора.
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {previewMode ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full text-muted-foreground"
                    onClick={() => void previewSkip()}
                  >
                    Преглед: отбележи като решена
                  </Button>
                ) : null}
              </>
            ) : (
              <div className="animate-hint-reveal rounded-2xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm text-forest">
                Вярно! Съкровището на тази станция е твое.
                {isLast
                  ? " Стигна до края на маршрута."
                  : " Продължи към следващата станция."}
              </div>
            )}

            {completedHere && !isLast ? (
              <LinkButton
                href={nextHref}
                size="lg"
                variant="secondary"
                className="h-12 w-full text-base"
              >
                Към следващата станция
                <ChevronRight data-icon="inline-end" />
              </LinkButton>
            ) : null}

            {completedHere && isLast ? (
              <div className="rounded-2xl bg-forest px-4 py-5 text-center text-parchment">
                <p className="font-display text-2xl font-semibold">Съкровището е твое</p>
                <p className="mt-2 text-sm text-parchment/80">
                  Премина през всички станции от „{hunt.t}“.
                </p>
                <div className="mt-4">
                  <LinkButton
                    href="/portal/student"
                    variant="outline"
                    className="border-parchment/40 bg-transparent text-parchment hover:bg-parchment/10 hover:text-parchment"
                  >
                    Към портала
                  </LinkButton>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}
