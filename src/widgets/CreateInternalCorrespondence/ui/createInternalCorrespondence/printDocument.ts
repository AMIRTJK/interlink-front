export interface IPrintStampInfo {
  pageIndex: number;
  x: number;
  y: number;
  width: string;
  html: string;
}

interface IPageCssParams {
  isLandscape: boolean;
  pageWidth: number;
  pageHeight: number;
  fontSize: string;
}

// CSS, дублирующий оформление холста редактора (классы Tailwind редактора в
// iframe печати недоступны) — чтобы напечатанное совпадало с холстом 1-в-1.
export const buildPrintPageCss = ({
  isLandscape,
  pageWidth,
  pageHeight,
  fontSize,
}: IPageCssParams) => {
  const pageW = isLandscape ? pageHeight : pageWidth;
  const pageH = isLandscape ? pageWidth : pageHeight;
  return `
  @page { size: A4 ${isLandscape ? "landscape" : "portrait"}; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { font-family: "Times New Roman", serif; font-size: ${fontSize}px; line-height: 1.8; color: #1e293b; }
  /* Лист печати = холст редактора 1-в-1 (96 DPI). Блоки внутри спозиционированы
     абсолютно по их реальным координатам из редактора. */
  .page {
    position: relative;
    width: ${pageW}px; height: ${pageH}px;
    overflow: hidden;
    break-after: page; page-break-after: always;
  }
  .page:last-child { break-after: auto; page-break-after: auto; }
  .page * { max-width: 100%; white-space: pre-wrap; overflow-wrap: break-word; word-break: break-word; }
  .page div[data-signature-stamp] * { white-space: normal; }
  img { max-width: 100%; height: auto; }
  table { width: 100%; table-layout: auto; border-collapse: collapse; }
  td, th { border: 1px solid #cbd5e1; padding: 4px 8px; vertical-align: top; word-break: break-word; }
  ul { list-style: disc; padding-left: 1.5em; }
  ol { list-style: decimal; padding-left: 1.5em; }
  [data-page-spacer] { display: none !important; }`;
};

interface IPrintParams extends IPageCssParams {
  pages: string[];
  stamp: IPrintStampInfo | null;
  marginLeft: number;
  pagePadV: number;
}

// Печать через скрытый iframe: собственный документ не трогаем, стили страницы
// живут только внутри него.
export const printDocumentPages = ({
  pages,
  stamp,
  marginLeft,
  pagePadV,
  ...cssParams
}: IPrintParams) => {
  const pagesHtml = pages
    .map((html, idx) => {
      const stampHtml =
        stamp && stamp.pageIndex === idx
          ? `<div style="position:absolute;left:${marginLeft + stamp.x}px;top:${pagePadV + stamp.y}px;width:${stamp.width};overflow:hidden;pointer-events:none;">${stamp.html}</div>`
          : "";
      return `<div class="page">${html}${stampHtml}</div>`;
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
  const doc = iframe.contentWindow?.document;
  if (!win || !doc) {
    iframe.remove();
    return;
  }

  doc.open();
  doc.write(`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8" />
<title></title>
<style>${buildPrintPageCss(cssParams)}</style>
</head>
<body>${pagesHtml}</body>
</html>`);
  doc.close();

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
