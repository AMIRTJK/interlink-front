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

    // Блок, который сам по себе выше страницы, режем по символам (бинарным поиском).
    const splitOversized = (el: HTMLElement) => {
      const full = el.textContent || "";
      const n = full.length;
      let start = 0;
      let guard = 0;
      while (start < n && guard++ < 5000) {
        measurer.innerHTML = "";
        const chunk = el.cloneNode(false) as HTMLElement;
        measurer.appendChild(chunk);

        let lo = start + 1;
        let hi = n;
        let best = start + 1;
        while (lo <= hi) {
          const mid = (lo + hi) >> 1;
          chunk.textContent = full.slice(start, mid);
          if (fits()) {
            best = mid;
            lo = mid + 1;
          } else {
            hi = mid - 1;
          }
        }
        chunk.textContent = full.slice(start, best);
        pages.push(measurer.innerHTML);
        measurer.innerHTML = "";
        start = best;
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
