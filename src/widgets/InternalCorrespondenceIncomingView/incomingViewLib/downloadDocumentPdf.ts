// Тот же файл, что подключает приложение (app/styles/global.css): в iframe
// нет ни preflight Tailwind, ни утилитарных классов холста, поэтому
// оформление тела документа приезжает сюда целиком.
import documentBodyCss from "@shared/styles/document-body.css?inline";

import {
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PAGE_PAD_H,
  PAGE_PAD_V,
} from "./incomingViewGeometry";
import { paginateHtml } from "./paginateHtml";

const printPageCss = (fontSize: number) => `
  ${documentBodyCss}
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
  .stamp, .stamp * { white-space: normal; min-height: 0; }
  img { max-width: 100%; height: auto; }
  table { width: 100%; table-layout: auto; border-collapse: collapse; }
  td, th { border: 1px solid #cbd5e1; padding: 4px 8px; vertical-align: top; word-break: break-word; }
  [data-page-spacer] { display: none !important; }`;

export const downloadDocumentPdf = (
  html: string | null | undefined,
  fontSize = 14,
  subject = ""
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
      return `<div class="page"><div class="content doc-preview-content">${pageHtml}</div>${stampHtml}</div>`;
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
    `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8" /><title></title><style>${printPageCss(fontSize)}</style></head><body>${pagesHtml}</body></html>`
  );
  doc.close();
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
