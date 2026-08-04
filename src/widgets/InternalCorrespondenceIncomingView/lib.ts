export {
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PAGE_PAD_H,
  PAGE_PAD_V,
  PAGE_GAP,
  PAGE_STRIDE,
  CONTENT_WIDTH,
  CONTENT_HEIGHT,
  CONTENT_CLASS,
  contentStyle,
  type StampInfo,
} from "./incomingViewLib/incomingViewGeometry";

export {
  truncateToChars,
  dropChars,
  brAtCharBoundary,
  removeLeadingBr,
  wordBoundaryBefore,
} from "./incomingViewLib/incomingViewTruncate";

export { paginateHtml } from "./incomingViewLib/paginateHtml";
export { downloadDocumentPdf } from "./incomingViewLib/downloadDocumentPdf";
