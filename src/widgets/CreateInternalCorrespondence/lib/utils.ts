import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { _axios, ApiRoutes } from "@shared/api";
import { getEnvVar } from "@shared/config";
import { toast } from "@shared/lib";
import type { AttachedFile } from "../types";
import { TJK_EMBLEM_DATA_URI } from "./tjkEmblem";
import { ORBITRON_WOFF2_BASE64 } from "./orbitronFont";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Вложения ──────────────────────────────────────────────────────────────────

export const formatFileSize = (bytes: number): string =>
  bytes > 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} МБ`
    : `${(bytes / 1024).toFixed(0)} КБ`;

export const mapServerAttachment = (
  raw: any,
  correspondenceId?: string | number,
): AttachedFile => {
  const name = raw?.original_name || raw?.name || "Файл";
  const size = Number(raw?.size);
  const id = String(raw?.id ?? name);

  let previewUrl = raw?.preview_url || raw?.previewUrl || undefined;
  let downloadUrl = raw?.download_url || raw?.downloadUrl || undefined;

  if (correspondenceId && raw?.id) {
    if (!downloadUrl) {
      downloadUrl = `/api/v1/internal-correspondences/${correspondenceId}/attachments/${raw.id}/download`;
    }
    if (!previewUrl) {
      previewUrl = `/api/v1/internal-correspondences/${correspondenceId}/attachments/${raw.id}/download?inline=1`;
    }
  }

  return {
    id,
    name,
    size: Number.isFinite(size) && size > 0 ? formatFileSize(size) : "",
    type: name.split(".").pop()?.toUpperCase() ?? "FILE",
    url: raw?.url || downloadUrl || undefined,
    previewUrl,
    downloadUrl,
  };
};

const toAbsoluteUrl = (url: string): string => {
  if (/^(https?:|blob:|data:)/i.test(url)) return url;
  const apiHost = (getEnvVar("VITE_API_URL") || "").replace(/\/+$/, "");
  return `${apiHost}/${url.replace(/^\/+/, "")}`;
};

const clickDownloadLink = (href: string, name: string, newTab = false) => {
  const link = document.createElement("a");
  link.href = href;
  link.download = name;
  if (newTab) {
    link.target = "_blank";
    link.rel = "noopener";
  }
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadAttachment = async (file: AttachedFile): Promise<void> => {
  const targetUrl = file.downloadUrl || file.url;
  if (!targetUrl) return;

  if (file.file) {
    clickDownloadLink(file.downloadUrl || file.url || "", file.name);
    return;
  }

  if (!targetUrl.includes("/api/")) {
    clickDownloadLink(toAbsoluteUrl(targetUrl), file.name, true);
    return;
  }

  try {
    const response = await _axios.get(toAbsoluteUrl(targetUrl), {
      responseType: "blob",
    });
    const blob = new Blob([response.data], {
      type: response.headers["content-type"] || "application/octet-stream",
    });
    const href = window.URL.createObjectURL(blob);
    clickDownloadLink(href, file.name);
    window.URL.revokeObjectURL(href);
  } catch (err: any) {
    if (err?.response?.status === 403) {
      toast.error("Нет доступа к скачиванию вложения");
    } else if (err?.response?.status === 404) {
      toast.error("Вложение или файл не найден");
    } else {
      toast.error("Не удалось скачать вложение");
    }
  }
};

export const CORRESPONDENCE_ATTACHMENT_PREVIEW_NOTICE =
  "Не удалось загрузить предпросмотр файла или файл отсутствует. Попробуйте скачать файл.";

export const createApiFileFromAttachedFile = (file?: AttachedFile | null): any => {
  if (!file) return null;
  const name = file.name || "";
  const ext = name.split(".").pop()?.toLowerCase() || "";

  let previewUrl = "";
  let downloadUrl = "";

  if (file.file) {
    previewUrl = URL.createObjectURL(file.file);
    downloadUrl = previewUrl;
  } else if (file.previewUrl || file.downloadUrl) {
    previewUrl = toAbsoluteUrl(file.previewUrl || file.downloadUrl || "");
    downloadUrl = toAbsoluteUrl(file.downloadUrl || file.previewUrl || "");
  } else if (file.url) {
    previewUrl = toAbsoluteUrl(file.url);
    downloadUrl = previewUrl;
  }

  return {
    id: Math.floor(Math.random() * 1000000),
    folder_id: null,
    original_name: name,
    stored_name: name,
    extension: ext,
    mime: file.file?.type || "",
    type: file.type || ext.toUpperCase(),
    size: file.file?.size || 0,
    is_starred: false,
    meta: null,
    download_url: downloadUrl,
    preview_url: previewUrl,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

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

// Chrome при копировании из редактора вшивает в HTML буфера обмена фон
// подложки под текстом (белый лист, серый холст #E8EAED вокруг листов) как
// inline background-color. Реальным выделением текста (жёлтый маркер и т.п.)
// такие нейтральные светлые фоны не являются — при вставке их надо вычищать,
// иначе вставленный текст получает серую «плашку». Насыщенные цвета
// (выделение маркером, заливка из Word) сохраняем.
const isUiBackground = (rawVal: string): boolean => {
  const v = rawVal.trim().toLowerCase();
  if (v === "transparent" || v === "white" || v === "none") return true;
  let r = -1;
  let g = -1;
  let b = -1;
  let a = 1;
  const rgb = v.match(
    /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/,
  );
  const hex6 = v.match(/^#([0-9a-f]{6})$/);
  const hex3 = v.match(/^#([0-9a-f]{3})$/);
  if (rgb) {
    r = +rgb[1];
    g = +rgb[2];
    b = +rgb[3];
    if (rgb[4] != null) a = parseFloat(rgb[4]);
  } else if (hex6) {
    r = parseInt(hex6[1].slice(0, 2), 16);
    g = parseInt(hex6[1].slice(2, 4), 16);
    b = parseInt(hex6[1].slice(4, 6), 16);
  } else if (hex3) {
    r = parseInt(hex3[1][0] + hex3[1][0], 16);
    g = parseInt(hex3[1][1] + hex3[1][1], 16);
    b = parseInt(hex3[1][2] + hex3[1][2], 16);
  } else {
    return false; // незнакомый формат — не трогаем
  }
  if (a === 0) return true;
  // Почти бесцветный светлый фон (белый, #E8EAED и близкие оттенки подложки)
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max - min <= 16 && min >= 200;
};

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
    if (prop === "background-color" && isUiBackground(rawVal)) return;
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

export type DSStampLang = "EN" | "RU" | "TJ";

export interface DSStampData {
  name: string;
  certSerial: string;
  signedAt: string;
  validUntil: string;
}

// viewBox штампа. Соотношение сторон 760×333 в точности повторяет утверждённый
// макет; любой физический размер на листе А4 получается простым масштабированием
// с сохранением пропорций (preserveAspectRatio). Единый источник истины для
// высоты/ширины — чтобы предпросмотр, документ и печать совпадали.
export const DS_STAMP_VIEW_W = 760;
export const DS_STAMP_VIEW_H = 333;

// Высота штампа для заданной ширины, сохраняющая пропорции макета.
export const dsStampHeightForWidth = (width: number): number =>
  Math.round((width * DS_STAMP_VIEW_H) / DS_STAMP_VIEW_W);

// Подписи штампа на трёх языках. Латиница/цифры рисуются шрифтом Orbitron,
// кириллица — системным sans (в Orbitron нет кириллических глифов), ровно как
// ведёт себя `font-family: Orbitron, sans-serif` в утверждённом макете.
const DS_LOCALIZATION: Record<
  DSStampLang,
  {
    subtitle: string;
    ownerTitle: string;
    signatureText: string;
    certNumberTitle: string;
    dateOfIssueTitle: string;
    validityTitle: string;
    fromText: string;
    toText: string;
    statusText: string;
    authorityText: string;
    footerText: string;
  }
> = {
  TJ: {
    subtitle: "ҲУВИЯТИ РАҚАМӢ",
    ownerTitle: "Соҳиби сертификат",
    signatureText: "Имзои электронии рақамӣ",
    certNumberTitle: "Рақами сертификат",
    dateOfIssueTitle: "Санаи додан",
    validityTitle: "Мӯҳлати эътибор",
    fromText: "аз",
    toText: "то",
    statusText: "ACTIVE & VERIFIED",
    authorityText: "TJ-Root Certificate Authority",
    footerText: "Secured · Encrypted · Tamper-Proof",
  },
  RU: {
    subtitle: "ЦИФРОВАЯ ЛИЧНОСТЬ",
    ownerTitle: "Владелец сертификата",
    signatureText: "Электронная цифровая подпись",
    certNumberTitle: "Номер сертификата",
    dateOfIssueTitle: "Дата выдачи",
    validityTitle: "Срок действия",
    fromText: "с",
    toText: "по",
    statusText: "АКТИВЕН И ПОДТВЕРЖДЁН",
    authorityText: "TJ-Root Certificate Authority",
    footerText: "Защищено · Зашифровано · Безопасно",
  },
  EN: {
    subtitle: "DIGITAL IDENTITY",
    ownerTitle: "Certificate holder",
    signatureText: "Electronic Digital Signature",
    certNumberTitle: "Certificate number",
    dateOfIssueTitle: "Date of issue",
    validityTitle: "Validity period",
    fromText: "from",
    toText: "to",
    statusText: "ACTIVE & VERIFIED",
    authorityText: "TJ-Root Certificate Authority",
    footerText: "Secured · Encrypted · Tamper-Proof",
  },
};

// Уникальные id для clipPath/градиентов внутри одного документа: при нескольких
// инлайновых штампах на странице (блоки «Подписывающий», «Согласующие») общие
// id привели бы к конфликту ссылок url(#…) — поэтому делаем их разными.
let dsStampSeq = 0;

// Государственный флаг Республики Таджикистан в стилистике макета (три полосы и
// золотая корона из семи точек) во вьюбоксе 1200×600.
const DS_FLAG_INNER =
  `<rect width="1200" height="600" fill="#fff"/>` +
  `<rect width="1200" height="200" fill="#cc0000"/>` +
  `<rect width="1200" height="200" y="400" fill="#006600"/>` +
  `<g transform="translate(600,300)">` +
  `<path d="M -100 60 A 110 110 0 0 1 100 60 L 70 60 L 70 40 L 40 40 L 40 10 L -40 10 L -40 40 L -70 40 L -70 60 Z" fill="#f8c400"/>` +
  `<g fill="#f8c400">` +
  `<circle cx="0" cy="-60" r="10"/>` +
  `<circle cx="-50" cy="-45" r="10"/>` +
  `<circle cx="50" cy="-45" r="10"/>` +
  `<circle cx="-85" cy="-10" r="10"/>` +
  `<circle cx="85" cy="-10" r="10"/>` +
  `<circle cx="-100" cy="40" r="10"/>` +
  `<circle cx="100" cy="40" r="10"/>` +
  `</g></g>`;

// Единый SVG-рисунок штампа ЭЦП во вьюбоксе 760×333 — ОДИН источник правды для:
//  • React-компонента <DSStamp> (плейсхолдер до подписи, блоки «Подписывающий»/
//    «Согласующие», приложение №1, предпросмотр);
//  • картинки, вшиваемой в тело письма при подписании (редактор и печать/экспорт).
// Благодаря общему viewBox и встроенному шрифту Orbitron штамп везде одной формы,
// высоты и типографики. Сам SVG тянется на 100% контейнера с сохранением
// пропорций. Шрифт Orbitron вшит прямо сюда (data-URI @font-face): картинка
// <img src="data:image/svg+xml"> изолирована и не видит шрифты страницы.
export function buildDSStampSvg(
  { name, certSerial, signedAt, validUntil }: DSStampData,
  lang: DSStampLang = "TJ",
): string {
  const uid = `ds${(++dsStampSeq).toString(36)}`;
  const clip = `${uid}c`;
  const t = DS_LOCALIZATION[lang];

  const match = validUntil.match(
    /(?:аз|from|с)?\s*([\d.]+)\s*(?:то|to|по|-)\s*([\d.]+)/i,
  );
  const fromDate = match ? match[1] : "30.03.2026";
  const toDate = match ? match[2] : "30.03.2027";

  const escName = escapeXml(name);
  const escSerial = escapeXml(certSerial);
  const escSignedAt = escapeXml(signedAt);
  const escFromDate = escapeXml(fromDate);
  const escToDate = escapeXml(toDate);

  // Шрифтовые стеки: латиница/цифры → Orbitron, кириллица падает на Arial/sans.
  const FONT = "'Orbitron', Arial, sans-serif"; // элементы из макета на Orbitron
  const SANS = "Arial, sans-serif"; // элементы без Orbitron в макете
  const MONO = "'Courier New', monospace";
  const bold700 = `style="font-variation-settings:'wght' 700"`;
  const semi600 = `style="font-variation-settings:'wght' 600"`;

  // Языковые «пилюли» EN/RU/TJ в правом верхнем углу. Активная — с градиентом.
  const langOrder: DSStampLang[] = ["EN", "RU", "TJ"];
  const pills = [
    { label: "EN", x: 628, cx: 645 },
    { label: "RU", x: 664, cx: 681 },
    { label: "TJ", x: 700, cx: 717 },
  ];
  const langPills = pills
    .map((p, i) => {
      const active = langOrder[i] === lang;
      return (
        (active
          ? `<rect x="${p.x}" y="28" width="34" height="15" rx="7.5" fill="url(#${uid}pg)"/>`
          : "") +
        `<text x="${p.cx}" y="39.5" font-family="${FONT}" font-size="9" font-weight="700" letter-spacing="0.9" text-anchor="middle" fill="${
          active ? "#111111" : "rgba(255,255,255,0.45)"
        }">${p.label}</text>`
      );
    })
    .join("");

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 333" preserveAspectRatio="xMidYMid meet" fill="none" style="display:block;width:100%;height:100%;">` +
    `<defs>` +
    `<style>@font-face{font-family:'Orbitron';font-style:normal;font-weight:400 900;src:url(data:font/woff2;base64,${ORBITRON_WOFF2_BASE64}) format('woff2');}</style>` +
    `<clipPath id="${clip}"><rect x="0.5" y="0.5" width="759" height="332" rx="16"/></clipPath>` +
    `<linearGradient id="${uid}hg" x1="0" y1="0" x2="760" y2="0" gradientUnits="userSpaceOnUse">` +
    `<stop offset="0%" stop-color="#ff6b00" stop-opacity="0"/>` +
    `<stop offset="20%" stop-color="#ff6b00" stop-opacity="1"/>` +
    `<stop offset="50%" stop-color="#ffb800" stop-opacity="1"/>` +
    `<stop offset="80%" stop-color="#ff6b00" stop-opacity="1"/>` +
    `<stop offset="100%" stop-color="#ff6b00" stop-opacity="0"/>` +
    `</linearGradient>` +
    `<linearGradient id="${uid}bg" x1="0" y1="0" x2="760" y2="333" gradientUnits="userSpaceOnUse">` +
    `<stop offset="0%" stop-color="#2c2c2c"/>` +
    `<stop offset="100%" stop-color="#222222"/>` +
    `</linearGradient>` +
    `<linearGradient id="${uid}vg" x1="0" y1="172" x2="0" y2="274" gradientUnits="userSpaceOnUse">` +
    `<stop offset="0%" stop-color="#ff6b00" stop-opacity="0"/>` +
    `<stop offset="35%" stop-color="#ff6b00" stop-opacity="1"/>` +
    `<stop offset="65%" stop-color="#ffb800" stop-opacity="1"/>` +
    `<stop offset="100%" stop-color="#ffb800" stop-opacity="0"/>` +
    `</linearGradient>` +
    `<linearGradient id="${uid}mg" x1="516" y1="0" x2="624" y2="0" gradientUnits="userSpaceOnUse">` +
    `<stop offset="0%" stop-color="#ff6b00" stop-opacity="0.18"/>` +
    `<stop offset="30%" stop-color="#ff6b00" stop-opacity="1"/>` +
    `<stop offset="70%" stop-color="#ffb800" stop-opacity="1"/>` +
    `<stop offset="100%" stop-color="#ff6b00" stop-opacity="0.18"/>` +
    `</linearGradient>` +
    `<linearGradient id="${uid}pg" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0%" stop-color="#ff6b00"/>` +
    `<stop offset="100%" stop-color="#ffb800"/>` +
    `</linearGradient>` +
    `</defs>` +
    `<g clip-path="url(#${clip})">` +
    `<rect x="0" y="0" width="760" height="333" fill="#1a1a1a"/>` +
    `<rect x="0" y="3" width="760" height="148" fill="url(#${uid}bg)"/>` +
    `<rect x="0" y="152" width="760" height="142" fill="url(#${uid}bg)"/>` +
    `<rect x="0" y="295" width="760" height="38" fill="#000000" fill-opacity="0.22"/>` +
    `<rect x="0" y="0" width="760" height="3" fill="url(#${uid}hg)"/>` +
    `<g transform="translate(460, 33) scale(15)" opacity="0.055">` +
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
    // === ШАПКА ===
    `<g transform="translate(24, 25.5) scale(0.03333)">${DS_FLAG_INNER}</g>` +
    `<text x="76" y="34" font-family="${FONT}" font-size="14" font-weight="700" ${bold700} fill="#ffffff" letter-spacing="3.36">INFRATECH</text>` +
    `<text x="76" y="45" font-family="${FONT}" font-size="7" font-weight="400" fill="#ffb800" letter-spacing="2.1">${escapeXml(t.subtitle)}</text>` +
    `<rect x="626" y="26" width="110" height="19" rx="9.5" fill="#ffffff" fill-opacity="0.06" stroke="#ff6b00" stroke-opacity="0.3" stroke-width="1"/>` +
    langPills +
    `<text x="24" y="72" font-family="${FONT}" font-size="10" font-weight="500" fill="#ffb800" letter-spacing="2.2">${escapeXml(t.ownerTitle.toUpperCase())}</text>` +
    `<text x="24" y="104" font-family="${FONT}" font-size="30" font-weight="700" ${bold700} fill="#ffffff" letter-spacing="-0.3">${escName}</text>` +
    `<text x="24" y="130" font-family="${FONT}" font-size="10" font-weight="400" fill="#ffffff" fill-opacity="0.3" letter-spacing="1.5">${escapeXml(t.signatureText.toUpperCase())}</text>` +
    `<rect x="0" y="151" width="760" height="1" fill="url(#${uid}hg)"/>` +
    // === ТЕЛО: левая колонка ===
    `<text x="24" y="179" font-family="${SANS}" font-size="9" font-weight="600" fill="#ff6b00" letter-spacing="1.8">${escapeXml(t.certNumberTitle.toUpperCase())}</text>` +
    `<rect x="24" y="189" width="331" height="31" rx="8" fill="#ffffff" fill-opacity="0.04" stroke="#ff6b00" stroke-opacity="0.2" stroke-width="1"/>` +
    `<text x="36" y="208" font-family="${MONO}" font-size="11" fill="#ffffff" fill-opacity="0.6">${escSerial}</text>` +
    `<text x="24" y="247" font-family="${SANS}" font-size="9" font-weight="600" fill="#ff6b00" letter-spacing="1.8">${escapeXml(t.dateOfIssueTitle.toUpperCase())}</text>` +
    `<g transform="translate(24, 257) scale(0.5833)">` +
    `<path d="M8 2v4" stroke="#ffd166" stroke-width="2" stroke-linecap="round" fill="none"/>` +
    `<path d="M16 2v4" stroke="#ffd166" stroke-width="2" stroke-linecap="round" fill="none"/>` +
    `<rect width="18" height="18" x="3" y="4" rx="2" stroke="#ffd166" stroke-width="2" fill="none"/>` +
    `<path d="M3 10h18" stroke="#ffd166" stroke-width="2" fill="none"/>` +
    `</g>` +
    `<text x="46" y="269" font-family="${FONT}" font-size="15" font-weight="600" ${semi600} fill="#ffffff" letter-spacing="0.6">${escSignedAt}</text>` +
    `<rect x="380" y="172" width="1" height="102" fill="url(#${uid}vg)"/>` +
    // === ТЕЛО: правая колонка ===
    `<text x="404" y="179" font-family="${SANS}" font-size="9" font-weight="600" fill="#ff6b00" letter-spacing="1.8">${escapeXml(t.validityTitle.toUpperCase())}</text>` +
    `<text x="454" y="195" font-family="${SANS}" font-size="8" fill="#ffffff" fill-opacity="0.4" letter-spacing="0.6" text-anchor="middle">${escapeXml(t.fromText.toUpperCase())}</text>` +
    `<text x="454" y="212" font-family="${FONT}" font-size="14" font-weight="600" ${semi600} fill="#ffffff" letter-spacing="0.56" text-anchor="middle">${escFromDate}</text>` +
    `<rect x="516" y="203" width="108" height="1" fill="url(#${uid}mg)"/>` +
    `<text x="686" y="195" font-family="${SANS}" font-size="8" fill="#ffffff" fill-opacity="0.4" letter-spacing="0.6" text-anchor="middle">${escapeXml(t.toText.toUpperCase())}</text>` +
    `<text x="686" y="212" font-family="${FONT}" font-size="14" font-weight="600" ${semi600} fill="#ffffff" letter-spacing="0.56" text-anchor="middle">${escToDate}</text>` +
    `<circle cx="422" cy="256" r="18" fill="#ff6b00" fill-opacity="0.18" stroke="#ff6b00" stroke-opacity="0.4" stroke-width="1"/>` +
    `<g transform="translate(412, 246) scale(0.8333)">` +
    `<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" stroke="#ff6b00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>` +
    `<path d="m9 12 2 2 4-4" stroke="#ff6b00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>` +
    `</g>` +
    `<text x="452" y="253" font-family="${SANS}" font-size="11" font-weight="700" fill="#ffd166" letter-spacing="0.28">${escapeXml(t.statusText)}</text>` +
    `<text x="452" y="265" font-family="${SANS}" font-size="9" fill="#ffffff" fill-opacity="0.35">${escapeXml(t.authorityText)}</text>` +
    `</g>` +
    `<rect x="0" y="294" width="760" height="1" fill="url(#${uid}hg)"/>` +
    // === ФУТЕР ===
    `<g transform="translate(24, 307) scale(0.5833)">` +
    `<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" stroke="#ff6b00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>` +
    `</g>` +
    `<text x="46" y="317" font-family="${FONT}" font-size="9" font-weight="400" fill="#ffffff" fill-opacity="0.35" letter-spacing="1.62">${escapeXml(t.footerText.toUpperCase())}</text>` +
    `<g transform="translate(702, 308) scale(0.5)">` +
    `<rect width="18" height="11" x="3" y="11" rx="2" ry="2" stroke="#ffffff" stroke-opacity="0.22" stroke-width="2" fill="none"/>` +
    `<path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#ffffff" stroke-opacity="0.22" stroke-width="2" fill="none"/>` +
    `</g>` +
    `<g transform="translate(722, 307) scale(0.5833)">` +
    `<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" stroke="#ffb800" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>` +
    `<path d="M14 2v4a2 2 0 0 0 2 2h4" stroke="#ffb800" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>` +
    `<path d="m9 15 2 2 4-4" stroke="#ffb800" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>` +
    `</g>` +
    `<rect x="0.5" y="0.5" width="759" height="332" rx="16" fill="none" stroke="#ff6b00" stroke-opacity="0.3" stroke-width="1"/>` +
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
