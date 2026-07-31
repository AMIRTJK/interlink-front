import React from "react";
import pdfIcon from "../../../assets/icons/pdf-icon.svg";
import xlsIcon from "../../../assets/icons/xls-icon.svg";
import docIcon from "../../../assets/icons/doc-icon.svg";

export type FileType = "pdf" | "doc" | "xls";

export interface FileItem {
  type: FileType;
  name: string;
  url: string;
  iconSrc: string;
}

export const FILES: FileItem[] = [
  {
    type: "pdf",
    name: "Документ.pdf",
    url: "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf",
    iconSrc: pdfIcon,
  },
  {
    type: "xls",
    name: "Таблица.xls",
    url: "https://sheetjs.com/pres.xlsx",
    iconSrc: xlsIcon,
  },
  {
    type: "doc",
    name: "Письмо.doc",
    url: "https://raw.githubusercontent.com/open-xml-templating/docxtemplater/master/examples/tag-example.docx",
    iconSrc: docIcon,
  },
];

export interface BookModalProps {
  isOpen: boolean;
  onClose: () => void;
  footerPhone?: string;
  coverTitle?: React.ReactNode;
  coverSubtitle?: React.ReactNode;
  coverLogoSrc?: string;
  toNavigate: () => void;
}

export interface DragInfo {
  isDown: boolean;
  startX: number;
  startY: number;
  scrollLeft: number;
  scrollTop: number;
}
