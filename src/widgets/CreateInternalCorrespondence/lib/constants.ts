import type {
  Status,
  LetterType,
  ImportanceLevel,
  RecipientOption,
  FinalSigner,
  OrgStructureNode,
} from "../types";

// ── Ограничения вложений ──────────────────────────────────────────────────────
// Повторяют валидацию бэкенда на attachments[] в POST/PUT /internal-correspondences.
// Проверяем на фронте, чтобы не гонять заведомо отбраковываемый файл по сети.
export const ATTACHMENT_EXTENSIONS = [
  "pdf",
  "jpg",
  "jpeg",
  "png",
  "webp",
  "doc",
  "docx",
  "xls",
  "xlsx",
];
export const ATTACHMENT_ACCEPT = ATTACHMENT_EXTENSIONS.map((e) => `.${e}`).join(",");
export const MAX_ATTACHMENTS = 10;
export const MAX_ATTACHMENT_SIZE_MB = 20;

export const ORG_STRUCTURE: OrgStructureNode = {
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

// Фолбэк-список типов письма, если /meta ещё не загрузился.
// value — ключ для бэкенда, label — подпись (дублирует /meta), desc — пояснение (только локально).
export const LETTER_TYPE_OPTIONS: {
  value: LetterType;
  label: string;
  desc: string;
}[] = [
  { value: "guzorish", label: "Гузориш", desc: "Отчёт / Доклад" },
  { value: "ariza", label: "Ариза", desc: "Заявление" },
  { value: "darkhost", label: "Дархост", desc: "Запрос / Обращение" },
  { value: "malumotnoma", label: "Маълумотнома", desc: "Справка" },
  { value: "maktub", label: "Мактуб", desc: "Письмо" },
];

export const LETTER_TYPE_DESC: Record<string, string> = {
  guzorish: "Отчёт / Доклад",
  ariza: "Заявление",
  darkhost: "Запрос / Обращение",
  malumotnoma: "Справка",
  maktub: "Письмо",
  Мактуб: "Письмо",
};

export const IMPORTANCE_OPTIONS: {
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
    value: "normal",
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

export const IMPORTANCE_DOT: Record<string, string> = {
  high: "bg-rose-500",
  normal: "bg-amber-400",
  low: "bg-slate-300",
};

export const RECIPIENT_OPTIONS: RecipientOption[] = [
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

export const INITIAL_FINAL_SIGNER: FinalSigner = {
  id: "s1",
  name: "Александр В.",
  role: "Инициатор / Автор",
  initials: "АВ",
  color: "bg-blue-100 text-blue-700",
  dsApplied: false,
  dsLoading: false,
};

export const FONT_SIZES = [
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

export const INBOX_DOC_TYPES: Record<string, string> = {
  "1": "Маълумотнома",
  "2": "Дархост",
  "3": "Гузориш",
  "4": "Дархост",
  "5": "Ариза",
  "6": "Маълумотнома",
  "7": "Гузориш",
  "8": "Дархост",
};

export const INBOX_DOC_TYPE_STYLE: Record<string, string> = {
  Маълумотнома: "bg-indigo-50 text-indigo-700 border-indigo-100",
  Дархост: "bg-purple-50 text-purple-700 border-purple-100",
  Гузориш: "bg-teal-50 text-teal-700 border-teal-100",
  Ариза: "bg-amber-50 text-amber-700 border-amber-100",
  Мактуб: "bg-blue-50 text-blue-700 border-blue-100",
};

export const MOCK_CONTENT_LINES = [
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

export const OUTBOX_STATUS_LABEL: Record<Status, string> = {
  "на резолюции": "Подготовка",
  "на исполнении": "Подготовка",
  "на согласовании": "Согласование",
  "на подпись": "На подпись",
  завершено: "Отправлено",
};

export const OUTBOX_STATUS_STYLE: Record<Status, string> = {
  "на резолюции": "bg-amber-50 text-amber-600 border-amber-100",
  "на исполнении": "bg-amber-50 text-amber-600 border-amber-100",
  "на согласовании": "bg-blue-50 text-blue-600 border-blue-100",
  "на подпись": "bg-purple-50 text-purple-600 border-purple-100",
  завершено: "bg-emerald-50 text-emerald-600 border-emerald-100",
};
