import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Pin,
  Search,
  Plus,
  ChevronRight,
  Calendar,
  User,
  Clock,
  Download,
  Trash,
  X,
  Paperclip,
  Shield,
  Users,
  Check,
  PenLine,
  UserPlus,
  FileBadge,
  ArrowLeft,
  ChevronDown,
  FileType,
  MessageSquare,
  MessageSquarePlus,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Minus,
  Highlighter,
  Flag,
  Eye,
  Monitor,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
} from "lucide-react";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from 'tailwind-merge';


function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Типы и Интерфейсы ──────────────────────────────────────────────────────────
export type Status =
  | "на резолюции"
  | "на исполнении"
  | "на согласовании"
  | "на подпись"
  | "завершено";
export type LetterType = "Гузориш" | "Ариза" | "Дархост" | "Маълумотнома";
export type ImportanceLevel = "high" | "medium" | "low";
export type PageOrientation = "portrait" | "landscape";

export interface RegistryItem {
  id: string;
  inboundNumber: string;
  outboundNumber: string;
  sender: string;
  date: string;
  subject: string;
  executor?: string;
  status: Status;
  isPinned?: boolean;
  isRead: boolean;
}

export interface RecipientOption {
  id: string;
  name: string;
  org: string;
  initials: string;
  color: string;
}

export interface AttachedFile {
  id: string;
  name: string;
  size: string;
  type: string;
}

export interface Approver {
  id: string;
  name: string;
  role: string;
  initials: string;
  color: string;
  approved: boolean;
  approving: boolean;
  comment: string;
  showCommentInput: boolean;
  dsApplied: boolean;
  dsLoading: boolean;
}

export interface FinalSigner {
  id: string;
  name: string;
  role: string;
  initials: string;
  color: string;
  dsApplied: boolean;
  dsLoading: boolean;
}

export interface OrgStructureNode {
  id: string;
  name: string;
  position: string;
  initials: string;
  color: string;
  children?: OrgStructureNode[];
}

// ── Константы и Моки ──────────────────────────────────────────────────────────
const ORG_STRUCTURE: OrgStructureNode = {
  id: "org-root",
  name: "Министерство Финансов",
  position: "Руководство",
  initials: "МФ",
  color: "bg-blue-100 text-blue-700",
  children: [
    {
      id: "dep-1",
      name: "Отдел бюджетного планирования",
      position: "Заместитель министра",
      initials: "ОБП",
      color: "bg-blue-100 text-blue-700",
      children: [
        {
          id: "person-1",
          name: "Беҳруз Насрдинов",
          position: "Начальник отдела",
          initials: "БН",
          color: "bg-amber-100 text-amber-700",
        },
        {
          id: "person-2",
          name: "Шамсӣ Аҳмадбеков",
          position: "Главный специалист",
          initials: "ША",
          color: "bg-rose-100 text-rose-700",
        },
      ],
    },
    {
      id: "dep-2",
      name: "Отдел контроля и аудита",
      position: "Заместитель министра",
      initials: "ОКА",
      color: "bg-purple-100 text-purple-700",
      children: [
        {
          id: "person-3",
          name: "Ҷаҳонгир Додохонов",
          position: "Начальник отдела",
          initials: "ДД",
          color: "bg-purple-100 text-purple-700",
        },
      ],
    },
    {
      id: "dep-3",
      name: "Агентии инноватсия",
      position: "Генеральный директор",
      initials: "АИ",
      color: "bg-emerald-100 text-emerald-700",
      children: [
        {
          id: "person-4",
          name: "Александр В.",
          position: "Директор цифровизации",
          initials: "АВ",
          color: "bg-blue-100 text-blue-700",
        },
      ],
    },
  ],
};

const LETTER_TYPE_OPTIONS: {
  value: LetterType;
  label: string;
  desc: string;
}[] = [
  { value: "Гузориш", label: "Гузориш", desc: "Отчёт / Доклад" },
  { value: "Ариза", label: "Ариза", desc: "Заявление" },
  { value: "Дархост", label: "Дархост", desc: "Запрос / Обращение" },
  { value: "Маълумотнома", label: "Маълумотнома", desc: "Справка" },
];

const IMPORTANCE_OPTIONS: {
  value: ImportanceLevel;
  label: string;
  desc: string;
  flagFill: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
}[] = [
  {
    value: "high",
    label: "Высокая важность",
    desc: "Срочно, требует немедленного внимания",
    flagFill: "fill-rose-500 text-rose-500",
    badgeBg: "bg-rose-50",
    badgeBorder: "border-rose-200",
    badgeText: "text-rose-700",
  },
  {
    value: "medium",
    label: "Средняя важность",
    desc: "Обычный приоритет",
    flagFill: "fill-amber-400 text-amber-400",
    badgeBg: "bg-amber-50",
    badgeBorder: "border-amber-200",
    badgeText: "text-amber-700",
  },
  {
    value: "low",
    label: "Низкая важность",
    desc: "Не срочно, при возможности",
    flagFill: "text-slate-300",
    badgeBg: "bg-slate-50",
    badgeBorder: "border-slate-200",
    badgeText: "text-slate-500",
  },
];

const IMPORTANCE_DOT: Record<ImportanceLevel, string> = {
  high: "bg-rose-500",
  medium: "bg-amber-400",
  low: "bg-slate-300",
};

const RECIPIENT_OPTIONS: RecipientOption[] = [
  {
    id: "r1",
    name: "Министерство Финансов",
    org: "Отдел бюджетного планирования",
    initials: "МФ",
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: "r2",
    name: "Агентии инноватсия",
    org: "Отдел цифровизации",
    initials: "АИ",
    color: "bg-purple-100 text-purple-700",
  },
  {
    id: "r3",
    name: "Дастгоҳи иҷроияи ПТ",
    org: "Канцелярия",
    initials: "ДИ",
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "r4",
    name: "Беҳруз Насрдинов",
    org: "Министерство Финансов",
    initials: "БН",
    color: "bg-amber-100 text-amber-700",
  },
  {
    id: "r5",
    name: "Шамсӣ Аҳмадбеков",
    org: "Агентии инноватсия",
    initials: "ША",
    color: "bg-rose-100 text-rose-700",
  },
];

const INITIAL_FINAL_SIGNER: FinalSigner = {
  id: "s1",
  name: "Александр В.",
  role: "Инициатор / Автор",
  initials: "АВ",
  color: "bg-blue-100 text-blue-700",
  dsApplied: false,
  dsLoading: false,
};

const FONT_SIZES = [
  "10",
  "11",
  "12",
  "13",
  "14",
  "16",
  "18",
  "20",
  "24",
  "28",
  "36",
];

const INBOX_DOC_TYPES: Record<string, string> = {
  "1": "Маълумотнома",
  "2": "Дархост",
  "3": "Гузориш",
  "4": "Дархост",
  "5": "Ариза",
  "6": "Маълумотнома",
  "7": "Гузориш",
  "8": "Дархост",
};

const INBOX_DOC_TYPE_STYLE: Record<string, string> = {
  Маълумотнома: "bg-indigo-50 text-indigo-700 border-indigo-100",
  Дархост: "bg-purple-50 text-purple-700 border-purple-100",
  Гузориш: "bg-teal-50 text-teal-700 border-teal-100",
  Ариза: "bg-amber-50 text-amber-700 border-amber-100",
};

const MOCK_CONTENT_LINES = [
  "Ҳурматли раҳбар!",
  "",
  "Вазорати Молия аз Шумо хоҳиш менамояд, ки мувофиқи буҷети тасдиқшуда маълумоти пурраро дар мӯҳлати муқаррарнамудашуда пешниҳод намоед.",
  "",
  "Мо интизорем, ки ҳамкории самаранок миёни идораҳои мо боиси иҷрои баландсифати вазифаҳои маъмурӣ гардад.",
  "",
  "Дар асоси санадҳои меъёрии ҳуқуқии амалкунанда лозим аст маълумоти зерин пешниҳод карда шавад:",
  "",
  "1. Ҳисоботи молиявии семоҳаи якум;",
  "2. Нақшаи харҷҳои буҷетӣ барои давраи минбаъда;",
  "3. Маълумот оид ба иҷрои супоришҳои пешин.",
  "",
  "Бо эҳтиром ва арзу эҳтиром,",
];

