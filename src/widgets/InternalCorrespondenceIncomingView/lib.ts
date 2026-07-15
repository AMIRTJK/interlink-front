import React from "react";

// Общая логика постраничной разбивки тела письма (A4) и печати/скачивания PDF
// для просмотра входящего письма. Повторяет поведение PreviewModal/холста
// редактора из CreateInternalCorrespondence, чтобы входящее выглядело 1-в-1 как
// исходящее: разделения страниц A4 и рисунок ЭЦП на своей странице.

export const PAGE_WIDTH = 794; // A4 книжная, 96 DPI
export const PAGE_HEIGHT = 1122;
export const PAGE_PAD_H = 80;
export const PAGE_PAD_V = 72;
export const PAGE_GAP = 32; // визуальный отступ между листами
export const PAGE_STRIDE = PAGE_HEIGHT + PAGE_GAP;
export const CONTENT_WIDTH = PAGE_WIDTH - PAGE_PAD_H * 2;
export const CONTENT_HEIGHT = PAGE_HEIGHT - PAGE_PAD_V * 2;

// ВАЖНО: классы должны совпадать с холстом редактора и PreviewModal, иначе
// просмотр/печать будут отличаться от того, что видно в редакторе исходящего.
export const CONTENT_CLASS =
  "max-w-full [&_*]:max-w-full [&_*]:!whitespace-pre-wrap [&_*]:break-words [&_img]:h-auto [&_table]:w-full [&_table]:table-auto [&_table]:border-collapse [&_td]:break-words [&_td]:align-top [&_td]:border [&_td]:border-slate-300 [&_td]:px-2 [&_td]:py-1 [&_th]:break-words [&_th]:align-top [&_th]:border [&_th]:border-slate-300 [&_th]:px-2 [&_th]:py-1 [&_div:not([data-signature-stamp])]:min-h-[1.8em]";

export const contentStyle = (fontSize: number): React.CSSProperties => ({
  fontFamily: "Times New Roman, serif",
  fontSize,
  lineHeight: "1.8",
  color: "#1e293b",
  maxWidth: "100%",
  overflowWrap: "break-word",
  wordBreak: "break-word",
  whiteSpace: "pre-wrap",
});

const ATOMIC = new Set(["TABLE", "IMG", "FIGURE", "SVG", "VIDEO", "CANVAS"]);

// ===== Посимвольное деление блока с СОХРАНЕНИЕМ разметки =====
// Пара операций «голова/хвост»: truncateToChars оставляет первые N символов
// текста, dropChars — всё после первых N. Жирный/курсив/span'ы/<br> при этом
// сохраняются. Старый способ (block.textContent = slice) уничтожал все
// переносы строк и форматирование внутри разрезанного блока.

// Обрезать узел до первых N символов текста, сохраняя структуру. Элементы
// после исчерпания бюджета удаляются целиком (включая <br> на самой границе —
// он считается принадлежащим хвосту, см. brAtCharBoundary).
export const truncateToChars = (node: Node, budget: { left: number }) => {
  const children = Array.from(node.childNodes);
  for (const c of children) {
    if (budget.left <= 0) {
      node.removeChild(c);
      continue;
    }
    if (c.nodeType === Node.TEXT_NODE) {
      const len = c.textContent?.length ?? 0;
      if (len <= budget.left) budget.left -= len;
      else {
        c.textContent = (c.textContent || "").slice(0, budget.left);
        budget.left = 0;
      }
    } else {
      truncateToChars(c, budget);
    }
  }
};

