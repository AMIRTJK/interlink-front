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
  INCOMING: "/modules/correspondence/incoming",
  OUTGOING: "/modules/correspondence/outgoing",
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
