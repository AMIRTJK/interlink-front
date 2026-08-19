// Базовый кегль документа. Состояние `fontSize` в редакторе показывает размер
// ПОД КАРЕТКОЙ: оно меняется при каждом движении курсора. Пока предпросмотр,
// печать и эскизы брали его как базовый размер документа, весь текст
// пересчитывался кеглем случайного слова и расходился с холстом.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

const WIDGET = "src/widgets/CreateInternalCorrespondence";
const SCREEN = `${WIDGET}/ui/CreateInternalCorrespondence.tsx`;
const SURFACE = `${WIDGET}/ui/createInternalCorrespondence/EditorSurface.tsx`;

const { EDITOR_BASE_FONT_SIZE } = await import(`../${WIDGET}/lib/constants.ts`);

test("базовый кегль объявлен один раз и равен кеглю холста", () => {
  assert.equal(EDITOR_BASE_FONT_SIZE, 14);
  assert.match(read(SURFACE), /fontSize: `\$\{EDITOR_BASE_FONT_SIZE\}px`/);
});

test("шаг табуляции холста не разъезжается с остальными режимами", () => {
  assert.equal(
    read(SURFACE).includes("tabSize"),
    false,
    "шаг табуляции снова задан только на холсте — предпросмотр и печать разойдутся",
  );
});
test("холст не получает кегль каретки", () => {
  assert.equal(
    /fontSize\s*[:=]\s*["'`]?\d+px/.test(read(SURFACE)),
    false,
    "кегль холста снова зашит числом — печать и предпросмотр разойдутся с ним",
  );
});

test("предпросмотр, печать, эскизы и сравнение версий берут базовый кегль", () => {
  const screen = read(SCREEN);

  assert.equal(
    screen.includes("Number(fontSize) || 14"),
    false,
    "кегль под кареткой снова уходит в документ как базовый",
  );

  const fromCaret = screen.match(/fontSize=\{fontSize\}/g) || [];
  assert.equal(
    fromCaret.length,
    1,
    "кегль под кареткой нужен только панели форматирования",
  );

  const fromBase = screen.match(/fontSize=\{EDITOR_BASE_FONT_SIZE\}/g) || [];
  assert.ok(
    fromBase.length >= 3,
    `базовый кегль ждали у предпросмотра, эскизов и сравнения версий, нашли ${fromBase.length}`,
  );

  assert.match(
    screen,
    /fontSize: String\(EDITOR_BASE_FONT_SIZE\)/,
    "печать должна получать базовый кегль документа",
  );
});
