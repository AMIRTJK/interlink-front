import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Холст редактора — А4 при 96 DPI (794px ширина). Word измеряет в пунктах,
// поэтому переводим pt → px (1pt = 1/72in, 1px = 1/96in), чтобы размеры
// шрифтов и отступов физически совпадали с тем, что было в документе Word.
const PT_TO_PX = 96 / 72;

// Только эти свойства влияют на «внешний вид текста» и имеют смысл при переносе
// из Word. Всё, что управляет шириной/позиционированием контейнера (width,
// position, float, white-space:nowrap и т.п.), намеренно отбрасываем — иначе
// контент выходит за границы листа или ломает постраничную разбивку.
const KEEP_STYLE_PROPS = new Set([
  "font-weight",
  "font-style",
  "font-size",
  "font-family",
  "text-decoration",
  "text-decoration-line",
  "text-align",
  "text-indent",
  "vertical-align",
  "color",
  "background-color",
  "margin-top",
  "margin-bottom",
  "margin-left",
  "padding-left",
  "list-style-type",
]);

const BLOCK_TAGS = new Set([
  "p",
  "div",
  "table",
  "thead",
  "tbody",
  "tr",
  "td",
  "th",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "section",
  "hr",
  "br",
]);

const isBlockNode = (n: Node | null): boolean =>
  !!n &&
  n.nodeType === Node.ELEMENT_NODE &&
  BLOCK_TAGS.has((n as Element).tagName.toLowerCase());

const convertPtToPx = (value: string): string =>
  value.replace(
    /([\d.]+)\s*pt\b/gi,
    (_, n: string) => `${(parseFloat(n) * PT_TO_PX).toFixed(1)}px`,
  );

// Оставляем из инлайнового style только полезные для вёрстки текста свойства,
// переводя пункты в пиксели. Служебные mso-* и всё лишнее выкидываем.
const sanitizeStyle = (styleText: string): string => {
  const out: string[] = [];
  styleText.split(";").forEach((decl) => {
    const idx = decl.indexOf(":");
    if (idx === -1) return;
    const prop = decl.slice(0, idx).trim().toLowerCase();
    const rawVal = decl.slice(idx + 1).trim();
    if (!prop || !rawVal || prop.startsWith("mso-")) return;
    if (!KEEP_STYLE_PROPS.has(prop)) return;
    // Word нередко проставляет «пустые» рамочные значения — пропускаем их.
    if (/^(0|0px|0pt|normal|auto|none|inherit|initial)$/i.test(rawVal)) {
      if (prop !== "list-style-type") return;
    }
    out.push(`${prop}: ${convertPtToPx(rawVal)}`);
  });
  return out.join("; ");
};

/**
 * Приводит HTML из буфера обмена Word / результата конвертации .docx к виду,
 * который корректно ложится на А4-холст редактора:
 *  - убирает служебные теги/комментарии/неймспейсы Office (o:p, w:*, <style> …);
 *  - чистит атрибуты, оставляя из style только свойства оформления текста;
 *  - переводит размеры из pt в px (96 DPI), чтобы шрифты совпали с Word;
 *  - схлопывает «технические» пробелы и переводы строк форматирования Word
 *    (холст редактора форсирует white-space: pre-wrap, иначе они стали бы
 *    видимыми лишними пробелами и переносами).
 */
export function sanitizeWordHtml(html: string): string {
  const root = document.createElement("div");
  root.innerHTML = html;

  // 1. Условные комментарии Word (<!--[if gte mso 9]>…) и обычные комментарии.
  const commentWalker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_COMMENT,
  );
  const comments: Comment[] = [];
  while (commentWalker.nextNode())
    comments.push(commentWalker.currentNode as Comment);
  comments.forEach((c) => c.remove());

  // 2. Полностью вырезаем служебные теги вместе с содержимым.
  root
    .querySelectorAll("style, meta, link, title, script, xml")
    .forEach((n) => n.remove());

  // 3. Разворачиваем неймспейс-теги Office (o:p, w:sdt, v:shape …), сохраняя текст.
  root.querySelectorAll<HTMLElement>("*").forEach((el) => {
    if (el.tagName.includes(":")) {
      el.replaceWith(...Array.from(el.childNodes));
    }
  });

  // 3.5. Word/mammoth часто кладёт ВСЕ строки таблицы в <thead> с ячейками
  // <th> — браузер по умолчанию рисует их жирными и по центру, из-за чего
  // обычные строки выглядят как заголовки. Приводим к <tbody>/<td>; настоящие
  // заголовки остаются жирными за счёт <strong>, который mammoth уже проставил.
  root.querySelectorAll("th").forEach((th) => {
    const td = document.createElement("td");
    Array.from(th.attributes).forEach((a) => td.setAttribute(a.name, a.value));
    while (th.firstChild) td.appendChild(th.firstChild);
    th.replaceWith(td);
  });
  root.querySelectorAll("thead").forEach((thead) => {
    const tbody = document.createElement("tbody");
    while (thead.firstChild) tbody.appendChild(thead.firstChild);
    thead.replaceWith(tbody);
  });

  // 4. Чистим атрибуты у всех оставшихся элементов.
  root.querySelectorAll<HTMLElement>("*").forEach((el) => {
    // Маркеры разрыва страницы редактора (data-page-break) оставляем нетронутыми —
    // их вставляет импорт Word, и их служебные атрибуты/стиль удалять нельзя.
    if (el.hasAttribute("data-page-break")) return;

    // Устаревший атрибут align=... переносим в text-align (Word/буфер обмена
    // нередко выравнивает абзацы и ячейки именно так).
    const alignAttr = el.getAttribute("align");
    if (alignAttr && !/text-align/i.test(el.getAttribute("style") || "")) {
      el.style.textAlign = alignAttr;
    }

    Array.from(el.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();
      if (name === "style") {
        const cleaned = sanitizeStyle(attr.value);
        if (cleaned) el.setAttribute("style", cleaned);
        else el.removeAttribute("style");
      } else if (
        name !== "href" &&
        name !== "src" &&
        name !== "colspan" &&
        name !== "rowspan"
      ) {
        el.removeAttribute(name);
      }
    });
  });

  // 5. Нормализуем пробелы: переводы строк/табы → один пробел; пробельные узлы
  // на границе блоков (отступы между тегами из буфера) удаляем.
  const textWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  while (textWalker.nextNode())
    textNodes.push(textWalker.currentNode as Text);
  textNodes.forEach((t) => {
    const raw = t.textContent || "";
    let v = raw.replace(/[\t\r\n]+/g, " ").replace(/ {2,}/g, " ");
    if (!t.previousSibling || isBlockNode(t.previousSibling))
      v = v.replace(/^ +/, "");
    if (!t.nextSibling || isBlockNode(t.nextSibling)) v = v.replace(/ +$/, "");
    if (v === "") t.remove();
    else if (v !== raw) t.textContent = v;
  });

  return root.innerHTML;
}

