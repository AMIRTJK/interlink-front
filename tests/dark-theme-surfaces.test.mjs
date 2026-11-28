// Тёмные поверхности (фоны, рамки, разделители) во всех модулях берутся из
// уровней темы `th-deep / th-base / th-raised / th-high / th-higher`, а не из
// серых палитр Tailwind. Иначе модуль выпадает из общего вида: «Мои задачи» на
// zinc были нейтрально-серыми среди сине-серых соседей и не следовали теме.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

const walk = (dir, out = []) => {
  for (const name of fs.readdirSync(path.join(ROOT, dir))) {
    const rel = path.posix.join(dir, name);
    if (fs.statSync(path.join(ROOT, rel)).isDirectory()) walk(rel, out);
    else if (/\.(tsx|ts)$/.test(name)) out.push(rel);
  }
  return out;
};

// Экраны до входа: пользователь ещё без темы, у них свой фиксированный «космос».
const EXEMPT = new Set([
  "src/pages/Auth/Auth.tsx",
  "src/widgets/AuthWelcome/ui.tsx",
  "src/widgets/AuthWelcome/ui/WelcomePreview.tsx",
]);

const SOURCES = walk("src")
  .filter((rel) => !EXEMPT.has(rel))
  .map((rel) => ({ rel, text: read(rel) }));

const isComment = (line) => /^\s*(\/\/|\/?\*)/.test(line);

const GREY = "(?:zinc|slate|gray|neutral|stone)";
const SURFACE_UTIL = "(?:bg|border(?:-[trblxy])?|ring|divide|outline|from|via|to)";
const DARK_SHADES = "(?:600|700|750|800|850|900|950)";

const findAll = (re) =>
  SOURCES.flatMap(({ rel, text }) =>
    text.split("\n").flatMap((line, i) => {
      const hits = isComment(line) ? null : line.match(re);
      return hits ? hits.map((hit) => `${rel}:${i + 1}  ${hit.trim()}`) : [];
    }),
  );

test("dark:-поверхности не используют серые палитры Tailwind", () => {
  const re = new RegExp(`dark:(?:[a-z-]+:)*${SURFACE_UTIL}-${GREY}-${DARK_SHADES}(?![0-9])`, "g");
  const hits = findAll(re);
  assert.deepEqual(hits, [], "замените на dark:bg-th-raised / dark:border-th-high и т.п.:\n" + hits.join("\n"));
});

test("тёмные поверхности в JS-условиях (isDark ? ...) тоже на уровнях темы", () => {
  const re = new RegExp(`(?:^|[\\s"'\`{(])(?:(?!dark:)[a-z-]+:)*${SURFACE_UTIL}-${GREY}-${DARK_SHADES}(?![0-9])`, "g");
  const hits = findAll(re).filter((hit) => !/dark:/.test(hit.split("  ")[1]));
  assert.deepEqual(hits, [], "замените на bg-th-raised / border-th-high и т.п.:\n" + hits.join("\n"));
});

test("тёмные hex-поверхности не зашиты в классы", () => {
  const re = /(?:bg|border(?:-[trblxy])?)-\[#(?:020617|09090b|0f172a|111827|18181b|1e293b|1f2937|27272a|334155|374151|3f3f46)\]/gi;
  const hits = findAll(re);
  assert.deepEqual(hits, [], "используйте уровни темы th-*:\n" + hits.join("\n"));
});

// Акцент (кнопки, активные пункты, ссылки, фокус) — шкала темы `th-accent-N`.
// blue/indigo оставлены только в справочниках смысловых цветов (статусы, роли,
// приоритеты): строки вида `ключ: "…"`. Иначе при смене темы элемент остаётся синим.
const MAP_ENTRY = /^\s*(?:["'][^"']+["']|[\p{L}_$][\p{L}\p{N}_$]*)\s*:\s*[{"'`]/u;
const ACCENT_EXEMPT = ["src/shared/config/", "src/widgets/layout/ui/designSettings.ts",
  "src/features/Profile/ui/tabs/files/FileCardCover.tsx", "src/features/Profile/ui/tabs/files/StorageUsage.tsx",
  "src/features/Profile/ui/tabs/mockData.ts", "src/widgets/CreateInternalCorrespondence/lib/constants.ts",
  "src/features/Login/"];

test("акцентные цвета берутся из темы (th-accent-N), а не из blue/indigo", () => {
  const re = /(?:^|[\s"'`{(])(?:[a-z0-9-]+:)*(?:bg|text|border(?:-[trblxy])?|ring|from|via|to|outline|fill|stroke|shadow|caret|accent|divide|placeholder)-(?:indigo|blue)-\d{2,3}(?![0-9])/g;
  const hits = SOURCES.filter(({ rel }) => !ACCENT_EXEMPT.some((p) => rel.startsWith(p))).flatMap(({ rel, text }) =>
    text.split("\n").flatMap((line, i) => {
      if (isComment(line) || (MAP_ENTRY.test(line) && !/className/.test(line))) return [];
      const found = line.match(re);
      return found ? found.map((hit) => `${rel}:${i + 1}  ${hit.trim()}`) : [];
    }),
  );
  assert.deepEqual(hits, [], "замените на th-accent-N:\n" + hits.join("\n"));
});

test("акцентный hex не зашит в классы", () => {
  const re = /-\[#(?:3373e5|2563eb|3b82f6|4f46e5|6366f1|1d4ed8|60a5fa|818cf8|4338ca)\]/gi;
  const hits = findAll(re).filter((hit) => {
    const [rel, rest] = hit.split(/:(\d+) {2}/);
    if (ACCENT_EXEMPT.some((p) => rel.startsWith(p))) return false;
    const line = read(rel).split("\n")[Number(rest) - 1] ?? "";
    return !(MAP_ENTRY.test(line) && !/className/.test(line));
  });
  assert.deepEqual(hits, [], "замените на th-accent-N:\n" + hits.join("\n"));
});

test("уровни темы объявлены цветами Tailwind и питают тёмное стекло", () => {
  const theme = read("src/app/styles/theme.css");
  for (const level of ["deep", "base", "raised", "high", "higher"]) {
    assert.match(theme, new RegExp(`--th-dark-${level}:`), `нет --th-dark-${level}`);
    assert.match(theme, new RegExp(`--color-th-${level}: var\\(--th-dark-${level}\\)`), `нет цвета th-${level}`);
  }
  const glass = read("src/app/styles/glass.css");
  assert.match(glass, /\.glass-ui\.dark\s*{[^}]*var\(--th-dark-base\)/, "тёмное стекло не на уровнях темы");
});
