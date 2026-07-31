import {
  PAGE_STRIDE,
  CONTENT_WIDTH,
  CONTENT_HEIGHT,
  CONTENT_CLASS,
  type StampInfo,
} from "./incomingViewGeometry";
import {
  truncateToChars,
  dropChars,
  brAtCharBoundary,
  removeLeadingBr,
} from "./incomingViewTruncate";

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

export const paginateHtml = (
  html: string | null | undefined,
  fontSize = 14
): { pages: string[]; stamp: StampInfo } => {
  if (typeof document === "undefined") return { pages: [], stamp: null };
  if (!html || !html.replace(/<[^>]*>/g, "").trim()) {
    return { pages: [], stamp: null };
  }

  const source = document.createElement("div");
  source.innerHTML = html;
  source.querySelectorAll("[data-page-spacer]").forEach((n) => n.remove());

  let stamp: StampInfo = null;
  const stampNode = source.querySelector<HTMLElement>(
    "[data-signature-stamp='true']"
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