// Пятиконечная звезда: путь SVG с центром (cx, cy) и внешним радиусом r.
function starPath(cx: number, cy: number, r: number): string {
  const inner = r * 0.4;
  let d = "";
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const x = (cx + rad * Math.cos(a)).toFixed(2);
    const y = (cy + rad * Math.sin(a)).toFixed(2);
    d += `${i === 0 ? "M" : "L"}${x},${y} `;
  }
  return `${d}Z`;
}

// Государственный флаг Республики Таджикистан для штампа ЭЦП: внутренняя
// разметка SVG во вьюбоксе 0 0 42 30 — три горизонтальные полосы (красная,
// белая, зелёная в пропорции 2:3:2) и золотая корона с дугой из семи звёзд по
// центру белой полосы. Единый источник правды и для React-компонента
// <TajikFlag>, и для SVG-строки штампа, которая вшивается картинкой в тело
// письма, — чтобы экранный и печатный штамп рисовались одинаково.
export function tajikFlagInnerSvg(): string {
  const W = 42;
  const H = 30;
  const red = (H * 2) / 7; // высота верхней красной полосы
  const greenY = (H * 5) / 7; // начало нижней зелёной полосы
  const gold = "#F8D80E";

  // Дуга из семи звёзд («радугой») над короной.
  const cx = 21;
  const arcCy = 15;
  const arcR = 4.8;
  let stars = "";
  for (let i = 0; i < 7; i++) {
    const a = Math.PI * (1 - i / 6); // π → 0, слева направо
    const sx = cx + arcR * Math.cos(a);
    const sy = arcCy - arcR * Math.sin(a);
    stars += `<path d="${starPath(sx, sy, 1.05)}" fill="${gold}"/>`;
  }

  // Стилизованная корона: перекладина-основание и три зубца с шариками.
  const crown =
    `<rect x="15" y="19.6" width="12" height="1.7" rx="0.7" fill="${gold}"/>` +
    `<path d="M15.5,19.8 L16,16.8 L18.5,18.3 L21,15.5 L23.5,18.3 L26,16.8 L26.5,19.8 Z" fill="${gold}"/>` +
    `<circle cx="16" cy="16.5" r="0.75" fill="${gold}"/>` +
    `<circle cx="21" cy="15.1" r="0.85" fill="${gold}"/>` +
    `<circle cx="26" cy="16.5" r="0.75" fill="${gold}"/>`;

  return (
    `<rect width="${W}" height="${H}" fill="#FFFFFF"/>` +
    `<rect width="${W}" height="${red}" fill="#CE1126"/>` +
    `<rect y="${greenY}" width="${W}" height="${H - greenY}" fill="#006B3F"/>` +
    stars +
    crown +
    `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="1.5" fill="none" stroke="#94a3b8" stroke-width="0.7"/>`
  );
}

export function generateQRMatrix(seed: string, size: number = 21): boolean[][] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  const matrix: boolean[][] = [];
  for (let row = 0; row < size; row++) {
    matrix[row] = [];
    for (let col = 0; col < size; col++) {
      const inTopLeft = row < 7 && col < 7,
        inTopRight = row < 7 && col >= size - 7,
        inBottomLeft = row >= size - 7 && col < 7;
      if (inTopLeft || inTopRight || inBottomLeft) {
        const r = inTopLeft ? row : inTopRight ? row : row - (size - 7),
          c = inTopLeft ? col : inTopRight ? col - (size - 7) : col;
        matrix[row][col] =
          r === 0 ||
          r === 6 ||
          c === 0 ||
          c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4);
      } else {
        matrix[row][col] =
          (((hash * (row + 1) * 31 + col * 17 + row * col * 7) ^
            (hash >> (row % 8))) &
            1) ===
          1;
      }
    }
  }
  return matrix;
}
