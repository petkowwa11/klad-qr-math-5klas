"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader, PageShell, StatusBlock } from "@/components/site-chrome";
import { LinkButton } from "@/components/link-button";
import { StationQr } from "@/components/station-qr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createEmptyStation,
  encodeHunt,
  ensureSeededHunts,
  getHunt,
  sortStations,
  stationUrl,
  type Hunt,
  type Station,
  upsertHunt,
} from "@/lib/hunt";
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  Eye,
  Plus,
  Printer,
  Save,
  Trash2,
} from "lucide-react";

export function HuntEditor({
  huntId,
  initialPreview = false,
}: {
  huntId: string;
  initialPreview?: boolean;
}) {
  const router = useRouter();
  const [hunt, setHunt] = useState<Hunt | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedFlash, setSavedFlash] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");
  const [tab, setTab] = useState<"edit" | "qr" | "preview">(
    initialPreview ? "preview" : "edit",
  );

  useEffect(() => {
    ensureSeededHunts();
    const found = getHunt(huntId);
    if (!found) {
      setError("Този лов не е намерен в този браузър.");
      setHunt(null);
    } else {
      setHunt(found);
    }
    setOrigin(window.location.origin);
    setLoading(false);
  }, [huntId]);

  const encoded = useMemo(() => (hunt ? encodeHunt(hunt) : ""), [hunt]);
  const stations = hunt ? sortStations(hunt.stations) : [];

  function updateHunt(patch: Partial<Hunt>) {
    setHunt((current) => (current ? { ...current, ...patch } : current));
  }

  function updateStation(id: string, patch: Partial<Station>) {
    setHunt((current) => {
      if (!current) return current;
      return {
        ...current,
        stations: current.stations.map((station) =>
          station.id === id ? { ...station, ...patch } : station,
        ),
      };
    });
  }

  function addStation() {
    setHunt((current) => {
      if (!current) return current;
      const nextOrder = current.stations.length;
      return {
        ...current,
        stations: [...current.stations, createEmptyStation(nextOrder)],
      };
    });
  }

  function removeStation(id: string) {
    setHunt((current) => {
      if (!current) return current;
      return {
        ...current,
        stations: sortStations(current.stations.filter((station) => station.id !== id)),
      };
    });
  }

  function moveStation(id: string, direction: -1 | 1) {
    setHunt((current) => {
      if (!current) return current;
      const ordered = sortStations(current.stations);
      const index = ordered.findIndex((station) => station.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= ordered.length) return current;
      const copy = [...ordered];
      const [item] = copy.splice(index, 1);
      copy.splice(target, 0, item);
      return { ...current, stations: sortStations(copy.map((s, i) => ({ ...s, order: i }))) };
    });
  }

  function save() {
    if (!hunt) return;
    if (!hunt.title.trim()) {
      setError("Въведи заглавие на лова.");
      return;
    }
    if (hunt.stations.length === 0) {
      setError("Добави поне една станция, преди да запазиш.");
      return;
    }
    const incomplete = hunt.stations.some((s) => !s.title.trim() || !s.task.trim());
    if (incomplete) {
      setError("Всяка станция трябва да има заглавие и задача.");
      return;
    }
    setError(null);
    upsertHunt(hunt);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1800);
  }

  if (loading) {
    return (
      <div className="min-h-svh">
        <AppHeader />
        <StatusBlock title="Зареждане…" description="Отваряме маршрута за редакция." />
      </div>
    );
  }

  if (!hunt) {
    return (
      <div className="min-h-svh">
        <AppHeader />
        <StatusBlock
          title="Ловът липсва"
          description={error ?? "Маршрутът не е запазен на това устройство."}
          action={
            <LinkButton href="/teacher">Към кабинета</LinkButton>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-svh">
      <AppHeader
        action={
          <Button size="sm" onClick={save}>
            <Save data-icon="inline-start" />
            {savedFlash ? "Запазено" : "Запази"}
          </Button>
        }
      />
      <PageShell>
        <div className="animate-fade-up no-print">
          <button
            type="button"
            onClick={() => router.push("/teacher")}
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            ← Всички ловни маршрути
          </button>
          <h1 className="mt-3 font-display text-3xl font-semibold text-forest sm:text-4xl">
            {hunt.title || "Нов лов"}
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Редактирай станциите, генерирай QR кодове и провери как изглежда урокът за ученика.
          </p>
        </div>

        {error ? (
          <div className="no-print mt-5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="no-print mt-8 flex flex-wrap gap-2 border-b border-border pb-3">
          {(
            [
              ["edit", "Станции"],
              ["qr", "QR лист"],
              ["preview", "Преглед за ученик"],
            ] as const
          ).map(([key, label]) => (
            <Button
              key={key}
              type="button"
              size="sm"
              variant={tab === key ? "default" : "ghost"}
              onClick={() => setTab(key)}
            >
              {label}
            </Button>
          ))}
        </div>

        {tab === "edit" ? (
          <div className="mt-8 space-y-8 animate-fade-up no-print">
            <section className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="title">Заглавие на лова</Label>
                <Input
                  id="title"
                  value={hunt.title}
                  onChange={(e) => updateHunt({ title: e.target.value })}
                  placeholder="Напр. Дроби в двореца"
                  className="h-11 bg-card"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="goal">Цел за класа</Label>
                <Textarea
                  id="goal"
                  value={hunt.goal}
                  onChange={(e) => updateHunt({ goal: e.target.value })}
                  placeholder="Какво упражняват учениците?"
                  className="min-h-24 bg-card"
                />
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-2xl font-semibold text-forest">
                  Станции
                </h2>
                <Button type="button" variant="outline" onClick={addStation}>
                  <Plus data-icon="inline-start" />
                  Добави станция
                </Button>
              </div>

              {stations.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-border bg-card/60 px-5 py-10 text-center">
                  <p className="font-display text-xl text-forest">Няма станции още</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Добави първата задача — тя ще стане станция №1 по маршрута.
                  </p>
                  <Button className="mt-5" type="button" onClick={addStation}>
                    Първа станция
                  </Button>
                </div>
              ) : (
                <ol className="mt-6 space-y-6">
                  {stations.map((station, index) => (
                    <li
                      key={station.id}
                      className="rounded-2xl border border-border bg-card/80 p-4 sm:p-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brass">
                          Станция {index + 1}
                        </p>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            aria-label="Нагоре"
                            onClick={() => moveStation(station.id, -1)}
                            disabled={index === 0}
                          >
                            <ArrowUp />
                          </Button>
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            aria-label="Надолу"
                            onClick={() => moveStation(station.id, 1)}
                            disabled={index === stations.length - 1}
                          >
                            <ArrowDown />
                          </Button>
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            aria-label="Изтрий станция"
                            onClick={() => removeStation(station.id)}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`st-title-${station.id}`}>Заглавие</Label>
                          <Input
                            id={`st-title-${station.id}`}
                            value={station.title}
                            onChange={(e) =>
                              updateStation(station.id, { title: e.target.value })
                            }
                            placeholder="Напр. Порталът на дробите"
                            className="bg-background"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`st-task-${station.id}`}>Задача</Label>
                          <Textarea
                            id={`st-task-${station.id}`}
                            value={station.task}
                            onChange={(e) =>
                              updateStation(station.id, { task: e.target.value })
                            }
                            placeholder="Текст на математическата задача"
                            className="min-h-28 bg-background"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`st-hint-${station.id}`}>
                            Подсказка (по желание)
                          </Label>
                          <Textarea
                            id={`st-hint-${station.id}`}
                            value={station.hint}
                            onChange={(e) =>
                              updateStation(station.id, { hint: e.target.value })
                            }
                            placeholder="Кратка помощ, която ученикът може да разкрие"
                            className="min-h-20 bg-background"
                          />
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>
        ) : null}

        {tab === "qr" ? (
          <div className="mt-8 animate-fade-up">
            <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-semibold text-forest">
                  QR лист за разпечатване
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Запази маршрута, после разпечатай или изтегли отделните кодове.
                </p>
              </div>
              <Button type="button" onClick={() => window.print()}>
                <Printer data-icon="inline-start" />
                Печат / PDF
              </Button>
            </div>

            {stations.length === 0 || !encoded ? (
              <StatusBlock
                title="Няма какво да се разпечата"
                description="Добави и запази станции с реални задачи, за да се появят QR кодовете."
              />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {stations.map((station, index) => {
                  const url = stationUrl(origin || "http://localhost", encoded, index);
                  return (
                    <article
                      key={station.id}
                      className="qr-print-sheet flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-5 text-center"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brass">
                        КЛАД · станция {index + 1}
                      </p>
                      <h3 className="font-display text-xl font-semibold text-forest">
                        {station.title || `Станция ${index + 1}`}
                      </h3>
                      <StationQr value={url} title={`${hunt.title}-${index + 1}`} />
                      <p className="break-all text-[11px] leading-relaxed text-muted-foreground">
                        {url}
                      </p>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}

        {tab === "preview" ? (
          <div className="mt-8 animate-fade-up no-print">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-semibold text-forest">
                  Преглед за ученик
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Отваря първата станция така, както я вижда класът след сканиране.
                </p>
              </div>
              {encoded && stations.length > 0 ? (
                <LinkButton
                  href={`/play?d=${encodeURIComponent(encoded)}&n=0`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink data-icon="inline-start" />
                  Отвори в нов раздел
                </LinkButton>
              ) : null}
            </div>

            {encoded && stations.length > 0 ? (
              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <div className="flex items-center gap-2 border-b border-border px-4 py-3 text-sm text-muted-foreground">
                  <Eye className="size-4 text-brass" />
                  Симулиран ученически екран
                </div>
                <iframe
                  title="Преглед за ученик"
                  src={`/play?d=${encodeURIComponent(encoded)}&n=0`}
                  className="h-[70vh] w-full bg-background"
                />
              </div>
            ) : (
              <StatusBlock
                title="Прегледът е празен"
                description="Добави станции и запази лова, за да видиш ученическия изглед."
              />
            )}
          </div>
        ) : null}
      </PageShell>
    </div>
  );
}
