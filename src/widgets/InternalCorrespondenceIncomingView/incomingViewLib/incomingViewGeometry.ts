import React from "react";

export const PAGE_WIDTH = 794; // A4 книжная, 96 DPI
export const PAGE_HEIGHT = 1122;
export const PAGE_PAD_H = 80;
export const PAGE_PAD_V = 72;
export const PAGE_GAP = 32; // визуальный отступ между листами
export const PAGE_STRIDE = PAGE_HEIGHT + PAGE_GAP;
export const CONTENT_WIDTH = PAGE_WIDTH - PAGE_PAD_H * 2;
export const CONTENT_HEIGHT = PAGE_HEIGHT - PAGE_PAD_V * 2;

export const CONTENT_CLASS =
  "doc-preview-content max-w-full [&_*]:max-w-full [&_*]:!whitespace-pre-wrap [&_*]:break-words [&_img]:h-auto [&_table]:w-full [&_table]:table-auto [&_table]:border-collapse [&_td]:break-words [&_td]:align-top [&_td]:border [&_td]:border-slate-300 [&_td]:px-2 [&_td]:py-1 [&_th]:break-words [&_th]:align-top [&_th]:border [&_th]:border-slate-300 [&_th]:px-2 [&_th]:py-1";

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

export type StampInfo = {
  pageIndex: number;
  x: number;
  y: number;
  width: string;
  html?: string;
} | null;
