export const ApiRoutes = {
  LOGIN: "/api/v1/auth/login",
  FETCH_USER_BY_ID: "/api/v1/admin/users/",
  FETCH_PERMISSIONS: "/api/v1/admin/permissions",
  ADD_TASK: "/api/v1/tasks",
  ADD_EVENT: "/api/v1/events",
  GET_TASKS: "/api/v1/tasks",
  GET_EVENTS: "/api/v1/events",
  GET_ASSIGNEES: "/api/v1/tasks/assignees",
  UPDATE_TASK_STATUS: "/api/v1/tasks",
  GET_ANALYTICS: "/api/v1/analytics",
  DELETE_TASK_BY_ID: "/api/v1/tasks/",
  UPDATE_EVENT: "/api/v1/events",

  // Corresspondence
  GET_CORRESPONDENCES: "/api/v1/correspondences",
  GET_CORRESPONDENCE_BY_ID: "/api/v1/correspondences/:id",
  CREATE_CORRESPONDENCES: "/api/v1/correspondences",
  ARCHIVE_CORRESPONDENCE: "/api/v1/correspondences/:id/archive",
  PIN_CORRESPONDENCE: "/api/v1/correspondences/:id/pin",
  FOLDER_CORRESPONDENCE: "/api/v1/correspondences/:id/folder",
  DELETE_CORRESPONDENCE: "/api/v1/correspondences/:id",
  GET_COUNTERS_CORRESPONDENCE: "/api/v1/correspondences/counters",
  CREATE_RESOLUTION: "/api/v1/correspondences/:id/resolutions",
  RESTORE_CORRESPONDENCE: "/api/v1/correspondences/:id/restore",
  GET_DEPARTMENTS: "/api/v1/admin/departments",
  GET_ROLES: "/api/v1/admin/roles",
  GET_USERS: "/api/v1/admin/users",
  CREATE_ATTACHMENT: "/api/v1/correspondences/:id/attachments",
  CREATE_ATTACHMENTS_BULK: "/api/v1/correspondences/:id/attachments/bulk",
  DELETE_ATTACHMENT: "/api/v1/correspondence-attachments/:id",
} as const;

type ApiRoutes = (typeof ApiRoutes)[keyof typeof ApiRoutes];