// Зеркальная операция: удалить первые N символов текста, сохранив разметку
// остатка. «Нулевые» элементы (<br>, <img>, пустые обёртки), встреченные ДО
// точки разреза, принадлежат голове и удаляются из хвоста.
export const dropChars = (node: Node, budget: { left: number }) => {
  const children = Array.from(node.childNodes);
  for (const c of children) {
    if (budget.left <= 0) return;
    if (c.nodeType === Node.TEXT_NODE) {
      const len = c.textContent?.length ?? 0;
      if (len <= budget.left) {
        budget.left -= len;
        (c as ChildNode).remove();
      } else {
        c.textContent = (c.textContent || "").slice(budget.left);
        budget.left = 0;
      }
    } else if (c.nodeType === Node.ELEMENT_NODE) {
      const el = c as Element;
      const textLen = (el.textContent || "").length;
      if (textLen === 0) {
        // <br>/<img>/пустые обёртки до точки разреза — часть головы
        el.remove();
        continue;
      }
      if (
        textLen <= budget.left &&
        !el.querySelector("br,img,svg,video,canvas")
      ) {
        budget.left -= textLen;
        el.remove();
      } else {
        dropChars(el, budget);
        if (
          !(el.textContent || "").length &&
          !el.querySelector("br,img,svg,video,canvas")
        ) {
          el.remove();
        }
      }
    } else {
      (c as ChildNode).remove();
    }
  }
};

// Стоит ли в исходном блоке <br> ровно в точке разреза (сразу после k
// символов)? Такой <br> «закрывал» последнюю строку головы: голове он не
// нужен (хвостовой <br> невидим), а в хвосте дал бы лишнюю пустую строку.
export const brAtCharBoundary = (root: HTMLElement, k: number): boolean => {
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    null,
  );
  let acc = 0;
  let n: Node | null;
  while ((n = walker.nextNode())) {
    if (n.nodeType === Node.TEXT_NODE) {
      const len = n.textContent?.length ?? 0;
      if (acc + len > k) return false; // разрез внутри текста (перенос по ширине)
      acc += len;
    } else if ((n as Element).nodeName === "BR") {
      if (acc === k) return true;
    }
  }
  return false;
};

// Удаляет первый «ведущий» <br> хвоста (пустую строку на стыке разреза).
// Останавливается, встретив любой текст или атомарный элемент.
export const removeLeadingBr = (root: HTMLElement): void => {
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    null,
  );
  let n: Node | null;
  while ((n = walker.nextNode())) {
    if (n.nodeType === Node.TEXT_NODE) {
      if ((n.textContent || "").length) return;
      continue;
    }
    const el = n as Element;
    if (el.nodeName === "BR") {
      el.remove();
      return;
    }
    if (ATOMIC.has(el.nodeName)) return;
  }
};

const BLOCK_TAGS = new Set([
  "DIV",
  "P",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "UL",
  "OL",
  "LI",
  "TABLE",
  "BLOCKQUOTE",
  "PRE",
  "FIGURE",
  "HR",
  "SECTION",
  "ARTICLE",
  "HEADER",
  "FOOTER",
  "ASIDE",
  "NAV",
  "TR",
  "THEAD",
  "TBODY",
]);

export type StampInfo = {
  pageIndex: number;
  x: number;
  y: number;
  width: string;
  html?: string;
} | null;