const OUTBOX_STATUS_LABEL: Record<Status, string> = {
  "на резолюции": "Подготовка",
  "на исполнении": "Подготовка",
  "на согласовании": "Согласование",
  "на подпись": "На подпись",
  завершено: "Отправлено",
};

const OUTBOX_STATUS_STYLE: Record<Status, string> = {
  "на резолюции": "bg-amber-50 text-amber-600 border-amber-100",
  "на исполнении": "bg-amber-50 text-amber-600 border-amber-100",
  "на согласовании": "bg-blue-50 text-blue-600 border-blue-100",
  "на подпись": "bg-purple-50 text-purple-600 border-purple-100",
  завершено: "bg-emerald-50 text-emerald-600 border-emerald-100",
};

// ── Вспомогательные функции (QR и ЭЦП) ───────────────────────────────────────
function generateQRMatrix(seed: string, size: number = 21): boolean[][] {
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

const QRCodeSVG = ({ value, size = 48 }: { value: string; size?: number }) => {
  const GRID = 21;
  const matrix = generateQRMatrix(value, GRID);
  const cellSize = size / GRID;
  const cells: { x: number; y: number }[] = [];
  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      if (matrix[row][col])
        cells.push({ x: col * cellSize, y: row * cellSize });
    }
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: "block", flexShrink: 0 }}
      aria-label="QR-код электронной подписи"
    >
      <rect width={size} height={size} fill="white" />
      {cells.map((cell, i) => (
        <rect
          key={i}
          x={cell.x}
          y={cell.y}
          width={cellSize}
          height={cellSize}
          fill="#1e3a8a"
        />
      ))}
    </svg>
  );
};

const DSStamp = ({
  name,
  certSerial,
  signedAt,
  validUntil,
}: {
  name: string;
  certSerial: string;
  signedAt: string;
  validUntil: string;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.93, y: 4 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ duration: 0.28, ease: "easeOut" }}
    className="flex items-stretch rounded-md overflow-hidden shadow-sm"
    style={{ border: "1.5px solid #3b82f6", background: "#fff", minWidth: 0 }}
  >
    <div className="flex flex-col flex-shrink-0" style={{ width: 7 }}>
      <div style={{ flex: 1, background: "#CC0001" }} />
      <div
        style={{
          flex: 1,
          background: "#FFFFFF",
          borderTop: "0.5px solid #e2e8f0",
          borderBottom: "0.5px solid #e2e8f0",
        }}
      />
      <div style={{ flex: 1, background: "#009A44" }} />
    </div>
    <div
      className="flex-1 px-2.5 py-2 min-w-0"
      style={{ background: "#eff6ff" }}
    >
      <p
        style={{
          fontFamily: "Times New Roman, serif",
          fontWeight: 700,
          fontSize: 11,
          color: "#1e3a8a",
          textAlign: "center",
          lineHeight: 1.3,
          marginBottom: 2,
        }}
      >
        Имзои электронии раками
      </p>
      <div style={{ borderTop: "1px solid #93c5fd", marginBottom: 4 }} />
      <p
        style={{
          fontFamily: "Times New Roman, serif",
          fontWeight: 600,
          fontSize: 9,
          color: "#1d4ed8",
          textAlign: "center",
          lineHeight: 1.3,
          marginBottom: 5,
        }}
      >
        Маълумоти имзои электронии раками
      </p>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            flex: 1,
            minWidth: 0,
          }}
        >
          {[
            ["Сертификат:", certSerial],
            ["Дорандаи имзо:", name],
            ["Санаи имзо:", signedAt],
            ["Санаи додод:", validUntil],
          ].map(([label, val], i) => (
            <div key={i} style={{ display: "flex", gap: 4 }}>
              <span
                style={{
                  fontSize: 8.5,
                  fontWeight: 700,
                  color: "#1e40af",
                  whiteSpace: "nowrap",
                  minWidth: 60,
                }}
              >
                {label}
              </span>
              <span
                style={{
                  fontSize: 8.5,
                  color: "#1e293b",
                  fontFamily: label === "Сертификат:" ? "monospace" : undefined,
                  wordBreak: "break-all",
                }}
              >
                {val}
              </span>
            </div>
          ))}
        </div>
        <div
          style={{
            flexShrink: 0,
            border: "1px solid #bfdbfe",
            borderRadius: 3,
            padding: 2,
            background: "#fff",
          }}
        >
          <QRCodeSVG value={`${certSerial}|${name}|${signedAt}`} size={52} />
        </div>
      </div>
    </div>
  </motion.div>
);

// ── Модалки и UI-Блоки ────────────────────────────────────────────────────────
const OrgStructureNodeItem = ({
  node,
  depth = 0,
  onSelect,
}: {
  node: OrgStructureNode;
  depth?: number;
  onSelect: (node: OrgStructureNode) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = !!(node.children && node.children.length > 0);
  const isLeaf = !hasChildren;
  return (
    <div key={node.id}>
      <motion.button
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        onClick={() => {
          if (isLeaf) onSelect(node);
          if (hasChildren) setIsExpanded(!isExpanded);
        }}
        className={cn(
          "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-left",
          isLeaf
            ? "hover:bg-blue-50 cursor-pointer border border-slate-200"
            : "hover:bg-slate-50",
        )}
        style={{ marginLeft: `${depth * 16}px` }}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="flex items-center justify-center w-5 h-5 flex-shrink-0"
          >
            <motion.div
              animate={{ rotate: isExpanded ? 0 : -90 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={14} className="text-slate-400" />
            </motion.div>
          </button>
        )}
        {isLeaf && <div className="w-5 flex-shrink-0" />}
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
            node.color,
          )}
        >
          {node.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">
            {node.name}
          </p>
          <p className="text-[11px] text-slate-500 truncate">{node.position}</p>
        </div>
      </motion.button>
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-1">
              {node.children!.map((child) => (
                <OrgStructureNodeItem
                  key={child.id}
                  node={child}
                  depth={depth + 1}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const OrgStructureModal = ({
  onSelect,
  onClose,
}: {
  onSelect: (node: OrgStructureNode) => void;
  onClose: () => void;
}) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-[3px]"
      onClick={onClose}
    />
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, y: 16 }}
      transition={{ duration: 0.26, ease: [0.32, 0.72, 0, 1] }}
      className="fixed inset-4 z-[101] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Users size={17} className="text-white" />
          </div>
          <div>
            <p className="text-base font-bold text-slate-900 leading-tight">
              Структура организации
            </p>
            <p className="text-xs text-slate-400 font-medium">
              Выберите исполнителя
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-sm font-semibold"
        >
          <X size={14} />
          <span>Закрыть</span>
        </button>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-1">
          <OrgStructureNodeItem
            node={ORG_STRUCTURE}
            onSelect={(node) => {
              onSelect(node);
              onClose();
            }}
          />
        </div>
      </div>
    </motion.div>
  </AnimatePresence>
);

const DSStampAppendix = ({
  signerName,
  signerInitials,
  signerColor,
  certSerial,
  signedAt,
  validUntil,
  onClose,
}: {
  signerName: string;
  signerInitials: string;
  signerColor: string;
  certSerial: string;
  signedAt: string;
  validUntil: string;
  onClose: () => void;
}) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-[3px]"
      onClick={onClose}
    />
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, y: 16 }}
      transition={{ duration: 0.26, ease: [0.32, 0.72, 0, 1] }}
      className="fixed inset-4 z-[101] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Shield size={17} className="text-white" />
          </div>
          <div>
            <p className="text-base font-bold text-slate-900 leading-tight">
              Приложение №1
            </p>
            <p className="text-xs text-slate-400 font-medium">
              Электронная подпись
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-sm font-semibold"
        >
          <X size={14} />
          <span>Закрыть</span>
        </button>
      </div>
      <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-[#F8FAFC]">
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <p className="text-sm font-semibold text-slate-600 mb-4 text-center">
            Приложение № 1 к письму
          </p>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="text-center mb-6">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                Электронная подпись
              </p>
              <div
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold mx-auto",
                  signerColor,
                )}
              >
                {signerInitials}
              </div>
            </div>
            <div className="space-y-3 mb-6">
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
                  Подписано
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {signerName}
                </p>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
                    Дата подписи
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {signedAt}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
                    Номер сертификата
                  </p>
                  <p className="text-xs font-mono text-slate-700">
                    {certSerial}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
                  Действителен
                </p>
                <p className="text-sm text-slate-700">{validUntil}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <DSStamp
                name={signerName}
                certSerial={certSerial}
                signedAt={signedAt}
                validUntil={validUntil}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  </AnimatePresence>
);

