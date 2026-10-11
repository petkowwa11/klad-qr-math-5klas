/**
 * Generates a full-year Bulgarian 5. клас math curriculum catalog for КЛАД.
 * Run: node scripts/generate-curriculum.mjs
 */
import { writeFileSync, mkdirSync } from "fs";
import path from "path";

const STATION_NAMES = [
  "Порталът",
  "Мостът",
  "Кулата",
  "Градината",
  "Кладенецът",
  "Съкровищницата",
];

const LEVEL_META = {
  easy: { label: "Лесно", blurb: "Загрявка — основни умения от урока." },
  medium: { label: "Средно", blurb: "Самостоятелна практика с типични задачи." },
  hard: { label: "Трудно", blurb: "Предизвикателство и комбинирани ситуации." },
};

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

function simplify(n, d) {
  const g = gcd(n, d);
  return [n / g, d / g];
}

function station(lessonId, level, index, task, hint, answer, answers) {
  const payload = {
    id: `${lessonId}-${level}-${index + 1}`,
    title: `${STATION_NAMES[index % STATION_NAMES.length]} · станция ${index + 1}`,
    task,
    hint,
    answer: String(answer ?? "").trim(),
  };
  if (answers?.length) payload.answers = answers.map(String);
  return payload;
}

function pack(lessonId, builders) {
  return ["easy", "medium", "hard"].map((level) => {
    const items = builders[level]();
    return {
      id: level,
      label: LEVEL_META[level].label,
      blurb: LEVEL_META[level].blurb,
      stations: items.map((item, i) => {
        if (item.answer === undefined || item.answer === null || String(item.answer).trim() === "") {
          throw new Error(`Missing answer for ${lessonId}/${level}/#${i + 1}: ${item.task}`);
        }
        return station(lessonId, level, i, item.task, item.hint, item.answer, item.answers);
      }),
    };
  });
}

