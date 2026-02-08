export const AppRoutes = {
  LOGIN: "/auth/login",
  PROFILE: "/profile",
  PROFILE_TASKS: "/profile/tasks",
  PROFILE_CALENDAR: "/profile/calendar",
  PROFILE_ANALYTICS: "/profile/analytics",
  MODULES: "/modules",
  CORRESPONDENCE: "/modules/correspondence",
  CORRESPONDENCE_EXTERNAL_INCOMING: "/modules/correspondence/external/incoming",
  CORRESPONDENCE_EXTERNAL_OUTGOING: "/modules/correspondence/external/outgoing",
  CORRESPONDENCE_INTERNAL_INCOMING: "/modules/correspondence/internal/incoming",
  CORRESPONDENCE_INTERNAL_OUTGOING: "/modules/correspondence/internal/outgoing",
  CORRESPONDENCE_INTERNAL_DRAFTS: "/modules/correspondence/internal/drafts",
  CORRESPONDENCE_INTERNAL_TO_SIGN: "/modules/correspondence/internal/to-sign",
  CORRESPONDENCE_INTERNAL_TO_APPROVE:
    "/modules/correspondence/internal/to-approve",
  CORRESPONDENCE_INTERNAL_ARCHIVE: "/modules/correspondence/internal/archive",
  CORRESPONDENCE_INTERNAL_PINNED: "/modules/correspondence/internal/pinned",
  CORRESPONDENCE_INTERNAL_TRASHED: "/modules/correspondence/internal/trashed",

  // Legacy/Root mapping (for sidebar matching)
  CORRESPONDENCE_INCOMING: "/modules/correspondence/external", // Keeps compatibility with "Incoming" folder logic if needed
  CORRESPONDENCE_OUTGOING: "/modules/correspondence/internal", // Keeps compatibility with "Outgoing" folder logic if needed

  CORRESPONDENCE_INCOMING_CREATE: "/modules/correspondence/external/create",
  CORRESPONDENCE_OUTGOING_CREATE: "/modules/correspondence/internal/create",

  CORRESPONDENCE_ARCHIVE: "/modules/correspondence/archive",
  CORRESPONDENCE_PINNED: "/modules/correspondence/pinned",
  CORRESPONDENCE_FOLDERS: "/modules/correspondence/folders",
  CORRESPONDENCE_TRASHED: "/modules/correspondence/trashed",
  CORRESPONDENCE_INCOMING_SHOW: "/modules/correspondence/external/incoming/:id",
  CORRESPONDENCE_OUTGOING_SHOW: "/modules/correspondence/external/outgoing/:id",
  INTERNAL_INCOMING_SHOW: "/modules/correspondence/internal/incoming/:id",
  INTERNAL_OUTGOING_SHOW: "/modules/correspondence/internal/outgoing/:id",
  // CORRESPONDENCE_INTERNAL: "/modules/correspondence/internal",
} as const;
