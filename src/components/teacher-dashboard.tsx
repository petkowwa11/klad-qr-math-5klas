"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppHeader, PageShell, StatusBlock } from "@/components/site-chrome";
import { LinkButton } from "@/components/link-button";
import { Button } from "@/components/ui/button";
import {
  createEmptyHunt,
  deleteHunt,
  ensureSeededHunts,
  type Hunt,
  upsertHunt,
} from "@/lib/hunt";
import { MapPinned, Plus, Trash2 } from "lucide-react";

export function TeacherDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hunts, setHunts] = useState<Hunt[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    try {
      const seeded = ensureSeededHunts();
      setHunts(seeded);
      if (searchParams.get("demo") === "1") {
        router.replace("/teacher/demo_drobi");
      }
    } catch {
      setError("Неуспешно зареждане на локалните ловни маршрути.");
      setHunts([]);
    }
  }, [router, searchParams]);

  function createHunt() {
    startTransition(() => {
      const hunt = createEmptyHunt();
      hunt.title = "Нов лов на съкровища";
      upsertHunt(hunt);
      router.push(`/teacher/${hunt.id}`);
    });
  }

  function removeHunt(id: string) {
    if (id === "demo_drobi") {
      setError("Демо ловът остава като примерен маршрут. Можеш да го редактираш, но не и да го изтриеш.");
      return;
    }
    setHunts(deleteHunt(id));
  }

  return (
    <div className="min-h-svh">
      <AppHeader
        action={
          <Button onClick={createHunt} disabled={pending} size="sm">
            <Plus data-icon="inline-start" />
            Нов лов
          </Button>
        }
      />
      <PageShell>
        <div className="animate-fade-up">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-brass">
            Кабинет на учителя
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-forest sm:text-4xl">
            Твоите ловни маршрути
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Тук пазиш собствени ловни маршрути. За пълната учебна година (уроци, нива и
            готови станции) отвори програмата.
          </p>
          <div className="mt-5">
            <LinkButton href="/curriculum" variant="outline">
              Към учебната програма (5. клас)
            </LinkButton>
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {hunts === null ? (
          <StatusBlock
            title="Зареждане…"
            description="Четем запазените маршрути от този браузър."
          />
        ) : hunts.length === 0 ? (
          <StatusBlock
            title="Все още няма лов"
            description="Започни с демо маршрута „Дроби в двореца“ или създай нов празен лов."
            action={
              <>
                <Button onClick={createHunt}>Създай лов</Button>
                <LinkButton variant="outline" href="/teacher/demo_drobi">
                  Отвори демо
                </LinkButton>
              </>
            }
          />
        ) : (
          <ul className="mt-10 space-y-4 animate-fade-up-delay">
            {hunts.map((hunt) => (
              <li
                key={hunt.id}
                className="flex flex-col gap-4 border-b border-border/80 py-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-xl font-semibold text-forest">
                      {hunt.title || "Без заглавие"}
                    </h2>
                    {hunt.id === "demo_drobi" ? (
                      <span className="text-xs font-semibold uppercase tracking-wider text-brass">
                        Демо
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {hunt.goal || "Без описание"}
                  </p>
                  <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-foreground/70">
                    <MapPinned className="size-4 text-brass" />
                    {hunt.stations.length}{" "}
                    {hunt.stations.length === 1 ? "станция" : "станции"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <LinkButton href={`/teacher/${hunt.id}`}>Редактирай</LinkButton>
                  <LinkButton variant="outline" href={`/teacher/${hunt.id}?preview=1`}>
                    Преглед
                  </LinkButton>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Изтрий"
                    onClick={() => removeHunt(hunt.id)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </PageShell>
    </div>
  );
}
