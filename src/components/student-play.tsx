"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BrandMark, StatusBlock } from "@/components/site-chrome";
import { Button } from "@/components/ui/button";
import {
  decodeHunt,
  loadProgress,
  markStationDone,
  type ShareableHunt,
} from "@/lib/hunt";
import { CheckCircle2, ChevronRight, Lightbulb, MapPinned } from "lucide-react";

export function StudentPlay() {
  const searchParams = useSearchParams();
  const [hunt, setHunt] = useState<ShareableHunt | null>(null);
  const [index, setIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hintOpen, setHintOpen] = useState(false);
  const [done, setDone] = useState<number[]>([]);
  const [justCompleted, setJustCompleted] = useState(false);

  const encoded = searchParams.get("d") ?? "";
  const rawIndex = searchParams.get("n") ?? "0";

  useEffect(() => {
    setLoading(true);
    setHintOpen(false);
    setJustCompleted(false);
    const parsed = decodeHunt(encoded);
    const nextIndex = Number.parseInt(rawIndex, 10);
    if (!parsed) {
      setHunt(null);
      setError("QR връзката е повредена или непълна. Попитай учителя за нов код.");
      setLoading(false);
      return;
    }
    if (!Number.isFinite(nextIndex) || nextIndex < 0 || nextIndex >= parsed.s.length) {
      setHunt(parsed);
      setError("Тази станция не съществува в маршрута.");
      setLoading(false);
      return;
    }
    setHunt(parsed);
    setIndex(nextIndex);
    setDone(loadProgress(parsed.t));
    setError(null);
    setLoading(false);
  }, [encoded, rawIndex]);

  const station = hunt?.s[index];
  const isLast = hunt ? index >= hunt.s.length - 1 : true;
  const completedHere = done.includes(index);
  const progressLabel = useMemo(() => {
    if (!hunt) return "";
    return `${done.length} / ${hunt.s.length} станции`;
  }, [done.length, hunt]);

  function completeStation() {
    if (!hunt) return;
    const next = markStationDone(hunt.t, index);
    setDone(next);
    setJustCompleted(true);
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
            <Button render={<Link href="/" />} variant="outline">
              Към началото
            </Button>
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
            {!completedHere && !justCompleted ? (
              <Button type="button" size="lg" className="h-12 w-full text-base" onClick={completeStation}>
                <CheckCircle2 data-icon="inline-start" />
                Маркирай като решена
              </Button>
            ) : (
              <div className="animate-hint-reveal rounded-2xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm text-forest">
                Браво! Станцията е отбелязана.{" "}
                {isLast
                  ? "Стигна до съкровището на маршрута."
                  : "Продължи към следващата станция."}
              </div>
            )}

            {!isLast ? (
              <Button
                render={
                  <Link
                    href={`/play?d=${encodeURIComponent(encoded)}&n=${index + 1}`}
                  />
                }
                size="lg"
                variant="secondary"
                className="h-12 w-full text-base"
              >
                Към следващата станция
                <ChevronRight data-icon="inline-end" />
              </Button>
            ) : completedHere || justCompleted ? (
              <div className="rounded-2xl bg-forest px-4 py-5 text-center text-parchment">
                <p className="font-display text-2xl font-semibold">Съкровището е твое</p>
                <p className="mt-2 text-sm text-parchment/80">
                  Премина през всички станции от „{hunt.t}“. Покажи на учителя какво си решил.
                </p>
              </div>
            ) : null}
          </section>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground animate-fade-up-delay-2">
          Ако си на физическа станция — остави телефона и тръгни към следващия QR.
        </p>
      </div>
    </main>
  );
}