// Разбивает HTML тела письма на страницы A4 и извлекает встроенный штамп ЭЦП.
// Измерения делаются во временном скрытом div (создаём и удаляем сами), поэтому
// функцию можно звать и из рендера (через эффект), и из обработчика печати.
export const paginateHtml = (
  html: string | null | undefined,
  fontSize = 14,
): { pages: string[]; stamp: StampInfo } => {
  if (typeof document === "undefined") return { pages: [], stamp: null };
  if (!html || !html.replace(/<[^>]*>/g, "").trim()) {
    return { pages: [], stamp: null };
  }

  const source = document.createElement("div");
  source.innerHTML = html;
  // Распорки редактора в сохранённое тело не попадают, но на всякий случай чистим.
  source.querySelectorAll("[data-page-spacer]").forEach((n) => n.remove());

  // Изолируем встроенный штамп ЭЦП (если письмо подписано), чтобы он не ломал
  // разбивку текста, и рисуем его отдельно на своей странице.
  let stamp: StampInfo = null;
  const stampNode = source.querySelector<HTMLElement>(
    "[data-signature-stamp='true']",
  );
  if (stampNode) {
    const left = parseFloat(stampNode.style.left) || 0;
    const top = parseFloat(stampNode.style.top) || 0;
    const pageIndex = Math.max(0, Math.floor(top / PAGE_STRIDE));
    stamp = {
      pageIndex,
      x: left,
      y: top - pageIndex * PAGE_STRIDE,
      width: stampNode.style.width || "320px",
      html: stampNode.innerHTML,
    };
    stampNode.remove();
  }

  // Временный измеритель высоты — с теми же шириной/шрифтом/классами, что и лист.
  const measurer = document.createElement("div");
  measurer.className = CONTENT_CLASS;
  Object.assign(measurer.style, {
    fontFamily: "Times New Roman, serif",
    fontSize: `${fontSize}px`,
    lineHeight: "1.8",
    color: "#1e293b",
    position: "absolute",
    top: "0",
    left: "-99999px",
    width: `${CONTENT_WIDTH}px`,
    maxWidth: `${CONTENT_WIDTH}px`,
    visibility: "hidden",
    pointerEvents: "none",
    whiteSpace: "pre-wrap",
    overflowWrap: "break-word",
    wordBreak: "break-word",
    zIndex: "-1",
  } as Partial<CSSStyleDeclaration>);
  document.body.appendChild(measurer);

  const pages: string[] = [];
  try {
    const blocks: HTMLElement[] = [];
    let inlineBuf: Node[] = [];
    const flushInline = () => {
      if (!inlineBuf.length) return;
      const div = document.createElement("div");
      inlineBuf.forEach((n) => div.appendChild(n));
      if ((div.textContent || "").trim() || div.querySelector("img,br")) {
        blocks.push(div);
      }
      inlineBuf = [];
    };
    Array.from(source.childNodes).forEach((node) => {
      const isBlockEl =
        node.nodeType === Node.ELEMENT_NODE &&
        BLOCK_TAGS.has((node as HTMLElement).tagName);
      if (isBlockEl) {
        flushInline();
        blocks.push(node as HTMLElement);
      } else {
        inlineBuf.push(node);
      }
    });
    flushInline();

    measurer.innerHTML = "";
    const fits = () => measurer.scrollHeight <= CONTENT_HEIGHT;
    const flush = () => {
      if (measurer.innerHTML.trim()) {
        pages.push(measurer.innerHTML);
        measurer.innerHTML = "";
      }
    };

    // Блок, который сам по себе выше страницы, режем на постраничные куски
    // бинарным поиском по числу символов — с СОХРАНЕНИЕМ разметки (жирный,
    // курсив, <br> и т.д.), а не через textContent, стиравший форматирование.
    const splitOversized = (el: HTMLElement) => {
      let rest: HTMLElement | null = el.cloneNode(true) as HTMLElement;
      let guard = 0;
      while (rest && guard++ < 5000) {
        const total = (rest.textContent || "").length;
        if (!total) break;

        const probeFits = (k: number): boolean => {
          const probe = rest!.cloneNode(true) as HTMLElement;
          truncateToChars(probe, { left: k });
          measurer.innerHTML = "";
          measurer.appendChild(probe);
          return fits();
        };

        let lo = 1;
        let hi = total;
        let best = 1;
        while (lo <= hi) {
          const mid = (lo + hi) >> 1;
          if (probeFits(mid)) {
            best = mid;
            lo = mid + 1;
          } else {
            hi = mid - 1;
          }
        }

        const head = rest.cloneNode(true) as HTMLElement;
        truncateToChars(head, { left: best });
        measurer.innerHTML = "";
        measurer.appendChild(head);
        pages.push(measurer.innerHTML);
        measurer.innerHTML = "";

        if (best >= total) break;
        const tail = rest.cloneNode(true) as HTMLElement;
        dropChars(tail, { left: best });
        if (brAtCharBoundary(rest, best)) removeLeadingBr(tail);
        rest = (tail.textContent || "").trim() || tail.querySelector("br,img")
          ? tail
          : null;
      }
    };

    for (const block of blocks) {
      if (block.hasAttribute("data-page-break")) {
        if (measurer.innerHTML.trim()) flush();
        else pages.push("<div><br></div>");
        continue;
      }

      const clone = block.cloneNode(true) as HTMLElement;
      measurer.appendChild(clone);

      if (fits()) continue;

      if (measurer.childNodes.length > 1) {
        measurer.removeChild(clone);
        flush();
        measurer.appendChild(clone);
        if (fits()) continue;
      }

      const tag = clone.tagName;
      if (!ATOMIC.has(tag) && (clone.textContent || "").trim()) {
        measurer.removeChild(clone);
        splitOversized(clone);
      }
    }

    flush();
  } finally {
    measurer.remove();
  }

  return { pages: pages.length ? pages : [source.innerHTML], stamp };
};

