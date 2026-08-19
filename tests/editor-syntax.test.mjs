// Синтаксис исходников: любая незакрытая шаблонная строка или скобка обязана
// падать здесь, а не в проде. Поводом стал CSS печати — он собирается в
// шаблонной строке, и обратная кавычка внутри комментария обрывала её,
// после чего кнопка «Печать» молча переставала работать.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Дизайн-песочницы исключены из сборки (tsconfig `exclude` + .gitignore).
const SKIP_DIRS = new Set([
  "node_modules",
  "NewProfileDesign",
  "DesignTaskCode",
  "NewDesignAccess",
  "NewChatDesign",
  "hrkm",
]);

const collect = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (SKIP_DIRS.has(entry.name)) return [];
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return collect(full);
    return /\.tsx?$/.test(entry.name) ? [full] : [];
  });

const files = collect(path.join(ROOT, "src"));

test("исходники src разбираются компилятором TypeScript", () => {
  assert.ok(files.length > 100, "файлы не найдены — проверь путь к src");

  const broken = [];
  files.forEach((file) => {
    const text = fs.readFileSync(file, "utf8");
    const source = ts.createSourceFile(
      file,
      text,
      ts.ScriptTarget.ESNext,
      true,
      file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );
    (source.parseDiagnostics || []).forEach((d) => {
      const { line } = source.getLineAndCharacterOfPosition(d.start ?? 0);
      broken.push(
        `${path.relative(ROOT, file)}:${line + 1} — ${ts.flattenDiagnosticMessageText(d.messageText, " ")}`,
      );
    });
  });

  assert.deepEqual(broken, [], `синтаксические ошибки:\n${broken.join("\n")}`);
});
