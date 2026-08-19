// Оформление тела документа обязано быть одинаковым на холсте редактора, в
// предпросмотре, при печати и в выгрузке PDF. Источник правды один —
// shared/styles/document-body.css; печать и PDF подмешивают его в свой iframe.
//
// Проверяем не текст файлов, а СОБРАННЫЙ CSS листа: шаблонная строка печати
// рвалась от обратной кавычки в комментарии, и лист оставался без правил.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

const SHARED_CSS = "src/shared/styles/document-body.css";
const GLOBAL_CSS = "src/app/styles/global.css";
const PRINT =
  "src/widgets/CreateInternalCorrespondence/ui/createInternalCorrespondence/printDocument.ts";
const PDF =
  "src/widgets/InternalCorrespondenceIncomingView/incomingViewLib/downloadDocumentPdf.ts";

// Текст шаблонной строки с таблицей стилей листа — ровно так, как его увидит
// браузер. Если строку оборвала обратная кавычка, сюда попадёт огрызок.
const styleTemplateOf = (rel) => {
  const source = ts.createSourceFile(
    rel,
    read(rel),
    ts.ScriptTarget.ESNext,
    true,
  );
  const found = [];
  const visit = (node) => {
    if (
      ts.isTemplateExpression(node) ||
      ts.isNoSubstitutionTemplateLiteral(node)
    ) {
      const text = node.getText(source);
      if (text.includes("@page")) found.push(text);
    }
    node.forEachChild(visit);
  };
  visit(source);
  assert.equal(
    found.length,
    1,
    `${rel}: ожидалась одна таблица стилей листа, найдено ${found.length}`,
  );
  return found[0];
};

test("общий CSS документа содержит правила, из-за которых расходились режимы", () => {
  const css = read(SHARED_CSS);

  // Списки: маркеры и отступ (preflight Tailwind их гасит).
  assert.match(
    css,
    /\.doc-preview-content ul,\s*\.doc-preview-content ol \{[^}]*padding-left: 1\.5em/,
  );
  assert.match(css, /\.doc-preview-content ul \{\s*list-style-type: disc/);
  assert.match(css, /\.doc-preview-content ul ul \{\s*list-style-type: circle/);
  assert.match(
    css,
    /\.doc-preview-content ul ul ul \{\s*list-style-type: square/,
  );
  assert.match(css, /\.doc-preview-content ol \{\s*list-style-type: decimal/);
  assert.match(
    css,
    /\.doc-preview-content ol ol \{\s*list-style-type: lower-alpha/,
  );
  assert.match(
    css,
    /\.doc-preview-content ol ol ol \{\s*list-style-type: lower-roman/,
  );

  // Базовая линия preflight: в iframe печати её нет, и браузер добавляет свои
  // поля абзацам и заголовкам — из-за этого напечатанный текст «плыл».
  assert.match(css, /:where\(\*\) \{[^}]*margin: 0;[^}]*padding: 0;/s);
  assert.match(
    css,
    /:where\(h1, h2, h3, h4, h5, h6\) \{[^}]*font-size: inherit/s,
  );

  // Шаг табуляции документа: без него предпросмотр и печать разбивают строки
  // с табуляцией не так, как холст.
  assert.match(css, /\.doc-preview-content \{\s*tab-size: 1\.27cm/);
  // Пустой абзац — ровно одна строка.
  assert.match(css, /min-height: 1lh/);

  // Слой обязателен: правила должны перебивать preflight, но проигрывать
  // утилитам холста (иначе, например, у ячеек таблицы пропадут отступы).
  assert.match(css, /@layer base \{/);
});

test("приложение берёт оформление документа из общего файла", () => {
  const css = read(GLOBAL_CSS);
  assert.match(css, /@import "\.\.\/\.\.\/shared\/styles\/document-body\.css";/);
  assert.equal(
    css.includes(".doc-preview-content"),
    false,
    "правила тела документа снова разъехались по global.css",
  );
});

[
  { rel: PRINT, page: /class="page doc-preview-content"/ },
  { rel: PDF, page: /class="content doc-preview-content"/ },
].forEach(({ rel, page }) => {
  const name = path.basename(rel);

  test(`${name}: подключает общий CSS документа`, () => {
    assert.match(
      read(rel),
      /import documentBodyCss from "@shared\/styles\/document-body\.css\?inline";/,
    );
  });

  test(`${name}: таблица стилей листа собирается целиком`, () => {
    const style = styleTemplateOf(rel);
    // Проверяем строку от головы до хвоста: общий CSS документа идёт первым,
    // геометрия листа и служебные правила — после него. Обратная кавычка в
    // комментарии обрывает шаблонную строку и один из концов пропадает —
    // ровно так и умирала кнопка «Печать».
    assert.match(style, /\$\{documentBodyCss\}/, "нет общего CSS документа");
    assert.match(style, /@page \{/, "нет описания листа");
    assert.match(style, /\.page \{/, "нет геометрии страницы");
    assert.match(
      style,
      /\[data-page-spacer\] \{ display: none !important; \}/,
      "нет хвоста таблицы стилей — строка оборвана",
    );
  });

  test(`${name}: базовое оформление не продублировано на листе`, () => {
    const style = styleTemplateOf(rel);
    // Дубль этих правил — ровно тот случай, когда печать со временем
    // расходится с холстом. Точечные исключения (обнуление высоты строки
    // внутри штампа ЭЦП) к базовому оформлению не относятся.
    assert.equal(
      /list-style/.test(style),
      false,
      "дубль правил списка разъедется с холстом",
    );
    assert.equal(
      /min-height:\s*(1lh|1\.8em)/.test(style),
      false,
      "дубль высоты строки разъедется с холстом",
    );
  });

  test(`${name}: страница помечена классом тела документа`, () => {
    assert.match(read(rel), page);
  });
});
