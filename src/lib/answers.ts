/** Normalize student/teacher answers for loose Bulgarian math matching. */
export function normalizeAnswer(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[„“"']/g, "")
    .replace(/°/g, "")
    .replace(/лв\.?/g, "")
    .replace(/см²|см2|mm²|м²|dm²|см|mm|м|dm|л|kg|г/gi, "")
    .replace(/\s+/g, "")
    .replace(/,/g, ".")
    .replace(/÷/g, "/")
    .replace(/:/g, "/")
    .replace(/−/g, "-")
    .replace(/–/g, "-")
    .replace(/\.$/, "");
}

function numericEqual(a: string, b: string): boolean {
  const na = Number(a);
  const nb = Number(b);
  if (!Number.isFinite(na) || !Number.isFinite(nb)) return false;
  return Math.abs(na - nb) < 1e-9;
}

function fractionEqual(a: string, b: string): boolean {
  const parse = (s: string) => {
    const m = s.match(/^(-?\d+)\/(-?\d+)$/);
    if (!m) return null;
    const n = Number(m[1]);
    const d = Number(m[2]);
    if (!d) return null;
    return n / d;
  };
  const fa = parse(a);
  const fb = parse(b);
  if (fa === null || fb === null) return false;
  return Math.abs(fa - fb) < 1e-9;
}

/** True if student input matches any accepted answer (primary or variants). */
export function checkAnswer(
  input: string,
  accepted: string | string[] | undefined,
): boolean {
  if (!accepted) return false;
  const list = (Array.isArray(accepted) ? accepted : [accepted])
    .map((item) => item?.trim())
    .filter(Boolean) as string[];
  if (!input.trim() || list.length === 0) return false;

  const normInput = normalizeAnswer(input);
  return list.some((candidate) => {
    const norm = normalizeAnswer(candidate);
    if (!norm) return false;
    if (normInput === norm) return true;
    if (numericEqual(normInput, norm)) return true;
    if (fractionEqual(normInput, norm)) return true;
    // Allow "да" / "не" synonyms
    const yes = new Set(["да", "yes", "true", "1"]);
    const no = new Set(["не", "no", "false", "0"]);
    if (yes.has(norm) && yes.has(normInput)) return true;
    if (no.has(norm) && no.has(normInput)) return true;
    return false;
  });
}

export function acceptedList(
  answer?: string,
  answers?: string[],
): string[] {
  const list = [...(answers ?? [])];
  if (answer?.trim()) list.unshift(answer.trim());
  return [...new Set(list.map((item) => item.trim()).filter(Boolean))];
}