/** Deterministic pseudo-random from seed */
function rng(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function pick(r, arr) {
  return arr[Math.floor(r() * arr.length)];
}

function irand(r, min, max) {
  return min + Math.floor(r() * (max - min + 1));
}

// --- Topic builders ---

function fracStr(n, d) {
  const [sn, sd] = simplify(n, d);
  return `${sn}/${sd}`;
}

function naturalOps(lessonId, seed) {
  const r = rng(seed);
  return pack(lessonId, {
    easy: () =>
      Array.from({ length: 5 }, () => {
        const a = irand(r, 120, 480);
        const b = irand(r, 35, 199);
        const op = pick(r, ["+", "-"]);
        const ans = op === "+" ? a + b : a - b;
        return {
          task: `Пресметни: ${a} ${op} ${b}.`,
          hint: op === "+" ? `Събери внимателно: ${a} + ${b} = ${ans}.` : `Извади: ${a} − ${b} = ${ans}.`,
          answer: String(ans),
        };
      }),
    medium: () =>
      Array.from({ length: 5 }, () => {
        const a = irand(r, 12, 48);
        const b = irand(r, 6, 24);
        const c = irand(r, 3, 15);
        const ans = a * b + c;
        return {
          task: `Пресметни: ${a} × ${b} + ${c}.`,
          hint: `Първо умножението: ${a}×${b}=${a * b}, после +${c}.`,
          answer: String(ans),
        };
      }),
    hard: () =>
      Array.from({ length: 5 }, () => {
        const a = irand(r, 200, 900);
        const b = irand(r, 4, 12);
        const q = Math.floor(a / b);
        const rem = a % b;
        return {
          task: `В касата има ${a} лв. Разпредели ги поравно между ${b} класа и остатъкът остави за награди. Колко получава всеки клас и колко остава?`,
          hint: `${a} ÷ ${b} = ${q} с остатък ${rem}.`,
          answer: `${q} остатък ${rem}`,
          answers: [`${q} ост. ${rem}`, `${q};${rem}`, `${q},${rem}`, `${q} ${rem}`],
        };
      }),
  });
}

function properties(lessonId, seed) {
  const r = rng(seed);
  return pack(lessonId, {
    easy: () =>
      Array.from({ length: 5 }, () => {
        const a = irand(r, 5, 20);
        const b = irand(r, 5, 20);
        return {
          task: `Провери свойството: ${a} + ${b} = ${b} + ${a}. Вярно ли е? Напиши накратко кое свойство е това.`,
          hint: "Това е комутативното свойство на събирането.",
          answer: "комутативно",
          answers: ["да, комутативно", "комутативно свойство", "да"],
        };
      }),
    medium: () =>
      Array.from({ length: 5 }, () => {
        const a = irand(r, 3, 12);
        const b = irand(r, 3, 12);
        const c = irand(r, 3, 12);
        const ans = a + b + c;
        return {
          task: `Пресметни по два начина: (${a} + ${b}) + ${c} и ${a} + (${b} + ${c}). Какъв е общият резултат?`,
          hint: "Асоциативно свойство — резултатът е един и същ.",
          answer: String(ans),
        };
      }),
    hard: () =>
      Array.from({ length: 5 }, () => {
        const a = irand(r, 4, 15);
        const b = irand(r, 4, 15);
        const c = irand(r, 2, 9);
        const ans = c * (a + b);
        return {
          task: `Използвай разпределителното свойство: ${c} × (${a} + ${b}). Пресметни.`,
          hint: `${c}×(${a}+${b}) = ${ans}.`,
          answer: String(ans),
        };
      }),
  });
}

function divisibility(lessonId, seed, divisors) {
  const r = rng(seed);
  return pack(lessonId, {
    easy: () =>
      Array.from({ length: 5 }, () => {
        const d = pick(r, divisors);
        const n = d * irand(r, 3, 40) + (r() > 0.5 ? 0 : irand(r, 1, d - 1));
        const yes = n % d === 0;
        return {
          task: `Дели ли се ${n} на ${d}? Отговори с „да“ или „не“.`,
          hint:
            d === 2
              ? "Четно число → дели се на 2."
              : d === 5
                ? "Завършва на 0 или 5 → дели се на 5."
                : d === 10
                  ? "Завършва на 0 → дели се на 10."
                  : d === 3 || d === 9
                    ? "Събери цифрите и провери делението на 3 или 9."
                    : `Раздели ${n} на ${d} и виж дали остатъкът е 0.`,
          answer: yes ? "да" : "не",
        };
      }),
    medium: () =>
      Array.from({ length: 5 }, () => {
        const d = pick(r, divisors);
        const n = irand(r, 40, 400);
        const rem = n % d;
        const ans = rem === 0 ? n : n + (d - rem);
        return {
          task: `Намери най-близкото по-голямо или равно на ${n} число, което се дели на ${d}.`,
          hint: `Остатъкът при ${n} ÷ ${d} е ${rem}.`,
          answer: String(ans),
        };
      }),
    hard: () =>
      Array.from({ length: 5 }, () => {
        const d1 = pick(r, divisors);
        let d2 = pick(r, divisors);
        while (d2 === d1) d2 = pick(r, divisors);
        const n = irand(r, 50, 300);
        const yes = n % d1 === 0 && n % d2 === 0;
        return {
          task: `Вярно ли е, че ${n} се дели едновременно на ${d1} и на ${d2}? Отговори с „да“ или „не“.`,
          hint: `Провери поотделно делението на ${d1} и на ${d2}.`,
          answer: yes ? "да" : "не",
        };
      }),
  });
}

function gcdLcm(lessonId, seed) {
  const r = rng(seed);
  return pack(lessonId, {
    easy: () =>
      Array.from({ length: 5 }, () => {
        const g = irand(r, 2, 8);
        const a = g * irand(r, 2, 6);
        const b = g * irand(r, 2, 6);
        return {
          task: `Намери НОД(${a}; ${b}).`,
          hint: `Общ делител е ${gcd(a, b)}.`,
          answer: String(gcd(a, b)),
        };
      }),
    medium: () =>
      Array.from({ length: 5 }, () => {
        const a = irand(r, 6, 24);
        const b = irand(r, 6, 24);
        const ans = (a * b) / gcd(a, b);
        return {
          task: `Намери НОК(${a}; ${b}).`,
          hint: `НОК = (${a}×${b}) / НОД. НОД=${gcd(a, b)}.`,
          answer: String(ans),
        };
      }),
    hard: () =>
      Array.from({ length: 5 }, () => {
        const a = irand(r, 8, 30);
        const b = irand(r, 8, 30);
        const c = irand(r, 8, 30);
        const g = gcd(gcd(a, b), c);
        const l = (a * b) / gcd(a, b);
        return {
          task: `Намери НОД(${a}; ${b}; ${c}) и НОК(${a}; ${b}). Запиши: НОД;НОК`,
          hint: "Първо НОД на двете, после с третото; за НОК използвай формулата.",
          answer: `${g};${l}`,
          answers: [`${g}, ${l}`, `${g} ${l}`, `${g}/${l}`],
        };
      }),
  });
}

function fractionConcept(lessonId, seed) {
  const r = rng(seed);
  return pack(lessonId, {
    easy: () =>
      Array.from({ length: 5 }, () => {
        const d = pick(r, [2, 3, 4, 5, 6, 8]);
        const n = irand(r, 1, d - 1);
        return {
          task: `Каква част е ${n} от ${d} равни дяла? Запиши като дроб.`,
          hint: `Числител ${n}, знаменател ${d} → ${n}/${d}.`,
          answer: `${n}/${d}`,
          answers: [fracStr(n, d)],
        };
      }),
    medium: () =>
      Array.from({ length: 5 }, () => {
        const d = pick(r, [4, 5, 6, 8, 10]);
        const n = irand(r, 1, d);
        const ans = n < d ? "0 и 1" : "1";
        return {
          task: `На числовата ос от 0 до 1 отбележи дробта ${n}/${d}. Между кои цели числа е? (или напиши 1, ако е равна на 1)`,
          hint: n < d ? "Между 0 и 1." : "Равна на 1.",
          answer: ans,
          answers: n < d ? ["между 0 и 1", "0-1", "0 1"] : ["равно на 1", "1/1"],
        };
      }),
    hard: () =>
      Array.from({ length: 5 }, () => {
        const d = pick(r, [6, 8, 10, 12]);
        const n = irand(r, 1, d * 2);
        const [sn, sd] = simplify(n, d);
        const whole = Math.floor(sn / sd);
        const rem = sn % sd;
        const mixed = rem === 0 ? String(whole) : `${whole} ${rem}/${sd}`;
        return {
          task: `Запиши ${n}/${d} в най-прост вид${n >= d ? " (или като смесено число)" : ""}.`,
          hint: `Съкрати на ${gcd(n, d)} → ${sn}/${sd}.`,
          answer: `${sn}/${sd}`,
          answers: n >= d ? [mixed, String(sn / sd)] : [],
        };
      }),
  });
}

function compareFractions(lessonId, seed) {
  const r = rng(seed);
  return pack(lessonId, {
    easy: () =>
      Array.from({ length: 5 }, () => {
        const d = pick(r, [5, 6, 8, 10]);
        const n1 = irand(r, 1, d - 1);
        let n2 = irand(r, 1, d - 1);
        while (n2 === n1) n2 = irand(r, 1, d - 1);
        const bigger = n1 > n2 ? `${n1}/${d}` : `${n2}/${d}`;
        return {
          task: `Сравни ${n1}/${d} и ${n2}/${d}. Коя дроб е по-голяма?`,
          hint: "При еднакъв знаменател по-голям е числителят.",
          answer: bigger,
        };
      }),
    medium: () =>
      Array.from({ length: 5 }, () => {
        const a = irand(r, 1, 5);
        const b = pick(r, [4, 5, 6, 8]);
        const c = irand(r, 1, 5);
        const d = pick(r, [3, 4, 5, 6]);
        const left = a / b;
        const right = c / d;
        let ans;
        if (Math.abs(left - right) < 1e-9) ans = "=";
        else ans = left > right ? `${a}/${b}` : `${c}/${d}`;
        return {
          task: `Сравни ${a}/${b} и ${c}/${d}. Напиши по-голямата дроб или = ако са равни.`,
          hint: `Общ знаменател може да е НОК(${b};${d}).`,
          answer: ans,
          answers: ans === "=" ? ["равни", "равно"] : [],
        };
      }),
    hard: () =>
      Array.from({ length: 5 }, () => {
        const a = irand(r, 2, 7);
        const b = pick(r, [5, 6, 7, 8, 9]);
        const c = irand(r, 2, 7);
        const d = pick(r, [5, 6, 7, 8, 9]);
        const items = [
          { s: `${a}/${b}`, v: a / b },
          { s: `${c}/${d}`, v: c / d },
          { s: "1/2", v: 0.5 },
        ].sort((x, y) => x.v - y.v);
        const ans = items.map((x) => x.s).join(", ");
        return {
          task: `Подреди във възходящ ред: ${a}/${b}, ${c}/${d}, 1/2.`,
          hint: "Приведи всички към общ знаменател или сравни с 1/2.",
          answer: ans,
          answers: [items.map((x) => x.s).join("; "), items.map((x) => x.s).join(" ")],
        };
      }),
  });
}

function addSubSameDen(lessonId, seed) {
  const r = rng(seed);
  return pack(lessonId, {
    easy: () =>
      Array.from({ length: 5 }, () => {
        const d = pick(r, [5, 6, 8, 10]);
        const a = irand(r, 1, Math.floor(d / 2));
        const b = irand(r, 1, d - a);
        return {
          task: `Пресметни: ${a}/${d} + ${b}/${d}. Запиши в най-прост вид.`,
          hint: `Събери числителите: (${a}+${b})/${d}.`,
          answer: fracStr(a + b, d),
        };
      }),
    medium: () =>
      Array.from({ length: 5 }, () => {
        const d = pick(r, [6, 8, 10, 12]);
        const a = irand(r, 3, d - 1);
        const b = irand(r, 1, a);
        return {
          task: `Пресметни: ${a}/${d} − ${b}/${d}.`,
          hint: `Извади числителите: (${a}-${b})/${d}.`,
          answer: fracStr(a - b, d),
        };
      }),
    hard: () =>
      Array.from({ length: 5 }, () => {
        const d = pick(r, [8, 10, 12]);
        const a = irand(r, 2, 5);
        const b = irand(r, 1, 4);
        const c = irand(r, 1, 3);
        return {
          task: `Пресметни: ${a}/${d} + ${b}/${d} − ${c}/${d}.`,
          hint: "Работи стъпка по стъпка отляво надясно.",
          answer: fracStr(a + b - c, d),
        };
      }),
  });
}

function addSubDiffDen(lessonId, seed) {
  const r = rng(seed);
  return pack(lessonId, {
    easy: () =>
      Array.from({ length: 5 }, () => {
        const pairs = [
          [1, 2, 1, 4],
          [1, 3, 1, 6],
          [1, 2, 1, 6],
          [2, 5, 1, 10],
          [1, 4, 1, 8],
        ];
        const [a, b, c, d] = pick(r, pairs);
        const den = (b * d) / gcd(b, d);
        const num = a * (den / b) + c * (den / d);
        return {
          task: `Пресметни: ${a}/${b} + ${c}/${d}.`,
          hint: `Общ знаменател ${den}.`,
          answer: fracStr(num, den),
        };
      }),
    medium: () =>
      Array.from({ length: 5 }, () => {
        const a = irand(r, 1, 4);
        const b = pick(r, [3, 4, 5, 6]);
        const c = irand(r, 1, 4);
        const d = pick(r, [4, 5, 6, 8]);
        const den = (b * d) / gcd(b, d);
        const num = a * (den / b) + c * (den / d);
        return {
          task: `Пресметни: ${a}/${b} + ${c}/${d}. Съкрати отговора.`,
          hint: `Намери НОК(${b};${d}) за общ знаменател.`,
          answer: fracStr(num, den),
        };
      }),
    hard: () =>
      Array.from({ length: 5 }, () => {
        let a = irand(r, 2, 5);
        let b = pick(r, [4, 5, 6]);
        let c = irand(r, 1, 4);
        let d = pick(r, [3, 4, 6, 8]);
        if (a / b < c / d) [a, b, c, d] = [c, d, a, b];
        const den = (b * d) / gcd(b, d);
        const num = a * (den / b) - c * (den / d);
        return {
          task: `Пресметни: ${a}/${b} − ${c}/${d}.`,
          hint: "Приведи към общ знаменател преди изваждане.",
          answer: fracStr(num, den),
        };
      }),
  });
}

function multiplyFractions(lessonId, seed) {
  const r = rng(seed);
  return pack(lessonId, {
    easy: () =>
      Array.from({ length: 5 }, () => {
        const a = irand(r, 1, 4);
        const b = pick(r, [2, 3, 4, 5]);
        const c = irand(r, 1, 4);
        const d = pick(r, [2, 3, 4, 5]);
        return {
          task: `Пресметни: ${a}/${b} × ${c}/${d}.`,
          hint: `Умножи числители и знаменатели: ${a * c}/${b * d}, после съкрати.`,
          answer: fracStr(a * c, b * d),
        };
      }),
    medium: () =>
      Array.from({ length: 5 }, () => {
        const n = irand(r, 2, 9);
        const a = irand(r, 1, 4);
        const b = pick(r, [3, 4, 5, 6]);
        return {
          task: `Пресметни: ${n} × ${a}/${b}.`,
          hint: `${n} = ${n}/1. Умножи дробите.`,
          answer: fracStr(n * a, b),
        };
      }),
    hard: () =>
      Array.from({ length: 5 }, () => {
        const a = irand(r, 1, 5);
        const b = pick(r, [2, 3, 4]);
        const c = irand(r, 1, 5);
        const d = pick(r, [2, 3, 4, 5]);
        const e = irand(r, 1, 3);
        const f = pick(r, [2, 3, 4]);
        return {
          task: `Пресметни: ${a}/${b} × ${c}/${d} × ${e}/${f}.`,
          hint: "Можеш да съкращаваш преди умножението.",
          answer: fracStr(a * c * e, b * d * f),
        };
      }),
  });
}

function divideFractions(lessonId, seed) {
  const r = rng(seed);
  return pack(lessonId, {
    easy: () =>
      Array.from({ length: 5 }, () => {
        const a = irand(r, 1, 5);
        const b = pick(r, [2, 3, 4, 5]);
        const c = irand(r, 1, 4);
        const d = pick(r, [2, 3, 4, 5]);
        return {
          task: `Пресметни: ${a}/${b} ÷ ${c}/${d}.`,
          hint: `Разделяне = умножение с reciprocal: ${a}/${b} × ${d}/${c}.`,
          answer: fracStr(a * d, b * c),
        };
      }),
    medium: () =>
      Array.from({ length: 5 }, () => {
        const n = irand(r, 2, 12);
        const a = irand(r, 1, 4);
        const b = pick(r, [2, 3, 4, 5]);
        return {
          task: `Пресметни: ${n} ÷ ${a}/${b}.`,
          hint: `${n} × ${b}/${a}.`,
          answer: fracStr(n * b, a),
        };
      }),
    hard: () =>
      Array.from({ length: 5 }, () => {
        const a = irand(r, 2, 5);
        const b = pick(r, [3, 4, 5, 6]);
        const c = irand(r, 1, 4);
        const d = pick(r, [2, 3, 4]);
        return {
          task: `Една лента е ${a}/${b} м. Колко парчета по ${c}/${d} м се получават?`,
          hint: `Раздели ${a}/${b} ÷ ${c}/${d}.`,
          answer: fracStr(a * d, b * c),
        };
      }),
  });
}

function mixedNumbers(lessonId, seed) {
  const r = rng(seed);
  return pack(lessonId, {
    easy: () =>
      Array.from({ length: 5 }, () => {
        const w = irand(r, 1, 5);
        const n = irand(r, 1, 4);
        const d = pick(r, [2, 3, 4, 5, 6]);
        const ans = w * d + n;
        return {
          task: `Запиши смесеното число ${w} ${n}/${d} като неправилна дроб.`,
          hint: `${w}=${w * d}/${d}; добави ${n}/${d} → ${ans}/${d}.`,
          answer: `${ans}/${d}`,
          answers: [fracStr(ans, d)],
        };
      }),
    medium: () =>
      Array.from({ length: 5 }, () => {
        const n = irand(r, 7, 25);
        const d = pick(r, [3, 4, 5, 6]);
        const w = Math.floor(n / d);
        const rem = n % d;
        const ans = rem === 0 ? String(w) : `${w} ${rem}/${d}`;
        return {
          task: `Запиши неправилната дроб ${n}/${d} като смесено число.`,
          hint: `${n} ÷ ${d} = ${w} цели и остатък ${rem}.`,
          answer: ans,
          answers: rem === 0 ? [] : [`${w} ${fracStr(rem, d)}`],
        };
      }),
    hard: () =>
      Array.from({ length: 5 }, () => {
        const w1 = irand(r, 1, 3);
        const n1 = irand(r, 1, 3);
        const d = pick(r, [4, 5, 6]);
        const w2 = irand(r, 1, 2);
        const n2 = irand(r, 1, 3);
        const num = w1 * d + n1 + w2 * d + n2;
        const w = Math.floor(num / d);
        const rem = num % d;
        const [sn, sd] = simplify(rem, d);
        const ans = rem === 0 ? String(w) : `${w} ${sn}/${sd}`;
        return {
          task: `Пресметни: ${w1} ${n1}/${d} + ${w2} ${n2}/${d}.`,
          hint: "Събери целите и дробите поотделно, после опрости.",
          answer: ans,
          answers: [fracStr(num, d)],
        };
      }),
  });
}

function decimalConcept(lessonId, seed) {
  const r = rng(seed);
  return pack(lessonId, {
    easy: () =>
      Array.from({ length: 5 }, () => {
        const n = irand(r, 1, 9);
        return {
          task: `Запиши като десетична дроб: ${n}/10.`,
          hint: `${n}/10 = 0,${n}.`,
          answer: `0,${n}`,
          answers: [`0.${n}`],
        };
      }),
    medium: () =>
      Array.from({ length: 5 }, () => {
        const n = irand(r, 5, 95);
        const dec = (n / 100).toFixed(2);
        return {
          task: `Запиши ${n}/100 като десетична дроб.`,
          hint: `Десетичната запис: ${dec.replace(".", ",")}.`,
          answer: dec.replace(".", ","),
          answers: [dec, String(n / 100)],
        };
      }),
    hard: () =>
      Array.from({ length: 5 }, () => {
        const a = irand(r, 1, 9);
        let b = irand(r, 0, 9);
        let c = irand(r, 0, 9);
        while (c === b) c = irand(r, 0, 9);
        const left = `0,${a}${b}`;
        const right = `0,${a}${c}`;
        const ans = b > c ? left : right;
        return {
          task: `Кое е по-голямо: ${left} или ${right}?`,
          hint: "Сравни цифрите отляво надясно — десети, стотни…",
          answer: ans,
          answers: [ans.replace(",", ".")],
        };
      }),
  });
}

function compareDecimals(lessonId, seed) {
  const r = rng(seed);
  return pack(lessonId, {
    easy: () =>
      Array.from({ length: 5 }, () => {
        const av = irand(r, 10, 90) / 10;
        const bv = irand(r, 10, 90) / 10;
        const a = av.toFixed(1).replace(".", ",");
        const b = bv.toFixed(1).replace(".", ",");
        const ans = av === bv ? "=" : av > bv ? ">" : "<";
        return {
          task: `Сравни ${a} и ${b}. Постави <, > или =.`,
          hint: "Сравни целите части, после десетите.",
          answer: ans,
        };
      }),
    medium: () =>
      Array.from({ length: 5 }, () => {
        const av = irand(r, 100, 999) / 100;
        const bv = irand(r, 100, 999) / 100;
        const a = av.toFixed(2).replace(".", ",");
        const b = bv.toFixed(2).replace(".", ",");
        const ans = av === bv ? "=" : av > bv ? a : b;
        return {
          task: `Сравни ${a} и ${b}. Напиши по-голямото число или =.`,
          hint: "Изравни броя на знаците след запетаята с нули.",
          answer: ans,
          answers: ans === "=" ? ["равни"] : [ans.replace(",", ".")],
        };
      }),
    hard: () =>
      Array.from({ length: 5 }, () => {
        const vals = Array.from({ length: 3 }, () => irand(r, 50, 950) / 100);
        const sorted = [...vals].sort((x, y) => x - y);
        const fmt = (v) => v.toFixed(2).replace(".", ",");
        const ans = sorted.map(fmt).join(", ");
        return {
          task: `Подреди във възходящ ред: ${vals.map(fmt).join("; ")}.`,
          hint: "Сравни поразредно отляво надясно.",
          answer: ans,
          answers: [sorted.map(fmt).join("; "), sorted.map((v) => v.toFixed(2)).join(", ")],
        };
      }),
  });
}

function addSubDecimals(lessonId, seed) {
  const r = rng(seed);
  return pack(lessonId, {
    easy: () =>
      Array.from({ length: 5 }, () => {
        const a = irand(r, 10, 80) / 10;
        const b = irand(r, 5, 40) / 10;
        const ans = Number((a + b).toFixed(1));
        return {
          task: `Пресметни: ${a.toFixed(1).replace(".", ",")} + ${b.toFixed(1).replace(".", ",")}.`,
          hint: "Подравни запетаята и събери.",
          answer: ans.toFixed(1).replace(".", ","),
          answers: [String(ans), ans.toFixed(1)],
        };
      }),
    medium: () =>
      Array.from({ length: 5 }, () => {
        const a = irand(r, 100, 900) / 100;
        const b = irand(r, 50, 400) / 100;
        const ans = Number((a - b).toFixed(2));
        return {
          task: `Пресметни: ${a.toFixed(2).replace(".", ",")} − ${b.toFixed(2).replace(".", ",")}.`,
          hint: "Подравни десетичните знаци преди изваждане.",
          answer: ans.toFixed(2).replace(".", ","),
          answers: [String(ans), ans.toFixed(2)],
        };
      }),
    hard: () =>
      Array.from({ length: 5 }, () => {
        const a = irand(r, 200, 800) / 100;
        const b = irand(r, 50, 200) / 100;
        const c = irand(r, 50, 200) / 100;
        const ans = Number((a - b + c).toFixed(2));
        return {
          task: `Пресметни: ${a.toFixed(2).replace(".", ",")} − ${b.toFixed(2).replace(".", ",")} + ${c.toFixed(2).replace(".", ",")}.`,
          hint: "Изчислявай стъпка по стъпка.",
          answer: ans.toFixed(2).replace(".", ","),
          answers: [String(ans), ans.toFixed(2)],
        };
      }),
  });
}

function mulDecimals(lessonId, seed) {
  const r = rng(seed);
  return pack(lessonId, {
    easy: () =>
      Array.from({ length: 5 }, () => {
        const a = irand(r, 2, 9);
        const b = irand(r, 1, 9) / 10;
        const ans = Number((a * b).toFixed(1));
        return {
          task: `Пресметни: ${a} × ${b.toFixed(1).replace(".", ",")}.`,
          hint: `Умножи като цели и сложи 1 знак след запетаята.`,
          answer: ans.toFixed(1).replace(".", ","),
          answers: [String(ans), ans.toFixed(1)],
        };
      }),
    medium: () =>
      Array.from({ length: 5 }, () => {
        const a = irand(r, 12, 45) / 10;
        const b = irand(r, 12, 45) / 10;
        const ans = Number((a * b).toFixed(2));
        return {
          task: `Пресметни: ${a.toFixed(1).replace(".", ",")} × ${b.toFixed(1).replace(".", ",")}.`,
          hint: "Общо 2 знака след запетаята в произведението.",
          answer: ans.toFixed(2).replace(".", ","),
          answers: [String(ans), ans.toFixed(2)],
        };
      }),
    hard: () =>
      Array.from({ length: 5 }, () => {
        const price = irand(r, 250, 899) / 100;
        const n = irand(r, 2, 8);
        const ans = Number((price * n).toFixed(2));
        return {
          task: `Един бележник струва ${price.toFixed(2).replace(".", ",")} лв. Колко струват ${n} бележника?`,
          hint: `Умножи ${price.toFixed(2).replace(".", ",")} × ${n}.`,
          answer: ans.toFixed(2).replace(".", ","),
          answers: [String(ans), ans.toFixed(2), `${ans.toFixed(2).replace(".", ",")} лв`],
        };
      }),
  });
}

function divDecimals(lessonId, seed) {
  const r = rng(seed);
  return pack(lessonId, {
    easy: () =>
      Array.from({ length: 5 }, () => {
        const b = irand(r, 2, 9);
        const q = irand(r, 2, 9) / 10;
        const a = Number((b * q).toFixed(1));
        const ans = Number((a / b).toFixed(1));
        return {
          task: `Пресметни: ${a.toFixed(1).replace(".", ",")} ÷ ${b}.`,
          hint: "Раздели като с цели числа и запази мястото на запетаята.",
          answer: ans.toFixed(1).replace(".", ","),
          answers: [String(ans), ans.toFixed(1)],
        };
      }),
    medium: () =>
      Array.from({ length: 5 }, () => {
        const a = irand(r, 20, 90) / 10;
        const b = pick(r, [0.2, 0.5, 0.4, 0.25]);
        const ans = Number((a / b).toFixed(2));
        return {
          task: `Пресметни: ${a.toFixed(1).replace(".", ",")} ÷ ${String(b).replace(".", ",")}.`,
          hint: "Умножи делимо и делител по 10 или 100, за да махнеш запетаята в делителя.",
          answer: String(ans).replace(".", ","),
          answers: [String(ans), ans.toFixed(2), ans.toFixed(2).replace(".", ",")],
        };
      }),
    hard: () =>
      Array.from({ length: 5 }, () => {
        const total = irand(r, 50, 200) / 10;
        const n = irand(r, 2, 8);
        const ans = Number((total / n).toFixed(2));
        return {
          task: `${total.toFixed(1).replace(".", ",")} л сок се разлива поравно в ${n} чаши. Колко литра има в една чаша?`,
          hint: `Раздели ${total.toFixed(1).replace(".", ",")} ÷ ${n}.`,
          answer: String(ans).replace(".", ","),
          answers: [String(ans), ans.toFixed(2).replace(".", ","), ans.toFixed(2)],
        };
      }),
  });
}

function convertFracDec(lessonId, seed) {
  const r = rng(seed);
  return pack(lessonId, {
    easy: () =>
      Array.from({ length: 5 }, () => {
        const map = [
          [1, 2, "0,5", "0.5", "1/2"],
          [1, 4, "0,25", "0.25", "1/4"],
          [3, 4, "0,75", "0.75", "3/4"],
          [1, 5, "0,2", "0.2", "1/5"],
          [2, 5, "0,4", "0.4", "2/5"],
          [1, 10, "0,1", "0.1", "1/10"],
        ];
        const [n, d, dec, decDot] = pick(r, map);
        return {
          task: `Запиши ${n}/${d} като десетична дроб.`,
          hint: `${n}/${d} = ${dec}.`,
          answer: dec,
          answers: [decDot],
        };
      }),
    medium: () =>
      Array.from({ length: 5 }, () => {
        const map = [
          ["0,2", "1/5", "0.2"],
          ["0,25", "1/4", "0.25"],
          ["0,5", "1/2", "0.5"],
          ["0,75", "3/4", "0.75"],
          ["0,4", "2/5", "0.4"],
          ["0,8", "4/5", "0.8"],
        ];
        const [dec, frac, decDot] = pick(r, map);
        return {
          task: `Запиши ${dec} като обикновена дроб в най-прост вид.`,
          hint: "Запиши над 10, 100… и съкрати.",
          answer: frac,
          answers: [decDot],
        };
      }),
    hard: () =>
      Array.from({ length: 5 }, () => {
        const n = irand(r, 1, 7);
        const d = pick(r, [8, 16, 20, 25]);
        const val = n / d;
        const dec = Number(val.toFixed(4));
        const s = String(dec).replace(/0+$/, "").replace(/\.$/, "");
        return {
          task: `Превърни ${n}/${d} в десетична дроб (с деление).`,
          hint: `Раздели ${n} ÷ ${d}.`,
          answer: s.replace(".", ","),
          answers: [s, fracStr(n, d)],
        };
      }),
  });
}

function percentIntro(lessonId, seed) {
  const r = rng(seed);
  return pack(lessonId, {
    easy: () =>
      Array.from({ length: 5 }, () => {
        const p = pick(r, [10, 20, 25, 50, 75, 100]);
        return {
          task: `Какво означава ${p}%? Запиши като дроб от 100.`,
          hint: `${p}% = ${p}/100.`,
          answer: `${p}/100`,
          answers: [fracStr(p, 100)],
        };
      }),
    medium: () =>
      Array.from({ length: 5 }, () => {
        const p = pick(r, [10, 20, 25, 50]);
        const dec = (p / 100).toFixed(2);
        return {
          task: `Запиши ${p}% като десетична дроб.`,
          hint: `${p}% = ${dec.replace(".", ",")}.`,
          answer: dec.replace(".", ","),
          answers: [dec, String(p / 100)],
        };
      }),
    hard: () =>
      Array.from({ length: 5 }, () => {
        const p = pick(r, [5, 15, 30, 40, 60]);
        const dec = (p / 100).toString().replace(".", ",");
        return {
          task: `Попълни десетичната част: ${p}% = ${p}/100 = ?`,
          hint: `Десетичната е ${dec}.`,
          answer: dec,
          answers: [String(p / 100), `${p}/100`],
        };
      }),
  });
}

function percentOf(lessonId, seed) {
  const r = rng(seed);
  return pack(lessonId, {
    easy: () =>
      Array.from({ length: 5 }, () => {
        const whole = pick(r, [20, 40, 50, 80, 100, 200]);
        const p = pick(r, [10, 20, 25, 50]);
        const ans = (whole * p) / 100;
        return {
          task: `Намери ${p}% от ${whole}.`,
          hint: `${p}% от ${whole} = ${ans}.`,
          answer: String(ans),
        };
      }),
    medium: () =>
      Array.from({ length: 5 }, () => {
        const whole = irand(r, 60, 240);
        const p = pick(r, [15, 30, 40, 5, 12]);
        const ans = Number(((whole * p) / 100).toFixed(2));
        return {
          task: `Намери ${p}% от ${whole}.`,
          hint: `Умножи ${whole} по ${p} и раздели на 100.`,
          answer: String(ans).replace(".", ","),
          answers: [String(ans)],
        };
      }),
    hard: () =>
      Array.from({ length: 5 }, () => {
        const price = irand(r, 40, 120);
        const p = pick(r, [10, 15, 20, 25]);
        const pay = price - (price * p) / 100;
        return {
          task: `Цена ${price} лв. с отстъпка ${p}%. Колко се плаща след отстъпката?`,
          hint: `Отстъпка = ${p}% от ${price}; плащаш цената минус отстъпката.`,
          answer: String(pay).replace(".", ","),
          answers: [String(pay), `${String(pay).replace(".", ",")} лв`],
        };
      }),
  });
}

function angles(lessonId, seed, mode) {
  const r = rng(seed);
  return pack(lessonId, {
    easy: () =>
      Array.from({ length: 5 }, () => {
        if (mode === "ray") {
          const items = [
            {
              task: "Лъчът има ли два края? Отговори с „да“ или „не“.",
              hint: "Лъчът има начало и една посока.",
              answer: "не",
            },
            {
              task: "Отсечката има ли два края? Отговори с „да“ или „не“.",
              hint: "Отсечката е ограничена от две точки.",
              answer: "да",
            },
            {
              task: "Колко начала има един лъч?",
              hint: "Лъчът започва от една точка.",
              answer: "1",
              answers: ["едно", "един"],
            },
            {
              task: "Права през A и B определя ли два противоположни лъча? („да“/„не“)",
              hint: "Да — в двете посоки.",
              answer: "да",
            },
            {
              task: "Може ли лъч да се продължи безкрайно само в една посока? („да“/„не“)",
              hint: "Точно така е дефиниран лъчът.",
              answer: "да",
            },
          ];
          return pick(r, items);
        }
        const deg = pick(r, [30, 45, 60, 90, 120, 150]);
        const kind =
          deg < 90 ? "остър" : deg === 90 ? "прав" : deg < 180 ? "тъп" : "изправен";
        return {
          task: `Ъгълът е ${deg}°. Какъв вид е (остър, прав, тъп, изправен)?`,
          hint:
            deg < 90
              ? "Под 90° — остър."
              : deg === 90
                ? "Точно 90° — прав."
                : deg < 180
                  ? "Между 90° и 180° — тъп."
                  : "180° — изправен.",
          answer: kind,
        };
      }),
    medium: () =>
      Array.from({ length: 5 }, () => {
        const a = irand(r, 20, 70);
        return {
          task: `Два съседни ъгъла са ${a}° и ? . Ако образуват изправен ъгъл, намери неизвестния (в градуси).`,
          hint: `Изправен = 180°. Неизвестният е ${180 - a}°.`,
          answer: String(180 - a),
          answers: [`${180 - a}°`],
        };
      }),
    hard: () =>
      Array.from({ length: 5 }, () => {
        const a = irand(r, 25, 80);
        return {
          task: `При пресичане на две прави един ъгъл е ${a}°. Колко е вертикалният му ъгъл (в градуси)?`,
          hint: `Вертикалните ъгли са равни — ${a}°.`,
          answer: String(a),
          answers: [`${a}°`],
        };
      }),
  });
}

function triangles(lessonId, seed, mode) {
  const r = rng(seed);
  return pack(lessonId, {
    easy: () =>
      Array.from({ length: 5 }, () => {
        if (mode === "types") {
          const items = [
            {
              task: "Как се нарича триъгълник с три равни страни?",
              answer: "равностранен",
              hint: "Всички страни равни.",
            },
            {
              task: "Как се нарича триъгълник с един прав ъгъл?",
              answer: "правоъгълен",
              hint: "Има ъгъл 90°.",
              answers: ["правоъгълен триъгълник"],
            },
            {
              task: "Може ли триъгълник да има два тъпи ъгъла? („да“/„не“)",
              answer: "не",
              hint: "Сборът на ъглите е 180°.",
            },
            {
              task: "Триъгълник с две равни страни се нарича?",
              answer: "равнобедрен",
              hint: "Две бедра равни.",
            },
            {
              task: "Триъгълник с всички ъгли остри се нарича?",
              answer: "остроъгълен",
              hint: "Всеки ъгъл < 90°.",
            },
          ];
          return pick(r, items);
        }
        const a = irand(r, 3, 10);
        const b = irand(r, 3, 10);
        const c = irand(r, 3, 10);
        const yes = a + b > c && a + c > b && b + c > a;
        return {
          task: `Може ли да съществува триъгълник със страни ${a}, ${b}, ${c} см? („да“/„не“)`,
          hint: "Сборът на всеки две страни трябва да е по-голям от третата.",
          answer: yes ? "да" : "не",
        };
      }),
    medium: () =>
      Array.from({ length: 5 }, () => {
        let a = irand(r, 30, 80);
        let b = irand(r, 30, 80);
        let c = 180 - a - b;
        if (c <= 0) {
          a = 50;
          b = 60;
          c = 70;
        }
        return {
          task: `В триъгълник два ъгъла са ${a}° и ${b}°. Намери третия ъгъл (в градуси).`,
          hint: `180° − ${a}° − ${b}° = ${c}°.`,
          answer: String(c),
          answers: [`${c}°`],
        };
      }),
    hard: () =>
      Array.from({ length: 5 }, () => {
        const leg = irand(r, 3, 9);
        const base = irand(r, 4, 12);
        const ans = 2 * leg + base;
        return {
          task: `Равнобедрен триъгълник с бедра ${leg} см и основа ${base} см. Намери периметъра (в см).`,
          hint: `P = ${leg} + ${leg} + ${base} = ${ans} см.`,
          answer: String(ans),
        };
      }),
  });
}

function quads(lessonId, seed, kind) {
  const r = rng(seed);
  return pack(lessonId, {
    easy: () =>
      Array.from({ length: 5 }, () => {
        if (kind === "rect") {
          const a = irand(r, 3, 12);
          const b = irand(r, 3, 12);
          return {
            task: `Правоъгълник със страни ${a} см и ${b} см. Намери периметъра (в см).`,
            hint: `P = 2×(${a}+${b}) = ${2 * (a + b)} см.`,
            answer: String(2 * (a + b)),
          };
        }
        const items = [
          { task: "Колко прави ъгъла има правоъгълникът?", answer: "4", hint: "Всички ъгли са прави." },
          {
            task: "Квадратът има ли всички страни равни? („да“/„не“)",
            answer: "да",
            hint: "Това е основно свойство.",
          },
          {
            task: "Успоредникът има ли две двойки успоредни страни? („да“/„не“)",
            answer: "да",
            hint: "По дефиниция.",
          },
          {
            task: "Може ли квадратът да се нарече правоъгълник? („да“/„не“)",
            answer: "да",
            hint: "Има четири прави ъгъла.",
          },
          {
            task: "Колко двойки успоредни страни има успоредникът?",
            answer: "2",
            hint: "Две двойки.",
            answers: ["две"],
          },
        ];
        return pick(r, items);
      }),
    medium: () =>
      Array.from({ length: 5 }, () => {
        const a = irand(r, 4, 15);
        const b = irand(r, 4, 15);
        return {
          task: `Намери лицето на правоъгълник ${a} см × ${b} см (в см²).`,
          hint: `S = ${a}×${b} = ${a * b} см².`,
          answer: String(a * b),
        };
      }),
    hard: () =>
      Array.from({ length: 5 }, () => {
        const side = irand(r, 4, 14);
        return {
          task: `Квадрат със страна ${side} см. Намери лицето (в см²).`,
          hint: `S=${side * side} см².`,
          answer: String(side * side),
        };
      }),
  });
}

function perimeter(lessonId, seed) {
  const r = rng(seed);
  return pack(lessonId, {
    easy: () =>
      Array.from({ length: 5 }, () => {
        const a = irand(r, 3, 10);
        const b = irand(r, 3, 10);
        const c = irand(r, 3, 10);
        return {
          task: `Намери периметъра на триъгълник със страни ${a}, ${b}, ${c} см.`,
          hint: `P = ${a}+${b}+${c} = ${a + b + c} см.`,
          answer: String(a + b + c),
        };
      }),
    medium: () =>
      Array.from({ length: 5 }, () => {
        const a = irand(r, 5, 20);
        const b = irand(r, 5, 20);
        return {
          task: `Ограда около правоъгълна градина ${a} m × ${b} m. Колко метра ограда е нужна?`,
          hint: `P = 2×(${a}+${b}).`,
          answer: String(2 * (a + b)),
        };
      }),
    hard: () =>
      Array.from({ length: 5 }, () => {
        const p = irand(r, 20, 60);
        // ensure divisible by 4
        const per = p - (p % 4);
        return {
          task: `Периметърът на квадрат е ${per} см. Намери страната (в см).`,
          hint: `Страната = ${per} ÷ 4.`,
          answer: String(per / 4),
        };
      }),
  });
}

function area(lessonId, seed, shape) {
  const r = rng(seed);
  return pack(lessonId, {
    easy: () =>
      Array.from({ length: 5 }, () => {
        if (shape === "triangle") {
          const b = irand(r, 4, 14);
          const h = irand(r, 3, 12);
          const ans = (b * h) / 2;
          return {
            task: `Лице на триъгълник с основа ${b} см и височина ${h} см.`,
            hint: `S = (${b}×${h}) ÷ 2 = ${ans} см².`,
            answer: String(ans).replace(".", ","),
            answers: [String(ans)],
          };
        }
        const a = irand(r, 3, 12);
        const b = irand(r, 3, 12);
        return {
          task: `Лице на правоъгълник ${a}×${b} см.`,
          hint: `S = ${a * b} см².`,
          answer: String(a * b),
        };
      }),
    medium: () =>
      Array.from({ length: 5 }, () => {
        if (shape === "triangle") {
          const b = irand(r, 6, 20);
          const h = irand(r, 5, 16);
          const ans = (b * h) / 2;
          return {
            task: `Знаме във форма на триъгълник: основа ${b} dm, височина ${h} dm. Намери лицето в dm².`,
            hint: "S = основа × височина ÷ 2.",
            answer: String(ans).replace(".", ","),
            answers: [String(ans)],
          };
        }
        const a = irand(r, 8, 25);
        return {
          task: `Квадратна плочка със страна ${a} см. Колко е лицето в см²?`,
          hint: `S = ${a * a} см².`,
          answer: String(a * a),
        };
      }),
    hard: () =>
      Array.from({ length: 5 }, () => {
        const a = irand(r, 10, 30);
        const b = irand(r, 8, 20);
        const c = irand(r, 2, 6);
        return {
          task: `Правоъгълник ${a}×${b} см. От него изрязват квадрат ${c}×${c} см. Колко е останалото лице?`,
          hint: `S = ${a}×${b} − ${c}×${c}.`,
          answer: String(a * b - c * c),
        };
      }),
  });
}

function units(lessonId, seed) {
  const r = rng(seed);
  return pack(lessonId, {
    easy: () =>
      Array.from({ length: 5 }, () => {
        const m = irand(r, 2, 15);
        return {
          task: `Преобразувай: ${m} m = ? cm.`,
          hint: `1 m = 100 cm → ${m * 100} cm.`,
          answer: String(m * 100),
        };
      }),
    medium: () =>
      Array.from({ length: 5 }, () => {
        const kind = pick(r, ["length", "area"]);
        if (kind === "length") {
          const km = irand(r, 1, 8);
          return {
            task: `Преобразувай: ${km} km = ? m.`,
            hint: `1 km = 1000 m → ${km * 1000} m.`,
            answer: String(km * 1000),
          };
        }
        const m2 = irand(r, 2, 12);
        return {
          task: `Преобразувай: ${m2} m² = ? cm².`,
          hint: `1 m² = 10 000 cm².`,
          answer: String(m2 * 10000),
          answers: [String(m2 * 10000).replace(/\B(?=(\d{3})+(?!\d))/g, " ")],
        };
      }),
    hard: () =>
      Array.from({ length: 5 }, () => {
        const a = irand(r, 2, 9);
        const b = irand(r, 10, 90);
        const cm = a * 100 + b;
        return {
          task: `Лента е ${a} m и ${b} cm. Запиши дължината само в сантиметри.`,
          hint: `${a} m ${b} cm = ${cm} cm.`,
          answer: String(cm),
        };
      }),
  });
}

function volume(lessonId, seed) {
  const r = rng(seed);
  return pack(lessonId, {
    easy: () =>
      Array.from({ length: 5 }, () => {
        const a = irand(r, 2, 8);
        return {
          task: `Куб с ръб ${a} см. Намери обема (в см³).`,
          hint: `V = ${a}³ = ${a * a * a} см³.`,
          answer: String(a * a * a),
        };
      }),
    medium: () =>
      Array.from({ length: 5 }, () => {
        const a = irand(r, 2, 8);
        const b = irand(r, 2, 8);
        const c = irand(r, 2, 8);
        return {
          task: `Правоъгълен паралелепипед ${a}×${b}×${c} см. Намери обема (в см³).`,
          hint: `V = ${a}×${b}×${c} = ${a * b * c} см³.`,
          answer: String(a * b * c),
        };
      }),
    hard: () =>
      Array.from({ length: 5 }, () => {
        const a = irand(r, 3, 10);
        return {
          task: `Аквариум куб с ръб ${a} dm. Колко литра вода събира? (1 dm³ = 1 l)`,
          hint: `V = ${a * a * a} dm³ = ${a * a * a} l.`,
          answer: String(a * a * a),
        };
      }),
  });
}

function coordinates(lessonId, seed) {
  const r = rng(seed);
  return pack(lessonId, {
    easy: () =>
      Array.from({ length: 5 }, () => {
        const x = irand(r, 0, 8);
        const y = irand(r, 0, 8);
        let ans;
        if (x === 0 && y === 0) ans = "начало";
        else if (x === 0) ans = "ос y";
        else if (y === 0) ans = "ос x";
        else ans = "I квадрант";
        return {
          task: `Къде е точката A(${x}; ${y})? (начало / ос x / ос y / I квадрант)`,
          hint:
            x === 0 && y === 0
              ? "Начало на координатната система."
              : x === 0
                ? "Върху оста y."
                : y === 0
                  ? "Върху оста x."
                  : "В I квадрант (x>0, y>0).",
          answer: ans,
          answers:
            ans === "I квадрант"
              ? ["1 квадрант", "първи квадрант"]
              : ans === "начало"
                ? ["(0;0)", "начало на координатната система"]
                : [],
        };
      }),
    medium: () =>
      Array.from({ length: 5 }, () => {
        const x1 = irand(r, 1, 6);
        const y1 = irand(r, 1, 6);
        const same = pick(r, ["h", "v", "none"]);
        const x2 = same === "v" ? x1 : irand(r, 1, 6);
        const y2 = same === "h" ? y1 : irand(r, 1, 6);
        let ans = "не";
        if (y1 === y2 && x1 !== x2) ans = "хоризонтална";
        else if (x1 === x2 && y1 !== y2) ans = "вертикална";
        return {
          task: `Точки A(${x1}; ${y1}) и B(${x2}; ${y2}). Каква права през тях: хоризонтална / вертикална / не?`,
          hint:
            y1 === y2 && x1 !== x2
              ? "Хоризонтална (равни y)."
              : x1 === x2 && y1 !== y2
                ? "Вертикална (равни x)."
                : "Нито хоризонтална, нито вертикална.",
          answer: ans,
          answers: ans === "не" ? ["нито една", "никаква"] : [],
        };
      }),
    hard: () =>
      Array.from({ length: 5 }, () => {
        const x = irand(r, 1, 5);
        const y = irand(r, 1, 5);
        const p = 2 * (x + y);
        const s = x * y;
        return {
          task: `Правоъгълник с върхове (0;0) и (${x}; ${y}), страни успоредни на осите. Намери лицето.`,
          hint: `S=${x}*${y}=${s}. (Периметърът би бил ${p}.)`,
          answer: String(s),
        };
      }),
  });
}

function equations(lessonId, seed) {
  const r = rng(seed);
  return pack(lessonId, {
    easy: () =>
      Array.from({ length: 5 }, () => {
        const x = irand(r, 2, 20);
        const a = irand(r, 3, 30);
        return {
          task: `Реши уравнението: x + ${a} = ${x + a}.`,
          hint: `x = ${x + a} − ${a} = ${x}.`,
          answer: String(x),
          answers: [`x=${x}`, `x = ${x}`],
        };
      }),
    medium: () =>
      Array.from({ length: 5 }, () => {
        const x = irand(r, 2, 15);
        const a = irand(r, 2, 12);
        return {
          task: `Реши: ${a}x = ${a * x}.`,
          hint: `x = ${a * x} ÷ ${a} = ${x}.`,
          answer: String(x),
          answers: [`x=${x}`, `x = ${x}`],
        };
      }),
    hard: () =>
      Array.from({ length: 5 }, () => {
        const x = irand(r, 3, 18);
        const a = irand(r, 2, 10);
        const b = irand(r, 5, 40);
        return {
          task: `Реши: ${a}x + ${b} = ${a * x + b}.`,
          hint: `Извади ${b}, после раздели на ${a}.`,
          answer: String(x),
          answers: [`x=${x}`, `x = ${x}`],
        };
      }),
  });
}

function dataCharts(lessonId, seed) {
  const r = rng(seed);
  return pack(lessonId, {
    easy: () =>
      Array.from({ length: 5 }, () => {
        const vals = [irand(r, 2, 10), irand(r, 2, 10), irand(r, 2, 10)];
        const labels = ["А", "Б", "В"];
        const max = Math.max(...vals);
        const winner = labels[vals.indexOf(max)];
        const total = vals[0] + vals[1] + vals[2];
        return {
          task: `Ученици: клас А — ${vals[0]}, клас Б — ${vals[1]}, клас В — ${vals[2]} отлични. Кой клас има най-много? Напиши буквата на класа.`,
          hint: `Сравни числата; най-много е клас ${winner}. (Общо ${total}.)`,
          answer: winner,
          answers: [`клас ${winner}`, total === max ? String(max) : winner],
        };
      }),
    medium: () =>
      Array.from({ length: 5 }, () => {
        const vals = [irand(r, 5, 20), irand(r, 5, 20), irand(r, 5, 20), irand(r, 5, 20)];
        const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
        const rounded = Number(avg.toFixed(1));
        return {
          task: `Температури (°C): ${vals.join(", ")}. Намери средноаритметичното.`,
          hint: `Сбор ÷ ${vals.length} ≈ ${rounded.toFixed(1).replace(".", ",")}.`,
          answer: rounded.toFixed(1).replace(".", ","),
          answers: [String(rounded), rounded.toFixed(1)],
        };
      }),
    hard: () =>
      Array.from({ length: 5 }, () => {
        const a = irand(r, 10, 40);
        const b = irand(r, 10, 40);
        const c = irand(r, 10, 40);
        const total = a + b + c;
        const pct = Math.round((a / total) * 100);
        return {
          task: `Диаграма: ябълки ${a}, круши ${b}, сливи ${c}. Какъв процент приблизително са ябълките? (цяло число)`,
          hint: `Ябълки / сбор × 100; сбор = ${total}.`,
          answer: String(pct),
          answers: [`${pct}%`],
        };
      }),
  });
}

function wordProblems(lessonId, seed) {
  const r = rng(seed);
  return pack(lessonId, {
    easy: () =>
      Array.from({ length: 5 }, () => {
        const a = irand(r, 12, 40);
        const b = irand(r, 5, 15);
        return {
          task: `Мария има ${a} стикера. Дала е ${b}. Колко са ѝ останали?`,
          hint: `${a} − ${b} = ${a - b}.`,
          answer: String(a - b),
        };
      }),
    medium: () =>
      Array.from({ length: 5 }, () => {
        const price = irand(r, 2, 9);
        const n = irand(r, 3, 12);
        const pay = price * n + irand(r, 1, 10);
        return {
          task: `Купени са ${n} химикалки по ${price} лв. Платено е ${pay} лв. Колко е рестото?`,
          hint: `Ресто = ${pay} − ${n * price}.`,
          answer: String(pay - n * price),
        };
      }),
    hard: () =>
      Array.from({ length: 5 }, () => {
        const total = irand(r, 30, 80);
        const p = pick(r, [10, 20, 25]);
        const done = (total * p) / 100;
        const left = total - done;
        return {
          task: `От ${total} задачи са решени ${p}%. Колко задачи остават?`,
          hint: `Решени = ${done}; остават ${left}.`,
          answer: String(left),
        };
      }),
  });
}

function review(lessonId, seed, focus) {
  const r = rng(seed);
  const makers = {
    fractions: () => {
      const a = irand(r, 1, 4);
      const b = pick(r, [2, 3, 4, 5]);
      const c = irand(r, 1, 4);
      const d = pick(r, [2, 3, 4, 6]);
      const den = (b * d) / gcd(b, d);
      const num = a * (den / b) + c * (den / d);
      return {
        task: `Преговор дроби: ${a}/${b} + ${c}/${d}.`,
        hint: "Общ знаменател, събери, съкрати.",
        answer: fracStr(num, den),
      };
    },
    decimals: () => {
      const a = irand(r, 10, 90) / 10;
      const b = irand(r, 10, 90) / 10;
      const ans = Number((a * b).toFixed(2));
      return {
        task: `Преговор десетични: ${a.toFixed(1).replace(".", ",")} × ${b.toFixed(1).replace(".", ",")}.`,
        hint: "Умножи и сложи правилния брой знаци след запетаята.",
        answer: ans.toFixed(2).replace(".", ","),
        answers: [String(ans), ans.toFixed(2)],
      };
    },
    geometry: () => {
      const a = irand(r, 4, 12);
      const b = irand(r, 4, 12);
      return {
        task: `Преговор геометрия: лице на правоъгълник ${a}×${b} см.`,
        hint: `S=${a}*${b}.`,
        answer: String(a * b),
      };
    },
    mixed: () => {
      const choice = pick(r, ["pct", "vol", "frac"]);
      if (choice === "pct") {
        const p = pick(r, [10, 20, 25]);
        const n = pick(r, [40, 80, 100]);
        return {
          task: `Намери ${p}% от ${n}.`,
          hint: `${n}×${p}/100.`,
          answer: String((n * p) / 100),
        };
      }
      if (choice === "vol") {
        const a = irand(r, 2, 9);
        return {
          task: `Куб с ръб ${a} см — намери обема.`,
          hint: `${a}³.`,
          answer: String(a * a * a),
        };
      }
      const a = irand(r, 1, 5);
      const b = pick(r, [2, 4, 5]);
      const val = a / b;
      const s = String(Number(val.toFixed(4))).replace(/0+$/, "").replace(/\.$/, "");
      return {
        task: `Запиши ${a}/${b} като десетична дроб.`,
        hint: `${a} ÷ ${b}.`,
        answer: s.replace(".", ","),
        answers: [s],
      };
    },
  };
  const make = makers[focus] || makers.mixed;
  return pack(lessonId, {
    easy: () => Array.from({ length: 5 }, make),
    medium: () => Array.from({ length: 5 }, make),
    hard: () => Array.from({ length: 5 }, make),
  });
}


// --- Curriculum outline ---

const OUTLINE = [
  {
    id: "term-1",
    title: "Първи срок",
    summary: "Натурални числа, делимост, обикновени и десетични дроби.",
    units: [
      {
        id: "u-natural",
        title: "Натурални числа и действия",
        summary: "Преговор и свойства на аритметичните действия.",
        lessons: [
          ["l-nat-1", "Натурални числа — преговор", "Събиране, изваждане, умножение и деление с естествени числа.", () => naturalOps("l-nat-1", 101)],
          ["l-nat-2", "Свойства на действията", "Комутативно, асоциативно и разпределително свойство.", () => properties("l-nat-2", 102)],
          ["l-nat-3", "Числови изрази и ред на действията", "Скоби и приоритет на операциите.", () => naturalOps("l-nat-3", 103)],
        ],
      },
      {
        id: "u-div",
        title: "Делимост",
        summary: "Признаци за делимост, НОД и НОК.",
        lessons: [
          ["l-div-1", "Делимост на 2, 5 и 10", "Признаци за делимост с 2, 5 и 10.", () => divisibility("l-div-1", 201, [2, 5, 10])],
          ["l-div-2", "Делимост на 3 и 9", "Сума от цифрите и признаци за 3 и 9.", () => divisibility("l-div-2", 202, [3, 9])],
          ["l-div-3", "НОД и НОК", "Най-голям общ делител и най-малко общо кратно.", () => gcdLcm("l-div-3", 203)],
        ],
      },
      {
        id: "u-frac",
        title: "Обикновени дроби",
        summary: "Понятие, сравняване, действия с дроби и смесени числа.",
        lessons: [
          ["l-frac-1", "Понятие за обикновена дроб", "Част от цяло, числител и знаменател.", () => fractionConcept("l-frac-1", 301)],
          ["l-frac-2", "Сравняване на дроби", "Еднакви и различни знаменатели.", () => compareFractions("l-frac-2", 302)],
          ["l-frac-3", "Събиране и изваждане с еднакъв знаменател", "Основни действия с дроби.", () => addSubSameDen("l-frac-3", 303)],
          ["l-frac-4", "Събиране и изваждане с различен знаменател", "Общ знаменател и опростяване.", () => addSubDiffDen("l-frac-4", 304)],
          ["l-frac-5", "Умножение на дроби", "Умножение на обикновени дроби и цели числа.", () => multiplyFractions("l-frac-5", 305)],
          ["l-frac-6", "Деление на дроби", "Деление чрез умножение с Reciprocal.", () => divideFractions("l-frac-6", 306)],
          ["l-frac-7", "Смесени числа", "Преобразуване и действия със смесени числа.", () => mixedNumbers("l-frac-7", 307)],
        ],
      },
      {
        id: "u-dec",
        title: "Десетични дроби",
        summary: "Запис, сравняване и аритметика с десетични дроби.",
        lessons: [
          ["l-dec-1", "Понятие за десетична дроб", "Десети и стотни.", () => decimalConcept("l-dec-1", 401)],
          ["l-dec-2", "Сравняване на десетични дроби", "Поразредно сравняване.", () => compareDecimals("l-dec-2", 402)],
          ["l-dec-3", "Събиране и изваждане на десетични", "Подравняване на запетаята.", () => addSubDecimals("l-dec-3", 403)],
          ["l-dec-4", "Умножение на десетични дроби", "Брой знаци след запетаята.", () => mulDecimals("l-dec-4", 404)],
          ["l-dec-5", "Деление на десетични дроби", "Деление на цяло и на десетично.", () => divDecimals("l-dec-5", 405)],
          ["l-dec-6", "Връзка между обикновени и десетични дроби", "Преобразуване в двете посоки.", () => convertFracDec("l-dec-6", 406)],
          ["l-dec-7", "Сроков преговор — дроби", "Комбинирани задачи от срока.", () => review("l-dec-7", 407, "fractions")],
        ],
      },
    ],
  },
  {
    id: "term-2",
    title: "Втори срок",
    summary: "Проценти, геометрия, мерни единици, координати и данни.",
    units: [
      {
        id: "u-percent",
        title: "Проценти",
        summary: "Понятие за процент и намиране на процент от число.",
        lessons: [
          ["l-pct-1", "Понятие за процент", "Процентът като стотна част.", () => percentIntro("l-pct-1", 501)],
          ["l-pct-2", "Намиране на процент от число", "Практични задачи с отстъпки и части.", () => percentOf("l-pct-2", 502)],
        ],
      },
      {
        id: "u-geo-angles",
        title: "Геометрия — лъчи и ъгли",
        summary: "Основни геометрични фигури и видове ъгли.",
        lessons: [
          ["l-ang-1", "Точка, права, лъч, отсечка", "Основни понятия.", () => angles("l-ang-1", 601, "ray")],
          ["l-ang-2", "Видове ъгли", "Остър, прав, тъп, изправен.", () => angles("l-ang-2", 602, "types")],
          ["l-ang-3", "Съседни и вертикални ъгли", "Връзки между ъгли при пресичане.", () => angles("l-ang-3", 603, "types")],
        ],
      },
      {
        id: "u-geo-tri",
        title: "Триъгълници",
        summary: "Неравенство, видове и ъгли в триъгълника.",
        lessons: [
          ["l-tri-1", "Триъгълник — основни свойства", "Страни и неравенство на триъгълника.", () => triangles("l-tri-1", 701, "basic")],
          ["l-tri-2", "Видове триъгълници", "По страни и по ъгли.", () => triangles("l-tri-2", 702, "types")],
          ["l-tri-3", "Ъгли в триъгълника", "Сбор 180° и задачи.", () => triangles("l-tri-3", 703, "basic")],
        ],
      },
      {
        id: "u-geo-quad",
        title: "Четириъгълници и лица",
        summary: "Успоредник, правоъгълник, квадрат, периметър и лице.",
        lessons: [
          ["l-quad-1", "Четириъгълник и успоредник", "Основни свойства.", () => quads("l-quad-1", 801, "para")],
          ["l-quad-2", "Правоъгълник и квадрат", "Периметър и лице.", () => quads("l-quad-2", 802, "rect")],
          ["l-quad-3", "Периметър на фигури", "Практични задачи с периметър.", () => perimeter("l-quad-3", 803)],
          ["l-quad-4", "Лице на правоъгълник и квадрат", "Изчисляване на лица.", () => area("l-quad-4", 804, "rect")],
          ["l-quad-5", "Лице на триъгълник", "Основа и височина.", () => area("l-quad-5", 805, "triangle")],
        ],
      },
      {
        id: "u-measure",
        title: "Мерни единици и обем",
        summary: "Преобразуване на единици и обем на тела.",
        lessons: [
          ["l-meas-1", "Единици за дължина и лице", "Преобразуване m, cm, km, m².", () => units("l-meas-1", 901)],
          ["l-meas-2", "Обем на куб и паралелепипед", "Въведение в обема.", () => volume("l-meas-2", 902)],
        ],
      },
      {
        id: "u-coord-data",
        title: "Координати, уравнения и данни",
        summary: "Равнина, прости уравнения и четене на данни.",
        lessons: [
          ["l-coord-1", "Координатна система", "Точки в I квадрант.", () => coordinates("l-coord-1", 1001)],
          ["l-eq-1", "Прости уравнения", "Намиране на неизвестно число.", () => equations("l-eq-1", 1002)],
          ["l-data-1", "Диаграми и средна стойност", "Четене на таблици и диаграми.", () => dataCharts("l-data-1", 1003)],
          ["l-mix-1", "Комбинирани задачи", "Смесени ситуации от целия материал.", () => wordProblems("l-mix-1", 1004)],
          ["l-rev-1", "Годишен преговор — числа", "Дроби, десетични и проценти.", () => review("l-rev-1", 1005, "decimals")],
          ["l-rev-2", "Годишен преговор — геометрия", "Периметър, лице и обем.", () => review("l-rev-2", 1006, "geometry")],
          ["l-rev-3", "Годишен преговор — всичко заедно", "Смесен лов за края на годината.", () => review("l-rev-3", 1007, "mixed")],
        ],
      },
    ],
  },
];

function buildCatalog() {
  let order = 0;
  const terms = OUTLINE.map((term) => ({
    id: term.id,
    title: term.title,
    summary: term.summary,
    units: term.units.map((unit) => ({
      id: unit.id,
      title: unit.title,
      summary: unit.summary,
      lessons: unit.lessons.map(([id, title, summary, buildLevels]) => {
        order += 1;
        return {
          id,
          order,
          title,
          summary,
          levels: buildLevels(),
        };
      }),
    })),
  }));

  return {
    version: 1,
    grade: "5. клас",
    title: "Математика · пълна учебна година",
    description:
      "Каталог от ловни маршрути по уроци за българския 5. клас — срокове, теми, нива и станции със задачи.",
    terms,
  };
}

function stats(catalog) {
  let lessons = 0;
  let levels = 0;
  let stations = 0;
  for (const term of catalog.terms) {
    for (const unit of term.units) {
      for (const lesson of unit.lessons) {
        lessons += 1;
        for (const level of lesson.levels) {
          levels += 1;
          stations += level.stations.length;
        }
      }
    }
  }
  return { terms: catalog.terms.length, units: catalog.terms.reduce((n, t) => n + t.units.length, 0), lessons, levels, stations };
}

const catalog = buildCatalog();
const outDir = path.join(process.cwd(), "src/data");
mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, "curriculum.json");
writeFileSync(outFile, JSON.stringify(catalog));
console.log("Wrote", outFile);
console.log("Stats", stats(catalog));
