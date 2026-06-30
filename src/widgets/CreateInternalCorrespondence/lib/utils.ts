import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { TJK_EMBLEM_DATA_URI } from "./tjkEmblem";

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

// Экранирование пользовательского текста для безопасной вставки в SVG/XML.
const escapeXml = (s: string): string =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export interface DSStampData {
  name: string;
  certSerial: string;
  signedAt: string;
  validUntil: string;
}

// Уникальные id для clipPath/symbol внутри одного документа: при нескольких
// инлайновых штампах на странице (блоки «Подписывающий», «Согласующие») общие
// id привели бы к конфликту ссылок url(#…) — поэтому делаем их разными.
let dsStampSeq = 0;

// Единый SVG-рисунок штампа ЭЦП во вьюбоксе 320×110 — ОДИН источник правды для:
//  • React-компонента <DSStamp> (плейсхолдер до подписи, блоки «Подписывающий»/
//    «Согласующие», приложение №1, предпросмотр);
//  • картинки, вшиваемой в тело письма при подписании (редактор и печать).
// Благодаря общему viewBox штамп везде одной формы и высоты. Сам SVG тянется на
// 100% ширины контейнера с сохранением пропорций (aspect-ratio задаёт обёртка).
export function buildDSStampSvg({
  name,
  certSerial,
  signedAt,
  validUntil,
}: DSStampData): string {
  const flagInner = tajikFlagInnerSvg();
  const uid = `ds${(++dsStampSeq).toString(36)}`;
  const clip = `${uid}c`;
  const match = validUntil.match(/(?:аз|from|с)?\s*([\d.]+)\s*(?:то|to|по|-)\s*([\d.]+)/i);
  const fromDate = match ? match[1] : "30.03.2026";
  const toDate = match ? match[2] : "30.03.2027";
  const escName = escapeXml(name);
  const escSerial = escapeXml(certSerial);
  const escSignedAt = escapeXml(signedAt);
  const escFromDate = escapeXml(fromDate);
  const escToDate = escapeXml(toDate);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 377 112" preserveAspectRatio="xMidYMid meet" fill="none" style="display:block;width:100%;height:100%;">` +
    `<defs>` +
    `<clipPath id="${clip}"><rect x="0.5" y="0.5" width="376" height="111" rx="8"/></clipPath>` +
    `<linearGradient id="${uid}hg" x1="0" y1="0" x2="377" y2="0" gradientUnits="userSpaceOnUse">` +
    `<stop offset="0%" stop-color="#ff6b00" stop-opacity="0"/>` +
    `<stop offset="20%" stop-color="#ff6b00" stop-opacity="1"/>` +
    `<stop offset="50%" stop-color="#ffb800" stop-opacity="1"/>` +
    `<stop offset="80%" stop-color="#ff6b00" stop-opacity="1"/>` +
    `<stop offset="100%" stop-color="#ff6b00" stop-opacity="0"/>` +
    `</linearGradient>` +
    `<linearGradient id="${uid}bg" x1="0" y1="0" x2="377" y2="112" gradientUnits="userSpaceOnUse">` +
    `<stop offset="0%" stop-color="#2c2c2c"/>` +
    `<stop offset="100%" stop-color="#222222"/>` +
    `</linearGradient>` +
    `<linearGradient id="${uid}vg" x1="0" y1="0" x2="0" y2="40" gradientUnits="userSpaceOnUse">` +
    `<stop offset="0%" stop-color="#ff6b00" stop-opacity="0"/>` +
    `<stop offset="50%" stop-color="#ffb800" stop-opacity="0.3"/>` +
    `<stop offset="100%" stop-color="#ff6b00" stop-opacity="0"/>` +
    `</linearGradient>` +
    `</defs>` +
    `<g clip-path="url(#${clip})">` +
    `<rect x="0.5" y="0.5" width="376" height="111" rx="8" fill="url(#${uid}bg)" stroke="#ff6b00" stroke-width="1" stroke-opacity="0.3"/>` +
    `<rect x="0" y="0" width="377" height="3" fill="url(#${uid}hg)"/>` +
    `<g transform="translate(260, 20) scale(4)" opacity="0.055">` +
    `<path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" stroke="#ffb800" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>` +
    `<path d="M14 13.12c0 2.38 0 6.38-1 8.88" stroke="#ffb800" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>` +
    `<path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" stroke="#ffb800" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>` +
    `<path d="M2 12a10 10 0 0 1 18-6" stroke="#ffb800" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>` +
    `<path d="M2 16h.01" stroke="#ffb800" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>` +
    `<path d="M21.8 16c.2-2 .131-5.354 0-6" stroke="#ffb800" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>` +
    `<path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" stroke="#ffb800" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>` +
    `<path d="M8.65 22c.21-.66.45-1.32.57-2" stroke="#ffb800" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>` +
    `<path d="M9 6.8a6 6 0 0 1 9 5.2v2" stroke="#ffb800" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>` +
    `</g>` +
    `<g transform="translate(12, 7) scale(0.47)">${flagInner}</g>` +
    `<text x="36" y="13.5" font-family="Arial, sans-serif" font-size="8" font-weight="700" fill="#ffffff" letter-spacing="0.96">INFRATECH</text>` +
    `<text x="36" y="18" font-family="Arial, sans-serif" font-size="4" font-weight="400" fill="#ffb800" letter-spacing="0.6">ҲУВИЯТИ РАҚАМӢ</text>` +
    `<text x="304" y="15" font-family="Arial, sans-serif" font-size="5" font-weight="700" fill="#ffffff" fill-opacity="0.45" text-anchor="middle">EN</text>` +
    `<text x="320" y="15" font-family="Arial, sans-serif" font-size="5" font-weight="700" fill="#ffffff" fill-opacity="0.45" text-anchor="middle">RU</text>` +
    `<rect x="330" y="9" width="16" height="8" rx="4" fill="url(#${uid}hg)"/>` +
    `<text x="338" y="15" font-family="Arial, sans-serif" font-size="5" font-weight="700" fill="#111111" text-anchor="middle">TJ</text>` +
    `<text x="12" y="31" font-family="Arial, sans-serif" font-size="6" font-weight="500" fill="#ffb800" letter-spacing="1.32">СОҲИБИ СЕРТИФИКАТ</text>` +
    `<text x="12" y="43" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#ffffff" letter-spacing="-0.1">${escName}</text>` +
    `<text x="12" y="51" font-family="Arial, sans-serif" font-size="6" fill="#ffffff" fill-opacity="0.3" letter-spacing="0.9">ИМЗОИ ЭЛЕКТРОНИИ РАҚАМӢ</text>` +
    `<rect x="0" y="55" width="377" height="1" fill="url(#${uid}hg)"/>` +
    `<text x="12" y="65" font-family="Arial, sans-serif" font-size="6" font-weight="600" fill="#ff6b00">РАҚАМИ СЕРТИФИКАТ</text>` +
    `<rect x="12" y="69" width="164" height="12" rx="2" fill="#ffffff" fill-opacity="0.04" stroke="#ff6b00" stroke-width="0.5" stroke-opacity="0.2"/>` +
    `<text x="16" y="77.5" font-family="monospace" font-size="6.5" fill="#ffffff" fill-opacity="0.6">${escSerial}</text>` +
    `<text x="12" y="89" font-family="Arial, sans-serif" font-size="6" font-weight="600" fill="#ff6b00">САНАИ ДОДАН</text>` +
    `<g transform="translate(12, 92) scale(0.35)">` +
    `<path d="M8 2v4 M16 2v4" stroke="#ffd166" stroke-width="2" stroke-linecap="round" fill="none"/>` +
    `<rect width="18" height="18" x="3" y="4" rx="2" stroke="#ffd166" stroke-width="2" fill="none"/>` +
    `<path d="M3 10h18" stroke="#ffd166" stroke-width="2" fill="none"/>` +
    `</g>` +
    `<text x="22" y="99.5" font-family="Arial, sans-serif" font-size="9" font-weight="700" fill="#ffffff" letter-spacing="0.36">${escSignedAt}</text>` +
    `<rect x="188" y="61" width="1" height="39" fill="url(#${uid}vg)"/>` +
    `<text x="200" y="65" font-family="Arial, sans-serif" font-size="6" font-weight="600" fill="#ff6b00">МӮҲЛАТИ ЭЪТИБОР</text>` +
    `<text x="200" y="73" font-family="Arial, sans-serif" font-size="6" fill="#ffffff" fill-opacity="0.4">аз</text>` +
    `<text x="200" y="81.5" font-family="Arial, sans-serif" font-size="9" font-weight="700" fill="#ffffff" letter-spacing="0.36">${escFromDate}</text>` +
    `<line x1="252" y1="78" x2="270" y2="78" stroke="#ff6b00" stroke-width="0.5" stroke-opacity="0.3"/>` +
    `<text x="277" y="73" font-family="Arial, sans-serif" font-size="6" fill="#ffffff" fill-opacity="0.4">то</text>` +
    `<text x="277" y="81.5" font-family="Arial, sans-serif" font-size="9" font-weight="700" fill="#ffffff" letter-spacing="0.36">${escToDate}</text>` +
    `<g transform="translate(200, 88) scale(0.55)">` +
    `<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" stroke="#ff6b00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>` +
    `<path d="m9 12 2 2 4-4" stroke="#ff6b00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>` +
    `</g>` +
    `<text x="214" y="93.5" font-family="Arial, sans-serif" font-size="7" font-weight="700" fill="#ffd166">ACTIVE &amp; VERIFIED</text>` +
    `<text x="214" y="99" font-family="Arial, sans-serif" font-size="6" fill="#ffffff" fill-opacity="0.35">TJ-Root Certificate Authority</text>` +
    `</g>` +
    `<rect x="0" y="104" width="377" height="1" fill="url(#${uid}hg)"/>` +
    `<rect x="0" y="105" width="377" height="7" fill="#000000" fill-opacity="0.22"/>` +
    `<g transform="translate(12, 106.5) scale(0.2)">` +
    `<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" stroke="#ff6b00" stroke-width="2" fill="none"/>` +
    `</g>` +
    `<text x="19.5" y="110" font-family="Arial, sans-serif" font-size="5" fill="#ffffff" fill-opacity="0.35">SECURED · ENCRYPTED · TAMPER-PROOF</text>` +
    `<g transform="translate(344, 106.5) scale(0.18)">` +
    `<rect width="18" height="11" x="3" y="11" rx="2" ry="2" stroke="#ffffff" stroke-opacity="0.22" stroke-width="2" fill="none"/>` +
    `<path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#ffffff" stroke-opacity="0.22" stroke-width="2" fill="none"/>` +
    `</g>` +
    `<g transform="translate(355, 106.5) scale(0.18)">` +
    `<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" stroke="#ffb800" stroke-width="2" fill="none"/>` +
    `<path d="M14 2v4a2 2 0 0 0 2 2h4" stroke="#ffb800" stroke-width="2" fill="none"/>` +
    `<path d="m9 15 2 2 4-4" stroke="#ffb800" stroke-width="2" fill="none"/>` +
    `</g>` +
    `</svg>`
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