const CollapsibleBlock = ({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3.5 border-b border-slate-100 hover:bg-slate-50 transition-colors"
      >
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {title}
        </p>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={14} className="text-slate-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TBtn = ({
  onMouseDown,
  title,
  children,
  active,
}: {
  onMouseDown: (e: React.MouseEvent) => void;
  title: string;
  children: React.ReactNode;
  active?: boolean;
}) => (
  <button
    onMouseDown={onMouseDown}
    title={title}
    className={cn(
      "p-1.5 rounded transition-colors flex-shrink-0",
      active
        ? "bg-blue-100 text-blue-700"
        : "hover:bg-slate-100 text-slate-500 hover:text-slate-800",
    )}
  >
    {children}
  </button>
);

function FileTextIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  );
}

const PreviewModal = ({
  subject,
  editorHtml,
  orientation,
  onClose,
  stampVisible,
  stampPos,
  stampSize,
  stampSignerName,
  stampCertSerial,
  stampSignedAt,
  stampValidUntil,
}: {
  subject: string;
  editorHtml: string;
  orientation: PageOrientation;
  onClose: () => void;
  stampVisible: boolean;
  stampPos: { x: number; y: number };
  stampSize: { width: number; height: "auto" | number };
  stampSignerName: string;
  stampCertSerial: string;
  stampSignedAt: string;
  stampValidUntil: string;
}) => {
  const isLandscape = orientation === "landscape";
  const pageWidth = isLandscape ? 1122 : 794;
  const pageHeight = isLandscape ? 794 : 1122;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex flex-col bg-slate-700/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="flex-shrink-0 flex items-center justify-between px-6 py-3 bg-slate-800 border-b border-slate-600"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Eye size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                Предварительный просмотр
              </p>
              <p className="text-xs text-slate-400">
                {isLandscape ? "Альбомная ориентация" : "Книжная ориентация"} ·
                A4
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <X size={15} />
            <span>Закрыть</span>
          </button>
        </div>
        <div
          className="flex-1 overflow-auto flex items-start justify-center py-10 px-8"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white shadow-2xl"
            style={{
              width: pageWidth,
              minHeight: pageHeight,
              padding: "72px 80px",
              fontFamily: "Times New Roman, serif",
              fontSize: 14,
              lineHeight: 2,
              color: "#1e293b",
              position: "relative",
            }}
          >
            {editorHtml ? (
              <div dangerouslySetInnerHTML={{ __html: editorHtml }} />
            ) : (
              <p style={{ color: "#94a3b8", fontStyle: "italic" }}>
                Текст письма не введён...
              </p>
            )}
            {stampVisible && (
              <div
                style={{
                  position: "absolute",
                  left: stampPos.x,
                  top: stampPos.y,
                  width: stampSize.width,
                  height:
                    stampSize.height === "auto" ? undefined : stampSize.height,
                  overflow: "hidden",
                  pointerEvents: "none",
                }}
              >
                <DSStamp
                  name={stampSignerName}
                  certSerial={stampCertSerial}
                  signedAt={stampSignedAt}
                  validUntil={stampValidUntil}
                />
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// ── Экспорт 1: Модалка просмотра документа (Document Drawer) ──────────────────
const DocumentDrawer = ({
  item,
  isOutbox,
  onClose,
}: {
  item: RegistryItem;
  isOutbox: boolean;
  onClose: () => void;
}) => {
  const docType = INBOX_DOC_TYPES[item.id] ?? "Дархост";
  const docTypeStyle =
    INBOX_DOC_TYPE_STYLE[docType] ??
    "bg-slate-50 text-slate-700 border-slate-200";
  const inboxStatusStyle: Record<Status, string> = {
    "на резолюции": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "на исполнении": "bg-amber-50 text-amber-700 border-amber-200",
    "на согласовании": "bg-blue-50 text-blue-700 border-blue-200",
    "на подпись": "bg-purple-50 text-purple-700 border-purple-200",
    завершено: "bg-slate-100 text-slate-600 border-slate-200",
  };
  const statusStyle = isOutbox
    ? OUTBOX_STATUS_STYLE[item.status]
    : inboxStatusStyle[item.status];
  const statusLabel = isOutbox ? OUTBOX_STATUS_LABEL[item.status] : item.status;
  const [selectedExecutor, setSelectedExecutor] =
    useState<RecipientOption | null>(
      item.executor ? RECIPIENT_OPTIONS[0] : null,
    );
  const [taskTemplate, setTaskTemplate] = useState(
    "Ознакомиться и утвердить документ",
  );
  const [customTask, setCustomTask] = useState("");
  const [showTaskEditor, setShowTaskEditor] = useState(false);
  const [dueDate, setDueDate] = useState("15.02.2026");
  const [visaStatus, setVisaStatus] = useState("на рассмотрении");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [ecpApplied, setEcpApplied] = useState(false);
  const [ecpLoading, setEcpLoading] = useState(false);
  const [showOrgStructure, setShowOrgStructure] = useState(false);
  const [showDSStampAppendix, setShowDSStampAppendix] = useState(false);
  const TASK_TEMPLATES = [
    "Ознакомиться и утвердить документ",
    "Согласовать содержание",
    "Проверить и подписать",
    "Рассмотреть предложения",
  ];
  const VISA_STATUSES = ["на рассмотрении", "согласовано", "требует доработки"];

  return (
    <AnimatePresence>
      <motion.div
        key="drawer-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        key="drawer-panel"
        initial={{ opacity: 0, scale: 0.97, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 16 }}
        transition={{ duration: 0.26, ease: [0.32, 0.72, 0, 1] }}
        className="fixed inset-4 z-50 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Eye size={17} className="text-white" />
            </div>
            <div>
              <p className="text-base font-bold text-slate-900 leading-tight">
                Просмотр документа
              </p>
              <p className="text-xs text-slate-400 font-medium">
                {item.inboundNumber} · {item.outboundNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-sm font-semibold">
              <Download size={14} />
              <span>Скачать</span>
            </button>
            <button className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-colors text-sm font-semibold">
              <Trash size={14} />
              <span>Удалить</span>
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-sm font-semibold"
            >
              <X size={14} />
              <span>Закрыть</span>
            </button>
          </div>
        </div>
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <aside className="w-72 flex-shrink-0 border-r border-slate-100 overflow-y-auto bg-slate-50/60 flex flex-col">
            <div className="p-5 space-y-3">
              <CollapsibleBlock title="Детали письма" defaultOpen={true}>
                <div className="px-4 py-3.5 border-b border-slate-50">
                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                    От кого
                  </p>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700 flex-shrink-0">
                      {item.sender
                        .split(" ")
                        .map((w: string) => w[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 leading-snug">
                        {item.sender}
                      </p>
                      <p className="text-[10px] text-slate-400">Отправитель</p>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3.5 border-b border-slate-50">
                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                    Копия
                  </p>
                  <p className="text-sm text-slate-400 italic">Не указано</p>
                </div>
                <div className="px-4 py-3.5 border-b border-slate-50">
                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                    Тема
                  </p>
                  <p className="text-sm font-semibold text-slate-800 leading-snug">
                    {item.subject}
                  </p>
                </div>
                <div className="px-4 py-3.5 border-b border-slate-50">
                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                    Дата
                  </p>
                  <div className="flex items-center gap-2">
                    <Calendar
                      size={14}
                      className="text-blue-500 flex-shrink-0"
                    />
                    <p className="text-sm font-semibold text-slate-800">
                      {item.date}
                    </p>
                  </div>
                </div>
                <div className="px-4 py-3.5 border-b border-slate-50">
                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                    Номер письма
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-slate-400 font-medium">
                        Входящий
                      </span>
                      <span className="text-sm font-bold text-slate-900 font-mono">
                        {item.inboundNumber}
                      </span>
                    </div>
                    <div className="w-px h-8 bg-slate-100 mx-1" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-slate-400 font-medium">
                        Исходящий
                      </span>
                      <span className="text-sm font-bold text-slate-900 font-mono">
                        {item.outboundNumber}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3.5 border-b border-slate-50">
                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                    Тип документа
                  </p>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border",
                      docTypeStyle,
                    )}
                  >
                    <FileType size={12} />
                    <span>{docType}</span>
                  </span>
                </div>
                <div className="px-4 py-3.5">
                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                    Статус документа
                  </p>
                  <span
                    className={cn(
                      "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border capitalize",
                      statusStyle,
                    )}
                  >
                    {statusLabel}
                  </span>
                  {item.executor && (
                    <div className="mt-3 flex items-center gap-2 pt-3 border-t border-slate-200">
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 border border-slate-200 flex-shrink-0">
                        {item.executor.split(" ")[0][0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {item.executor}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Исполнитель
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CollapsibleBlock>

              <CollapsibleBlock title="Виза" defaultOpen={true}>
                <div className="px-4 py-3.5 space-y-3">
                  <div className="border-b border-slate-50 pb-3">
                    <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                      Исполнитель
                    </p>
                    <button
                      onClick={() => setShowOrgStructure(true)}
                      className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors text-sm font-medium text-slate-700"
                    >
                      <span className="flex items-center gap-2">
                        <User size={13} className="text-slate-400" />
                        {selectedExecutor
                          ? selectedExecutor.name
                          : "Выбрать исполнителя"}
                      </span>
                      <ChevronRight size={13} className="text-slate-400" />
                    </button>
                  </div>
                  <div className="border-b border-slate-50 pb-3">
                    <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                      Поручение
                    </p>
                    {!showTaskEditor ? (
                      <button
                        onClick={() => setShowTaskEditor(true)}
                        className="w-full flex items-start gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors text-left"
                      >
                        <MessageSquare
                          size={13}
                          className="text-blue-500 mt-0.5 flex-shrink-0"
                        />
                        <p className="text-[11px] font-medium text-blue-700">
                          {customTask || taskTemplate}
                        </p>
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-1.5">
                          {TASK_TEMPLATES.map((template) => (
                            <button
                              key={template}
                              onClick={() => {
                                setTaskTemplate(template);
                                setCustomTask("");
                                setShowTaskEditor(false);
                              }}
                              className="text-[10px] px-2 py-1.5 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-50 transition-colors font-medium"
                            >
                              {template}
                            </button>
                          ))}
                        </div>
                        <div>
                          <label className="text-[9px] font-semibold text-slate-400 mb-1 block">
                            Свой текст
                          </label>
                          <textarea
                            value={customTask}
                            onChange={(e) => setCustomTask(e.target.value)}
                            placeholder="Введите поручение..."
                            className="w-full text-[11px] text-slate-700 placeholder-slate-400 bg-amber-50/60 border border-amber-100 rounded-lg px-2.5 py-2 resize-none outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all"
                            rows={2}
                          />
                        </div>
                        <button
                          onClick={() => setShowTaskEditor(false)}
                          className="w-full text-[10px] px-2 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors font-semibold"
                        >
                          Готово
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="border-b border-slate-50 pb-3">
                    <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                      Срок
                    </p>
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                      <Calendar
                        size={13}
                        className="text-blue-500 flex-shrink-0"
                      />
                      <input
                        type="text"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="flex-1 bg-transparent text-sm font-medium text-slate-700 outline-none"
                      />
                    </div>
                  </div>
                  <div className="border-b border-slate-50 pb-3">
                    <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                      Статус
                    </p>
                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowStatusDropdown(!showStatusDropdown)
                        }
                        className={cn(
                          "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium border",
                          visaStatus === "на рассмотрении"
                            ? "bg-blue-50 border-blue-200 text-blue-700"
                            : visaStatus === "согласовано"
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : "bg-amber-50 border-amber-200 text-amber-700",
                        )}
                      >
                        <span>{visaStatus}</span>
                        <ChevronDown
                          size={13}
                          className={cn(
                            "transition-transform",
                            showStatusDropdown && "rotate-180",
                          )}
                        />
                      </button>
                      <AnimatePresence>
                        {showStatusDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden py-1"
                          >
                            {VISA_STATUSES.map((s) => (
                              <button
                                key={s}
                                onClick={() => {
                                  setVisaStatus(s);
                                  setShowStatusDropdown(false);
                                }}
                                className="w-full px-3 py-1.5 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-b-0 text-sm font-medium text-slate-700"
                              >
                                {s}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  <div className="pt-2">
                    <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                      Электронная подпись
                    </p>
                    {!ecpApplied ? (
                      <button
                        onClick={() => {
                          setEcpLoading(true);
                          setTimeout(() => {
                            setEcpLoading(false);
                            setEcpApplied(true);
                          }, 1500);
                        }}
                        disabled={ecpLoading}
                        className={cn(
                          "w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all border",
                          ecpLoading
                            ? "bg-slate-100 text-slate-400 border-slate-200 cursor-wait"
                            : "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100",
                        )}
                      >
                        {ecpLoading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            <Clock size={12} />
                          </motion.div>
                        ) : (
                          <Shield size={12} />
                        )}
                        <span>
                          {ecpLoading ? "Применяю подпись..." : "Применить ЭЦП"}
                        </span>
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                          <Check
                            size={12}
                            className="text-emerald-600 flex-shrink-0"
                          />
                          <span className="text-[11px] font-semibold text-emerald-700">
                            ЭЦП применена
                          </span>
                        </div>
                        <button
                          onClick={() => setShowDSStampAppendix(true)}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-lg text-[11px] font-semibold transition-colors"
                        >
                          <FileType size={12} />
                          <span>Показать Приложение №1</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </CollapsibleBlock>
            </div>
          </aside>

          <div className="flex-1 overflow-auto bg-[#E8EAED] flex items-start justify-center py-8 px-8">
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              className="bg-white shadow-xl border border-slate-300/30 w-full max-w-[794px] min-h-[1000px]"
              style={{
                padding: "64px 72px 80px",
                fontFamily: "Times New Roman, serif",
                fontSize: 14,
                lineHeight: 2,
                color: "#1e293b",
                position: "relative",
              }}
            >
              <div className="mb-8">
                <div
                  className="text-right mb-6"
                  style={{ fontFamily: "Times New Roman, serif", fontSize: 13 }}
                >
                  <p style={{ marginBottom: 2 }}>
                    <strong>{item.sender}</strong>
                  </p>
                  <p style={{ color: "#64748b" }}>{item.date}</p>
                  <p style={{ color: "#64748b" }}>№ {item.inboundNumber}</p>
                </div>
                <div className="text-center mb-8">
                  <p
                    className="font-bold text-lg"
                    style={{
                      fontFamily: "Times New Roman, serif",
                      textDecoration: "underline",
                      textUnderlineOffset: 4,
                    }}
                  >
                    {item.subject}
                  </p>
                </div>
              </div>
              <div
                style={{
                  fontFamily: "Times New Roman, serif",
                  fontSize: 14,
                  lineHeight: 2,
                }}
              >
                {MOCK_CONTENT_LINES.map((line, i) =>
                  line === "" ? (
                    <div key={`line-${i}`} style={{ height: "0.5em" }} />
                  ) : (
                    <p
                      key={`line-${i}`}
                      style={{
                        textIndent:
                          line.startsWith("Ҳурматли") ||
                          line.startsWith("Мо") ||
                          line.startsWith("Дар") ||
                          line.startsWith("Бо") ||
                          line.startsWith("Вазорати")
                            ? "2em"
                            : 0,
                        marginBottom: 0,
                      }}
                    >
                      {line}
                    </p>
                  ),
                )}
              </div>
              <div
                className="mt-12"
                style={{ fontFamily: "Times New Roman, serif", fontSize: 14 }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold">Вазири молия</p>
                    <p style={{ color: "#64748b", marginTop: 32 }}>
                      _____________________
                    </p>
                    <p style={{ fontSize: 12, color: "#94a3b8" }}>
                      подпись / мӯҳр
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{item.sender}</p>
                    <p style={{ color: "#64748b", marginTop: 4 }}>
                      {item.date}
                    </p>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 48 }}>
                <DSStamp
                  name={item.sender}
                  certSerial={`SN-2026-${item.inboundNumber.replace(/[^A-Za-z0-9]/g, "")}-84201`}
                  signedAt={item.date}
                  validUntil="с 20.03.2025 до 20.03.2026"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
      {showOrgStructure && (
        <OrgStructureModal
          onSelect={(node) => {
            setSelectedExecutor({
              id: node.id,
              name: node.name,
              org: node.position,
              initials: node.initials,
              color: node.color,
            });
            setShowOrgStructure(false);
          }}
          onClose={() => setShowOrgStructure(false)}
        />
      )}
      {showDSStampAppendix && (
        <DSStampAppendix
          signerName={selectedExecutor?.name ?? "Неизвестно"}
          signerInitials={selectedExecutor?.initials ?? "?"}
          signerColor={selectedExecutor?.color ?? "bg-slate-100 text-slate-700"}
          certSerial={`SN-2026-${selectedExecutor?.initials ?? "??"}-84201`}
          signedAt="03.02.2026"
          validUntil="с 20.03.2025 до 20.03.2026"
          onClose={() => setShowDSStampAppendix(false)}
        />
      )}
    </AnimatePresence>
  );
};

// ── Экспорт 2: Главный компонент создания (Create Internal Correspondence) ────
export const CreateInternalCorrespondence = ({
  onBack = () => {},
}: {
  onBack?: () => void;
}) => {
  const [to, setTo] = useState<RecipientOption[]>([]);
  const [cc, setCc] = useState<RecipientOption[]>([]);
  const [subject, setSubject] = useState("");
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [approvers, setApprovers] = useState<Approver[]>([]);
  const [finalSigner, setFinalSigner] =
    useState<FinalSigner>(INITIAL_FINAL_SIGNER);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [showCcDropdown, setShowCcDropdown] = useState(false);
  const [showApproverDropdown, setShowApproverDropdown] = useState(false);
  const [toSearch, setToSearch] = useState("");
  const [ccSearch, setCcSearch] = useState("");
  const [approverSearch, setApproverSearch] = useState("");
  const [showCcField, setShowCcField] = useState(false);
  const [sent, setSent] = useState(false);
  const [letterType, setLetterType] = useState<LetterType | null>(null);
  const [showLetterTypeDropdown, setShowLetterTypeDropdown] = useState(false);
  const [importance, setImportance] = useState<ImportanceLevel>("medium");
  const [showImportanceDropdown, setShowImportanceDropdown] = useState(false);
  const [fontSize, setFontSize] = useState("14");
  const [showFontSizeDropdown, setShowFontSizeDropdown] = useState(false);
  const [orientation, setOrientation] = useState<PageOrientation>("portrait");
  const [showPreview, setShowPreview] = useState(false);
  const [stampVisible, setStampVisible] = useState(false);
  const [stampPos, setStampPos] = useState({ x: 40, y: 40 });
  const [stampSize, setStampSize] = useState({
    width: 320,
    height: "auto" as "auto" | number,
  });
  const isDraggingStamp = useRef(false);
  const isResizingStamp = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ mouseX: 0, mouseY: 0, startW: 320, startH: 0 });
  const stampRef = useRef<HTMLDivElement>(null);
  const pageCanvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const isLandscape = orientation === "landscape";
  const PAGE_WIDTH = isLandscape ? 1122 : 794;
  const PAGE_HEIGHT = isLandscape ? 794 : 1122;
  const PAGE_PAD_H = 80;
  const PAGE_PAD_V = 72;
  const CONTENT_HEIGHT = PAGE_HEIGHT - PAGE_PAD_V * 2;

  const filteredToOptions = RECIPIENT_OPTIONS.filter(
    (r) =>
      !to.find((t) => t.id === r.id) &&
      (r.name.toLowerCase().includes(toSearch.toLowerCase()) ||
        r.org.toLowerCase().includes(toSearch.toLowerCase())),
  );
  const filteredCcOptions = RECIPIENT_OPTIONS.filter(
    (r) =>
      !cc.find((c) => c.id === r.id) &&
      (r.name.toLowerCase().includes(ccSearch.toLowerCase()) ||
        r.org.toLowerCase().includes(ccSearch.toLowerCase())),
  );
  const availableApprovers = RECIPIENT_OPTIONS.filter(
    (r) =>
      !approvers.find((a) => a.id === `apr-${r.id}`) &&
      finalSigner.id !== `sgn-${r.id}` &&
      (r.name.toLowerCase().includes(approverSearch.toLowerCase()) ||
        r.org.toLowerCase().includes(approverSearch.toLowerCase())),
  );

  const execCmd = useCallback((command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
  }, []);

  const handleEditorKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const tabNode = document.createTextNode("\u00a0\u00a0\u00a0\u00a0");
        range.insertNode(tabNode);
        range.setStartAfter(tabNode);
        range.setEndAfter(tabNode);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    },
    [],
  );

  const handleFontSize = (size: string) => {
    setFontSize(size);
    setShowFontSizeDropdown(false);
    editorRef.current?.focus();
    const sizeMap: Record<string, string> = {
      "10": "1",
      "11": "1",
      "12": "2",
      "13": "3",
      "14": "3",
      "16": "4",
      "18": "4",
      "20": "5",
      "24": "6",
      "28": "6",
      "36": "7",
    };
    document.execCommand("fontSize", false, sizeMap[size] ?? "3");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles: AttachedFile[] = Array.from(files).map((f) => ({
      id: `f-${Date.now()}-${f.name}`,
      name: f.name,
      size:
        f.size > 1024 * 1024
          ? `${(f.size / 1024 / 1024).toFixed(1)} МБ`
          : `${(f.size / 1024).toFixed(0)} КБ`,
      type: f.name.split(".").pop()?.toUpperCase() ?? "FILE",
    }));
    setAttachments((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  };

  const applyFinalDS = () => {
    setFinalSigner((prev) => ({ ...prev, dsLoading: true }));
    setTimeout(
      () =>
        setFinalSigner((prev) => ({
          ...prev,
          dsLoading: false,
          dsApplied: true,
        })),
      1800,
    );
  };

  const applyApproverDS = (id: string) => {
    setApprovers((prev) =>
      prev.map((a) => (a.id === id ? { ...a, dsLoading: true } : a)),
    );
    setTimeout(
      () =>
        setApprovers((prev) =>
          prev.map((a) =>
            a.id === id ? { ...a, dsLoading: false, dsApplied: true } : a,
          ),
        ),
      1600,
    );
  };

  const toggleApproverComment = (id: string) => {
    setApprovers((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, showCommentInput: !a.showCommentInput } : a,
      ),
    );
  };

  const updateApproverComment = (id: string, comment: string) => {
    setApprovers((prev) =>
      prev.map((a) => (a.id === id ? { ...a, comment } : a)),
    );
  };

  const addApprover = (r: RecipientOption) => {
    setApprovers((prev) => [
      ...prev,
      {
        id: `apr-${r.id}`,
        name: r.name,
        role: r.org,
        initials: r.initials,
        color: r.color,
        approved: false,
        approving: false,
        comment: "",
        showCommentInput: false,
        dsApplied: false,
        dsLoading: false,
      },
    ]);
    setShowApproverDropdown(false);
    setApproverSearch("");
  };

  const handleInsertStamp = () => {
    setStampVisible(true);
    setStampPos({ x: 40, y: 40 });
    setStampSize({ width: 320, height: "auto" });
  };

  const handleStampMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingStamp.current = true;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const onMouseMove = (ev: MouseEvent) => {
      if (!isDraggingStamp.current || !pageCanvasRef.current) return;
      const cr = pageCanvasRef.current.getBoundingClientRect();
      setStampPos({
        x: Math.max(
          0,
          Math.min(
            ev.clientX - cr.left - dragOffset.current.x,
            cr.width -
              (typeof stampSize.width === "number" ? stampSize.width : 320),
          ),
        ),
        y: Math.max(
          0,
          Math.min(ev.clientY - cr.top - dragOffset.current.y, cr.height - 120),
        ),
      });
    };
    const onMouseUp = () => {
      isDraggingStamp.current = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isResizingStamp.current = true;
    resizeStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startW: typeof stampSize.width === "number" ? stampSize.width : 320,
      startH: stampRef.current ? stampRef.current.offsetHeight : 120,
    };
    const onMouseMove = (ev: MouseEvent) => {
      if (!isResizingStamp.current) return;
      setStampSize({
        width: Math.max(
          200,
          Math.min(
            resizeStart.current.startW +
              ev.clientX -
              resizeStart.current.mouseX,
            600,
          ),
        ),
        height: Math.max(
          100,
          resizeStart.current.startH + ev.clientY - resizeStart.current.mouseY,
        ),
      });
    };
    const onMouseUp = () => {
      isResizingStamp.current = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const selectedImportance = IMPORTANCE_OPTIONS.find(
    (o) => o.value === importance,
  )!;

  if (sent) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F8FAFC] p-10 h-screen w-full">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-lg border border-slate-100 p-12 flex flex-col items-center gap-4 max-w-sm w-full text-center"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center">
            <Check size={32} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Письмо отправлено
          </h2>
          <p className="text-sm text-slate-500">
            Ваше письмо было успешно подписано и отправлено получателям.
          </p>
          <button
            onClick={onBack}
            className="mt-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Вернуться назад
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8FAFC] h-screen w-full flex flex-col">
      {showPreview && (
        <PreviewModal
          subject={subject}
          editorHtml={editorRef.current?.innerHTML ?? ""}
          orientation={orientation}
          onClose={() => setShowPreview(false)}
          stampVisible={stampVisible && finalSigner.dsApplied}
          stampPos={stampPos}
          stampSize={stampSize}
          stampSignerName={finalSigner.name}
          stampCertSerial={`SN-2026-${finalSigner.initials}-84201`}
          stampSignedAt="03.02.2026"
          stampValidUntil="с 20.03.2025 до 20.03.2026"
        />
      )}
      <header className="bg-white border-b border-slate-200 px-6 py-4 z-10 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900">
              Создание письма
            </h1>
            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full border border-blue-100">
              Черновик
            </span>
          </div>
        </div>
      </header>

      <div className="w-full py-6 px-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors group"
            >
              <ArrowLeft
                size={16}
                className="group-hover:-translate-x-0.5 transition-transform"
              />
              <span>Назад</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700 transition-colors"
            >
              <Eye size={15} className="text-slate-500" />
              <span>Предварительный просмотр</span>
            </button>
            <button
              onClick={() => {
                if (!to.length || !subject.trim()) return;
                setSent(true);
              }}
              disabled={!to.length || !subject.trim()}
              className={cn(
                "flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-md",
                to.length && subject.trim()
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100 active:scale-95"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none",
              )}
            >
              <Send size={16} />
              <span>Отправить</span>
            </button>
          </div>
        </div>

        <div className="flex gap-5 items-start">
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-visible">
              <div className="px-6 pt-5 pb-4 border-b border-slate-100">
                <div className="flex items-start gap-3">
                  <label className="text-sm font-semibold text-slate-500 pt-2 w-20 flex-shrink-0">
                    Тип
                  </label>
                  <div className="relative flex-1">
                    <button
                      type="button"
                      onClick={() => setShowLetterTypeDropdown((v) => !v)}
                      onBlur={() =>
                        setTimeout(() => setShowLetterTypeDropdown(false), 150)
                      }
                      className={cn(
                        "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all",
                        letterType
                          ? "bg-indigo-50 border-indigo-200 text-indigo-800"
                          : "bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <FileType
                          size={15}
                          className={
                            letterType ? "text-indigo-500" : "text-slate-400"
                          }
                        />
                        {letterType ? (
                          <span>
                            <span className="font-semibold">{letterType}</span>
                            <span className="text-indigo-500 text-xs ml-2">
                              —{" "}
                              {
                                LETTER_TYPE_OPTIONS.find(
                                  (o) => o.value === letterType,
                                )?.desc
                              }
                            </span>
                          </span>
                        ) : (
                          <span>Выберите тип документа...</span>
                        )}
                      </div>
                      <ChevronDown
                        size={15}
                        className={cn(
                          "transition-transform",
                          showLetterTypeDropdown && "rotate-180",
                        )}
                      />
                    </button>
                    <AnimatePresence>
                      {showLetterTypeDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden py-1"
                        >
                          {LETTER_TYPE_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              onMouseDown={() => {
                                setLetterType(opt.value);
                                setShowLetterTypeDropdown(false);
                              }}
                              className={cn(
                                "w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors hover:bg-slate-50",
                                letterType === opt.value && "bg-slate-50",
                              )}
                            >
                              <div>
                                <p className="text-sm font-semibold text-slate-900">
                                  {opt.label}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {opt.desc}
                                </p>
                              </div>
                              {letterType === opt.value && (
                                <Check size={12} className="text-slate-400" />
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="relative flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowImportanceDropdown((v) => !v)}
                      onBlur={() =>
                        setTimeout(() => setShowImportanceDropdown(false), 150)
                      }
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all",
                        selectedImportance.badgeBg,
                        selectedImportance.badgeBorder,
                        selectedImportance.badgeText,
                      )}
                    >
                      <Flag size={14} className={selectedImportance.flagFill} />
                      <span>{selectedImportance.label}</span>
                      <ChevronDown
                        size={13}
                        className={cn(
                          "transition-transform",
                          showImportanceDropdown && "rotate-180",
                        )}
                      />
                    </button>
                    <AnimatePresence>
                      {showImportanceDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -6, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.97 }}
                          className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden py-1 min-w-[220px]"
                        >
                          {IMPORTANCE_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              onMouseDown={() => {
                                setImportance(opt.value);
                                setShowImportanceDropdown(false);
                              }}
                              className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-slate-50",
                                importance === opt.value && "bg-slate-50",
                              )}
                            >
                              <span
                                className={cn(
                                  "w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 border",
                                  IMPORTANCE_DOT[opt.value],
                                )}
                              />
                              <div className="flex-1">
                                <p
                                  className={cn(
                                    "text-sm font-semibold",
                                    opt.badgeText,
                                  )}
                                >
                                  {opt.label}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {opt.desc}
                                </p>
                              </div>
                              {importance === opt.value && (
                                <Check
                                  size={13}
                                  className="text-slate-400 flex-shrink-0"
                                />
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div className="px-6 pt-5 pb-4 border-b border-slate-100">
                <div className="flex items-start gap-3">
                  <label className="text-sm font-semibold text-slate-500 pt-2 w-20 flex-shrink-0">
                    Кому
                  </label>
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {to.map((r) => (
                        <span
                          key={r.id}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border",
                            r.color,
                          )}
                        >
                          <span>{r.initials}</span>
                          <span>{r.name}</span>
                          <button
                            onClick={() =>
                              setTo((prev) => prev.filter((x) => x.id !== r.id))
                            }
                            className="opacity-60 hover:opacity-100 transition-opacity ml-0.5"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Добавить получателя..."
                        className="w-full text-sm text-slate-700 placeholder-slate-400 bg-transparent border-0 outline-none focus:outline-none"
                        value={toSearch}
                        onChange={(e) => {
                          setToSearch(e.target.value);
                          setShowToDropdown(true);
                        }}
                        onFocus={() => setShowToDropdown(true)}
                        onBlur={() =>
                          setTimeout(() => setShowToDropdown(false), 150)
                        }
                      />
                      <AnimatePresence>
                        {showToDropdown && filteredToOptions.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            className="absolute left-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden"
                          >
                            {filteredToOptions.map((r) => (
                              <button
                                key={r.id}
                                onMouseDown={() => {
                                  setTo((prev) => [...prev, r]);
                                  setToSearch("");
                                  setShowToDropdown(false);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 transition-colors text-left"
                              >
                                <div
                                  className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                                    r.color,
                                  )}
                                >
                                  {r.initials}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">
                                    {r.name}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {r.org}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCcField((v) => !v)}
                    className="text-xs text-blue-600 font-semibold hover:text-blue-800 transition-colors pt-2 flex-shrink-0"
                  >
                    + Копия
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {showCcField && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4 border-b border-slate-100">
                      <div className="flex items-start gap-3">
                        <label className="text-sm font-semibold text-slate-500 pt-2 w-20 flex-shrink-0">
                          Копия
                        </label>
                        <div className="flex-1">
                          <div className="flex flex-wrap gap-2 mb-2">
                            {cc.map((r) => (
                              <span
                                key={r.id}
                                className={cn(
                                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border",
                                  r.color,
                                )}
                              >
                                <span>{r.initials}</span>
                                <span>{r.name}</span>
                                <button
                                  onClick={() =>
                                    setCc((prev) =>
                                      prev.filter((x) => x.id !== r.id),
                                    )
                                  }
                                  className="opacity-60 hover:opacity-100 transition-opacity ml-0.5"
                                >
                                  <X size={12} />
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Добавить получателя копии..."
                              className="w-full text-sm text-slate-700 placeholder-slate-400 bg-transparent border-0 outline-none focus:outline-none"
                              value={ccSearch}
                              onChange={(e) => {
                                setCcSearch(e.target.value);
                                setShowCcDropdown(true);
                              }}
                              onFocus={() => setShowCcDropdown(true)}
                              onBlur={() =>
                                setTimeout(() => setShowCcDropdown(false), 150)
                              }
                            />
                            <AnimatePresence>
                              {showCcDropdown &&
                                filteredCcOptions.length > 0 && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    className="absolute left-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden"
                                  >
                                    {filteredCcOptions.map((r) => (
                                      <button
                                        key={r.id}
                                        onMouseDown={() => {
                                          setCc((prev) => [...prev, r]);
                                          setCcSearch("");
                                          setShowCcDropdown(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left"
                                      >
                                        <div
                                          className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                                            r.color,
                                          )}
                                        >
                                          {r.initials}
                                        </div>
                                        <div>
                                          <p className="text-sm font-semibold text-slate-900">
                                            {r.name}
                                          </p>
                                          <p className="text-xs text-slate-500">
                                            {r.org}
                                          </p>
                                        </div>
                                      </button>
                                    ))}
                                  </motion.div>
                                )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-semibold text-slate-500 w-20 flex-shrink-0">
                    Тема
                  </label>
                  <input
                    type="text"
                    placeholder="Укажите тему письма..."
                    className="flex-1 text-sm text-slate-800 placeholder-slate-400 bg-transparent border-0 outline-none focus:outline-none"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
              </div>

              <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/60 flex flex-wrap items-center gap-0.5">
                <TBtn
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd("undo");
                  }}
                  title="Отменить"
                >
                  <Undo size={14} />
                </TBtn>
                <TBtn
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd("redo");
                  }}
                  title="Повторить"
                >
                  <Redo size={14} />
                </TBtn>
                <div className="w-px h-5 bg-slate-200 mx-1 flex-shrink-0" />
                <TBtn
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd("formatBlock", "h1");
                  }}
                  title="Заголовок 1"
                >
                  <Heading1 size={14} />
                </TBtn>
                <TBtn
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd("formatBlock", "h2");
                  }}
                  title="Заголовок 2"
                >
                  <Heading2 size={14} />
                </TBtn>
                <div className="w-px h-5 bg-slate-200 mx-1 flex-shrink-0" />
                <div className="relative flex-shrink-0">
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setShowFontSizeDropdown((v) => !v);
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs font-mono font-medium text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200 bg-white"
                  >
                    <span>{fontSize}px</span>
                    <ChevronDown
                      size={10}
                      className={cn(
                        "transition-transform",
                        showFontSizeDropdown && "rotate-180",
                      )}
                    />
                  </button>
                  <AnimatePresence>
                    {showFontSizeDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute left-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden py-1 min-w-[72px]"
                      >
                        {FONT_SIZES.map((s) => (
                          <button
                            key={s}
                            onMouseDown={() => handleFontSize(s)}
                            className={cn(
                              "w-full px-3 py-1.5 text-xs font-mono text-left hover:bg-slate-50 transition-colors",
                              fontSize === s &&
                                "bg-blue-50 text-blue-700 font-bold",
                            )}
                          >
                            {s}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="w-px h-5 bg-slate-200 mx-1 flex-shrink-0" />
                <TBtn
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd("bold");
                  }}
                  title="Жирный"
                >
                  <Bold size={14} />
                </TBtn>
                <TBtn
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd("italic");
                  }}
                  title="Курсив"
                >
                  <Italic size={14} />
                </TBtn>
                <TBtn
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd("underline");
                  }}
                  title="Подчёркнутый"
                >
                  <Underline size={14} />
                </TBtn>
                <TBtn
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd("strikeThrough");
                  }}
                  title="Зачёркнутый"
                >
                  <Strikethrough size={14} />
                </TBtn>
                <TBtn
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd("hiliteColor", "#fef08a");
                  }}
                  title="Выделить"
                >
                  <Highlighter size={14} />
                </TBtn>
                <div className="w-px h-5 bg-slate-200 mx-1 flex-shrink-0" />
                <TBtn
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd("justifyLeft");
                  }}
                  title="По левому краю"
                >
                  <AlignLeft size={14} />
                </TBtn>
                <TBtn
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd("justifyCenter");
                  }}
                  title="По центру"
                >
                  <AlignCenter size={14} />
                </TBtn>
                <TBtn
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd("justifyRight");
                  }}
                  title="По правому краю"
                >
                  <AlignRight size={14} />
                </TBtn>
                <TBtn
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd("justifyFull");
                  }}
                  title="По ширине"
                >
                  <AlignJustify size={14} />
                </TBtn>
                <div className="w-px h-5 bg-slate-200 mx-1 flex-shrink-0" />
                <TBtn
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd("insertUnorderedList");
                  }}
                  title="Маркированный список"
                >
                  <List size={14} />
                </TBtn>
                <TBtn
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd("insertOrderedList");
                  }}
                  title="Нумерованный список"
                >
                  <ListOrdered size={14} />
                </TBtn>
                <TBtn
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd("insertHorizontalRule");
                  }}
                  title="Горизонтальная линия"
                >
                  <Minus size={14} />
                </TBtn>
                <div className="w-px h-5 bg-slate-200 mx-1 flex-shrink-0" />
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setOrientation((o) =>
                      o === "portrait" ? "landscape" : "portrait",
                    );
                  }}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors border flex-shrink-0",
                    orientation === "landscape"
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100",
                  )}
                >
                  <Monitor size={16} />
                  <span>
                    {orientation === "portrait" ? "Книжный" : "Альбомный"}
                  </span>
                </button>
              </div>

              <div
                className="bg-[#E8EAED] overflow-auto"
                style={{ minHeight: 420 }}
              >
                <div className="py-8 px-8 flex justify-center">
                  <div
                    ref={pageCanvasRef}
                    className="bg-white shadow-xl border border-slate-300/30 relative"
                    style={{
                      width: PAGE_WIDTH,
                      minHeight: PAGE_HEIGHT,
                      padding: `${PAGE_PAD_V}px ${PAGE_PAD_H}px`,
                      fontFamily: "Times New Roman, serif",
                      fontSize: `${fontSize}px`,
                      lineHeight: 1.8,
                      color: "#1e293b",
                      boxSizing: "border-box",
                    }}
                  >
                    <div
                      ref={editorRef}
                      contentEditable
                      suppressContentEditableWarning
                      data-placeholder="Начните вводить текст письма..."
                      onKeyDown={handleEditorKeyDown}
                      style={{
                        outline: "none",
                        minHeight: CONTENT_HEIGHT,
                        fontFamily: "Times New Roman, serif",
                        fontSize: `${fontSize}px`,
                        lineHeight: 1.8,
                        color: "#1e293b",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                      className="focus:outline-none [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-slate-300 [&:empty]:before:italic [&:empty]:before:pointer-events-none"
                    />
                    {stampVisible && finalSigner.dsApplied && (
                      <div
                        ref={stampRef}
                        onMouseDown={handleStampMouseDown}
                        style={{
                          position: "absolute",
                          left: stampPos.x,
                          top: stampPos.y,
                          width:
                            typeof stampSize.width === "number"
                              ? stampSize.width
                              : 320,
                          height:
                            stampSize.height !== "auto"
                              ? stampSize.height
                              : undefined,
                          cursor: "move",
                          userSelect: "none",
                          overflow: "hidden",
                        }}
                      >
                        <DSStamp
                          name={finalSigner.name}
                          certSerial={`SN-2026-${finalSigner.initials}-84201`}
                          signedAt="03.02.2026"
                          validUntil="с 20.03.2025 до 20.03.2026"
                        />
                        <div
                          onMouseDown={handleResizeMouseDown}
                          style={{
                            position: "absolute",
                            right: 0,
                            bottom: 0,
                            width: 14,
                            height: 14,
                            cursor: "se-resize",
                            background: "rgba(59,130,246,0.5)",
                            borderRadius: "2px 0 2px 0",
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Paperclip size={12} />
                    <span>Вложения</span>
                    {attachments.length > 0 && (
                      <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                        {attachments.length}
                      </span>
                    )}
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Plus size={12} />
                    <span>Прикрепить файл</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      >
                        <FileTextIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate max-w-[120px]">
                            {file.name}
                          </p>
                          <p className="text-slate-400">{file.size}</p>
                        </div>
                        <button
                          onClick={() =>
                            setAttachments((prev) =>
                              prev.filter((f) => f.id !== file.id),
                            )
                          }
                          className="text-slate-300 hover:text-rose-400 transition-colors flex-shrink-0"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="w-[340px] flex-shrink-0 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-visible">
              <div className="px-5 py-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <Users size={16} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Согласующие
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Добавьте согласующих лиц
                      </p>
                    </div>
                  </div>
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() => setShowApproverDropdown((v) => !v)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <UserPlus size={13} />
                      <span>Добавить</span>
                    </button>
                    <AnimatePresence>
                      {showApproverDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -6, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.97 }}
                          className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden w-64"
                        >
                          <div className="p-2 border-b border-slate-100">
                            <input
                              type="text"
                              placeholder="Поиск..."
                              value={approverSearch}
                              onChange={(e) =>
                                setApproverSearch(e.target.value)
                              }
                              autoFocus
                              className="w-full text-sm px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                            />
                          </div>
                          <div className="max-h-48 overflow-y-auto py-1">
                            {availableApprovers.length === 0 ? (
                              <p className="text-xs text-slate-400 text-center py-4">
                                Нет доступных
                              </p>
                            ) : (
                              availableApprovers.map((r) => (
                                <button
                                  key={r.id}
                                  onMouseDown={() => addApprover(r)}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 transition-colors text-left"
                                >
                                  <div
                                    className={cn(
                                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                                      r.color,
                                    )}
                                  >
                                    {r.initials}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-900 truncate">
                                      {r.name}
                                    </p>
                                    <p className="text-xs text-slate-500 truncate">
                                      {r.org}
                                    </p>
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
              <div className="px-5 py-3 space-y-2">
                {approvers.length === 0 ? (
                  <div className="py-4 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1.5 text-slate-400 text-xs">
                    <UserPlus size={15} />
                    <span>Нажмите «Добавить»</span>
                  </div>
                ) : (
                  approvers.map((approver, idx) => (
                    <div
                      key={approver.id}
                      className={cn(
                        "rounded-xl border transition-all overflow-hidden",
                        approver.approved
                          ? "border-emerald-100 bg-emerald-50/40"
                          : "border-slate-100 bg-slate-50/40",
                      )}
                    >
                      <div className="flex items-center gap-2.5 px-3 py-2.5">
                        <span className="text-xs font-bold text-slate-300 w-4 flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                            approver.color,
                          )}
                        >
                          {approver.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {approver.name}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">
                            {approver.role}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {!approver.approved && (
                            <button
                              onClick={() => toggleApproverComment(approver.id)}
                              className={cn(
                                "p-1.5 rounded-lg text-xs transition-all border",
                                approver.showCommentInput || approver.comment
                                  ? "bg-amber-50 border-amber-200 text-amber-600"
                                  : "bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600",
                              )}
                            >
                              <MessageSquarePlus size={12} />
                            </button>
                          )}
                          {approver.dsApplied ? (
                            <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
                              <Shield size={10} className="text-emerald-500" />
                              <span className="text-[10px] font-semibold text-emerald-600">
                                ЭЦП
                              </span>
                              <Check size={10} className="text-emerald-500" />
                            </div>
                          ) : (
                            <button
                              onClick={() => applyApproverDS(approver.id)}
                              disabled={approver.dsLoading}
                              className={cn(
                                "flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all border",
                                approver.dsLoading
                                  ? "bg-slate-100 text-slate-400 border-slate-200 cursor-wait"
                                  : "bg-white border-slate-200 text-slate-600 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 shadow-sm",
                              )}
                            >
                              {approver.dsLoading ? (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    ease: "linear",
                                  }}
                                >
                                  <Clock size={11} />
                                </motion.div>
                              ) : (
                                <Check size={11} />
                              )}
                              <span>
                                {approver.dsLoading
                                  ? "Подписываю..."
                                  : "Согласовать"}
                              </span>
                            </button>
                          )}
                          {!approver.approved && (
                            <button
                              onClick={() =>
                                setApprovers((prev) =>
                                  prev.filter((a) => a.id !== approver.id),
                                )
                              }
                              className="text-slate-300 hover:text-rose-400 transition-colors"
                            >
                              <X size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                      <AnimatePresence>
                        {approver.showCommentInput && !approver.approved && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 pb-3 pt-1 border-t border-slate-100 bg-white/60">
                              <div className="flex items-start gap-2">
                                <MessageSquare
                                  size={12}
                                  className="text-amber-500 mt-0.5 flex-shrink-0"
                                />
                                <textarea
                                  placeholder="Комментарий к согласованию..."
                                  className="flex-1 text-[11px] text-slate-700 placeholder-slate-400 bg-amber-50/60 border border-amber-100 rounded-lg px-2.5 py-2 resize-none outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all min-h-[54px] leading-relaxed"
                                  value={approver.comment}
                                  onChange={(e) =>
                                    updateApproverComment(
                                      approver.id,
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      {approver.dsApplied && (
                        <div
                          className={cn(
                            "px-3 py-2 border-t",
                            approver.approved
                              ? "border-emerald-100 bg-emerald-50/60"
                              : "border-purple-100 bg-purple-50/40",
                          )}
                        >
                          <DSStamp
                            name={approver.name}
                            certSerial={`SN-2026-${approver.initials}-${Math.abs(approver.id.charCodeAt(4) * 317 + 10000)}`}
                            signedAt="03.02.2026"
                            validUntil="с 20.03.2025 до 20.03.2026"
                          />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-visible">
              <div className="px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500 flex items-center justify-center flex-shrink-0">
                    <PenLine size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Подписывающий
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Подписывает с ЭЦП
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-5 py-3">
                <div
                  className={cn(
                    "rounded-xl border transition-all",
                    finalSigner.dsApplied
                      ? "border-emerald-100 bg-emerald-50/40"
                      : "border-slate-100 bg-slate-50/40",
                  )}
                >
                  <div className="flex items-center gap-2.5 px-3 py-2.5">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                        finalSigner.color,
                      )}
                    >
                      {finalSigner.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {finalSigner.name}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {finalSigner.role}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {finalSigner.dsApplied ? (
                        <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
                          <Shield size={10} className="text-emerald-500" />
                          <span className="text-[10px] font-semibold text-emerald-600">
                            ЭЦП
                          </span>
                          <Check size={10} className="text-emerald-500" />
                        </div>
                      ) : (
                        <button
                          onClick={applyFinalDS}
                          disabled={finalSigner.dsLoading}
                          className={cn(
                            "flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all border",
                            finalSigner.dsLoading
                              ? "bg-slate-100 text-slate-400 border-slate-200 cursor-wait"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 shadow-sm",
                          )}
                        >
                          {finalSigner.dsLoading ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                            >
                              <FileBadge size={11} />
                            </motion.div>
                          ) : (
                            <PenLine size={11} />
                          )}
                          <span>
                            {finalSigner.dsLoading ? "Подписываю..." : "ЭЦП"}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                  {finalSigner.dsApplied && (
                    <div className="px-3 py-2.5 border-t border-emerald-100 bg-emerald-50/40 rounded-b-xl">
                      <DSStamp
                        name={finalSigner.name}
                        certSerial={`SN-2026-${finalSigner.initials}-84201`}
                        signedAt="03.02.2026"
                        validUntil="с 20.03.2025 до 20.03.2026"
                      />
                      <AnimatePresence>
                        {!stampVisible && (
                          <motion.button
                            key="insert-btn"
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            onClick={handleInsertStamp}
                            className="mt-2.5 w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-semibold rounded-lg transition-colors shadow-sm"
                          >
                            <PenLine size={12} />
                            <span>Вставить ЭЦП в письмо</span>
                          </motion.button>
                        )}
                        {stampVisible && (
                          <motion.button
                            key="remove-btn"
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            onClick={() => setStampVisible(false)}
                            className="mt-2.5 w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-500 text-[11px] font-semibold rounded-lg transition-colors border border-slate-200 hover:border-rose-200"
                          >
                            <X size={12} />
                            <span>Убрать ЭЦП из письма</span>
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
