export const SYSTEM_FOLDERS = {
  INCOMING: "Входящие",
  OUTGOING: "Исходящие",
  ARCHIVE: "Архив",
  PINNED: "Закреплённые",
  TRASH: "Корзина",
} as const;

export const MAX_FOLDER_DEPTH = 5;

export const FOLDER_ORDER = {
  TOP: [SYSTEM_FOLDERS.INCOMING, SYSTEM_FOLDERS.OUTGOING],
  BOTTOM: [SYSTEM_FOLDERS.ARCHIVE, SYSTEM_FOLDERS.PINNED, SYSTEM_FOLDERS.TRASH],
} as const;

export const ROUTES = {
  CORRESPONDENCE_BASE: "/modules/correspondence",
  INCOMING: "/modules/correspondence/external/incoming",
  OUTGOING: "/modules/correspondence/external/outgoing",
  FOLDERS: "/modules/correspondence/folders",
} as const;

export const CSS_CLASSES = {
  DROPDOWN_OVERLAY: "custom-registry-dropdown",
  DRAG_OVER: "folder-drag-over",
} as const;

export const COUNTER_STYLES = {
  BG_COLOR: "#E30613",
  TEXT_COLOR: "white",
} as const;


// Сайдбар

export const layoutHorizontalIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/></svg>`;
export const layoutVerticalIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="9" x2="9" y1="3" y2="21"/></svg>`;
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, 
      delayChildren: 0.1,
    },
  },
} as const;

export const itemWrapperVariants = {
  hidden: { opacity: 0, x: -30 }, 
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 120,
    },
  },
} as const;