// CSS листа печати (классы Tailwind в iframe печати недоступны) — дублирует
// оформление холста, чтобы напечатанное совпадало с просмотром 1-в-1.
const printPageCss = (fontSize: number) => `
  @page { size: A4 portrait; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { font-family: "Times New Roman", serif; font-size: ${fontSize}px; line-height: 1.8; color: #1e293b; }
  .page {
    position: relative;
    width: ${PAGE_WIDTH}px; height: ${PAGE_HEIGHT}px;
    padding: ${PAGE_PAD_V}px ${PAGE_PAD_H}px;
    overflow: hidden;
    break-after: page; page-break-after: always;
  }
  .page:last-child { break-after: auto; page-break-after: auto; }
  .content { height: 100%; }
  .page * { max-width: 100%; white-space: pre-wrap; overflow-wrap: break-word; word-break: break-word; }
  .content div:not([data-signature-stamp]) { min-height: 1.8em; }
  .stamp, .stamp * { white-space: normal; min-height: 0; }
  img { max-width: 100%; height: auto; }
  table { width: 100%; table-layout: auto; border-collapse: collapse; }
  td, th { border: 1px solid #cbd5e1; padding: 4px 8px; vertical-align: top; word-break: break-word; }
  ul { list-style: disc; padding-left: 1.5em; }
  ol { list-style: decimal; padding-left: 1.5em; }
  [data-page-spacer] { display: none !important; }`;

// Печать / «Скачать PDF»: раскладываем тело письма на страницы, рисуем штамп ЭЦП
// на нужной странице и открываем системный диалог печати в скрытом iframe
// (с @page margin:0 браузер не добавляет свои колонтитулы — можно «Сохранить как PDF»).
export const downloadDocumentPdf = (
  html: string | null | undefined,
  fontSize = 14,
  subject = "",
) => {
  const { pages: rawPages, stamp } = paginateHtml(html, fontSize);
  const pages = [...rawPages];
  if (stamp) while (pages.length <= stamp.pageIndex) pages.push("");
  if (!pages.length) pages.push("");

  const pagesHtml = pages
    .map((pageHtml, idx) => {
      const stampHtml =
        stamp && stamp.pageIndex === idx && stamp.html
          ? `<div class="stamp" style="position:absolute;left:${PAGE_PAD_H + stamp.x}px;top:${PAGE_PAD_V + stamp.y}px;width:${stamp.width};overflow:hidden;pointer-events:none;">${stamp.html}</div>`
          : "";
      return `<div class="page"><div class="content">${pageHtml}</div>${stampHtml}</div>`;
    })
    .join("");

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const win = iframe.contentWindow;
  const doc = win?.document;
  if (!win || !doc) {
    iframe.remove();
    return;
  }

  doc.open();
  doc.write(
    `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8" /><title></title><style>${printPageCss(fontSize)}</style></head><body>${pagesHtml}</body></html>`,
  );
  doc.close();
  // Имя файла в диалоге «Сохранить как PDF» = тема письма.
  if (subject) doc.title = subject;

  const triggerPrint = () => {
    win.focus();
    win.print();
    setTimeout(() => iframe.remove(), 1000);
  };
  if (doc.readyState === "complete") {
    setTimeout(triggerPrint, 300);
  } else {
    win.onload = () => setTimeout(triggerPrint, 300);
  }
};
