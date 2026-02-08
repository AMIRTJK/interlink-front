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
  // Внутренняя корреспонденция (для папок Отправленные/Полученные)
  GET_INTERNAL_CORRESPONDENCES: "/api/v1/internal-correspondences",
  GET_CORRESPONDENCE_BY_ID: "/api/v1/correspondences/:id",
  CREATE_CORRESPONDENCES: "/api/v1/correspondences",
  ARCHIVE_CORRESPONDENCE: "/api/v1/correspondences/:id/archive",
  PIN_CORRESPONDENCE: "/api/v1/correspondences/:id/pin",
  CORRESPONDENCE_FOLDERS: "/api/v1/correspondence-folders",
  FOLDER_CORRESPONDENCE: "/api/v1/correspondences/:id/folder",
  GET_FOLDERS: "/api/v1/correspondence-folders",
  CREATE_FOLDER: "/api/v1/correspondence-folders",
  UPDATE_FOLDER: "/api/v1/correspondence-folders/:id",
  MOVE_FOLDER: "/api/v1/correspondences/:DOC_ID/move",
  DELETE_FOLDER: "/api/v1/correspondence-folders/:id",
  DELETE_CORRESPONDENCE: "/api/v1/correspondences/:id",
  GET_COUNTERS_CORRESPONDENCE: "/api/v1/correspondences/counters",
  CREATE_RESOLUTION: "/api/v1/correspondences/:id/resolutions",
  RESTORE_CORRESPONDENCE: "/api/v1/correspondences/:id/restore",
  UPLOAD_CORRESPONDENCE_ATTACHMENTS: "/api/v1/correspondences/:id/attachments",
  UPLOAD_CORRESPONDENCE_ATTACHMENTS_BULK:
    "/api/v1/correspondences/:id/attachments/bulk",
  DELETE_CORRESPONDENCE_ATTACHMENT: "/api/v1/correspondence-attachments/:id",
  ASSIGNMENTS_CORRESPONDENCE: "/api/v1/correspondences/:id/assignments",

  // ==================== HR MODULE ====================
  // Organizations
  CREATE_ORGANIZATION: "/api/v1/admin/organizations",
  GET_ORGANIZATIONS: "/api/v1/admin/organizations",
  GET_ORGANIZATION: "/api/v1/admin/organizations/:id",
  UPDATE_ORGANIZATION: "/api/v1/admin/organizations/:id",
  DELETE_ORGANIZATION: "/api/v1/admin/organizations/:id",

  // Users
  CREATE_USER: "/api/v1/admin/users",
  GET_USERS: "/api/v1/admin/users",
  UPDATE_USER: "/api/v1/admin/users/:id",
  DELETE_USER: "/api/v1/admin/users/:id",
  SET_USER_ROLES: "/api/v1/admin/users/:id/roles",

  // Roles
  CREATE_ROLE: "/api/v1/admin/roles",
  GET_ROLES: "/api/v1/admin/roles",
  GET_ROLE: "/api/v1/admin/roles/:id",
  UPDATE_ROLE: "/api/v1/admin/roles/:id",
  DELETE_ROLE: "/api/v1/admin/roles/:id",

  // Permissions
  CREATE_PERMISSION: "/api/v1/admin/permissions",

  // Departments
  CREATE_DEPARTMENT: "/api/v1/admin/departments",
  GET_DEPARTMENTS: "/api/v1/admin/departments",
  GET_DEPARTMENT: "/api/v1/admin/departments/:id",
  UPDATE_DEPARTMENT: "/api/v1/admin/departments/:id",
  DELETE_DEPARTMENT: "/api/v1/admin/departments/:id",

  // ==================== INTERNAL CORRESPONDENCE ====================
  GET_INTERNAL_COUNTERS: "/api/v1/internal-correspondences/counters",
  GET_INTERNAL_INCOMING: "/api/v1/internal-correspondences/inbox",
  GET_INTERNAL_OUTGOING: "/api/v1/internal-correspondences/sent",
  GET_INTERNAL_DRAFTS: "/api/v1/internal-correspondences/drafts",
  GET_INTERNAL_TO_SIGN: "/api/v1/internal-correspondences/to-sign",
  GET_INTERNAL_TO_APPROVE: "/api/v1/internal-correspondences/to-approve",
  GET_INTERNAL_TRASH: "/api/v1/internal-correspondences/trash",
  CREATE_INTERNAL: "/api/v1/internal-correspondences",
  PUT_INTERNAL: "/api/v1/internal-correspondences/:id",
  GET_INTERNAL_BY_ID: "/api/v1/internal-correspondences/:id",
  SEND_INTERNAL: "/api/v1/internal-correspondences/:id/send",
  READ_INTERNAL: "/api/v1/internal-correspondences/:id/read",
  DELETE_INTERNAL: "/api/v1/internal-correspondences/:id",
  RESTORE_INTERNAL: "/api/v1/internal-correspondences/:id/restore",

  // Recipients
  GET_INTERNAL_RECIPIENTS_USERS:
    "/api/v1/internal-correspondences/recipients/users",
  GET_INTERNAL_RECIPIENTS_DEPARTMENTS:
    "/api/v1/internal-correspondences/recipients/departments",
  GET_INTERNAL_RECIPIENTS_RECENT:
    "/api/v1/internal-correspondences/recipients/recent",

  // Workflow
  INTERNAL_INVITE_APPROVER:
    "/api/v1/internal-correspondences/:id/approvals/invite",
  INTERNAL_UPDATE_APPROVAL_STATUS:
    "/api/v1/internal-correspondences/approvals/:approval_id/status",
  INTERNAL_INVITE_SIGNER: "/api/v1/internal-correspondences/:id/signers/invite",
  INTERNAL_GET_WORKFLOW: "/api/v1/internal-correspondences/:id/workflow",
  INTERNAL_SIGNATURES_PAYLOAD:
    "/api/v1/internal-correspondences/:id/signatures/payload",
  INTERNAL_SIGNATURES_CONFIRM:
    "/api/v1/internal-correspondences/:id/signatures/confirm",
} as const;

type ApiRoutes = (typeof ApiRoutes)[keyof typeof ApiRoutes];
