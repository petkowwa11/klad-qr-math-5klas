import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";

export type Station = {
  id: string;
  title: string;
  task: string;
  hint: string;
  order: number;
};

export type Hunt = {
  id: string;
  title: string;
  goal: string;
  stations: Station[];
  createdAt: string;
  updatedAt: string;
};

/** Compact payload embedded in student QR links. */
export type ShareableHunt = {
  t: string;
  g: string;
  s: Array<{
    i: string;
    t: string;
    a: string;
    h?: string;
  }>;
};

const STORAGE_KEY = "klad:hunts:v1";

export function createId(prefix = "id"): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function createEmptyHunt(): Hunt {
  const now = new Date().toISOString();
  return {
    id: createId("hunt"),
    title: "",
    goal: "Самостоятелна работа по математика за 5. клас",
    stations: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function createEmptyStation(order: number): Station {
  return {
    id: createId("st"),
    title: "",
    task: "",
    hint: "",
    order,
  };
}

export function sortStations(stations: Station[]): Station[] {
  return [...stations]
    .map((station, index) => ({ ...station, order: station.order ?? index }))
    .sort((a, b) => a.order - b.order)
    .map((station, index) => ({ ...station, order: index }));
}

export function loadHunts(): Hunt[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Hunt[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((hunt) => ({
      ...hunt,
      stations: sortStations(hunt.stations ?? []),
    }));
  } catch {
    return [];
  }
}

export function saveHunts(hunts: Hunt[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(hunts));
}

export function upsertHunt(hunt: Hunt): Hunt[] {
  const existing = loadHunts();
  const normalized: Hunt = {
    ...hunt,
    stations: sortStations(hunt.stations),
    updatedAt: new Date().toISOString(),
  };
  const next = existing.some((item) => item.id === normalized.id)
    ? existing.map((item) => (item.id === normalized.id ? normalized : item))
    : [normalized, ...existing];
  saveHunts(next);
  return next;
}

export function deleteHunt(id: string): Hunt[] {
  const next = loadHunts().filter((hunt) => hunt.id !== id);
  saveHunts(next);
  return next;
}

export function getHunt(id: string): Hunt | null {
  return loadHunts().find((hunt) => hunt.id === id) ?? null;
}

export function toShareable(hunt: Hunt): ShareableHunt {
  return {
    t: hunt.title.trim(),
    g: hunt.goal.trim(),
    s: sortStations(hunt.stations).map((station) => ({
      i: station.id,
      t: station.title.trim(),
      a: station.task.trim(),
      ...(station.hint.trim() ? { h: station.hint.trim() } : {}),
    })),
  };
}

export function encodeHunt(hunt: Hunt): string {
  return compressToEncodedURIComponent(JSON.stringify(toShareable(hunt)));
}

export function decodeHunt(encoded: string): ShareableHunt | null {
  try {
    const json = decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const parsed = JSON.parse(json) as ShareableHunt;
    if (!parsed?.t || !Array.isArray(parsed.s) || parsed.s.length === 0) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function stationUrl(origin: string, encoded: string, index: number): string {
  const url = new URL("/play", origin);
  url.searchParams.set("d", encoded);
  url.searchParams.set("n", String(index));
  return url.toString();
}

export function demoHunt(): Hunt {
  const now = new Date().toISOString();
  return {
    id: "demo_drobi",
    title: "Дроби в двореца",
    goal: "Учениците от 5. клас решават задачи с обикновени дроби и се движат самостоятелно между QR станциите.",
    createdAt: now,
    updatedAt: now,
    stations: [
      {
        id: "demo_1",
        title: "Порталът на дробите",
        task: "Пресметни: 1/2 + 1/4. Запиши отговора като обикновена дроб в най-прост вид.",
        hint: "Приведи дробите към общ знаменател 4: 2/4 + 1/4.",
        order: 0,
      },
      {
        id: "demo_2",
        title: "Мостът на пицата",
        task: "Пица е разделена на 8 равни парчета. Иван изял 3/8, а Мария – 2/8. Каква част от пицата са изяли заедно?",
        hint: "При еднакъв знаменател събери само числителите.",
        order: 1,
      },
      {
        id: "demo_3",
        title: "Кулата на сравняването",
        task: "Сравни дробите 3/5 и 2/3. Коя е по-голяма? Обясни с едно изречение.",
        hint: "Приведи към общ знаменател 15: 9/15 и 10/15.",
        order: 2,
      },
      {
        id: "demo_4",
        title: "Градината на смесените числа",
        task: "Запиши смесеното число 2 1/3 като неправилна дроб.",
        hint: "2 цели = 6/3. Добави 1/3.",
        order: 3,
      },
      {
        id: "demo_5",
        title: "Съкровищницата",
        task: "Представи 0,75 като обикновена дроб в най-прост вид. Напиши с едно изречение как провери резултата.",
        hint: "0,75 = 75/100. Съкрати на 25.",
        order: 4,
      },
    ],
  };
}

export function ensureSeededHunts(): Hunt[] {
  const hunts = loadHunts();
  if (hunts.some((hunt) => hunt.id === "demo_drobi")) {
    return hunts;
  }
  const seeded = [demoHunt(), ...hunts];
  saveHunts(seeded);
  return seeded;
}

export function progressKey(huntTitle: string): string {
  return `klad:progress:${huntTitle}`;
}

export function loadProgress(huntTitle: string): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(progressKey(huntTitle));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as number[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function markStationDone(huntTitle: string, index: number): number[] {
  const current = new Set(loadProgress(huntTitle));
  current.add(index);
  const next = [...current].sort((a, b) => a - b);
  window.localStorage.setItem(progressKey(huntTitle), JSON.stringify(next));
  return next;
}
