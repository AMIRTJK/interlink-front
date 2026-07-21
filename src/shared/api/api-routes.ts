export const ApiRoutes = {
  LOGIN: "/api/v1/auth/login",

  // ==================== AUTH / MFA (2FA) ====================
  AUTH_ME: "/api/v1/auth/me",
  // Обновление собственного профиля (в т.ч. новые паспортные/OCR-поля). Метод PATCH.
  UPDATE_ME: "/api/v1/auth/me",
  LOGOUT: "/api/v1/auth/logout",
  // Подтверждение MFA при входе (второй шаг, без авторизации)
  MFA_VERIFY: "/api/v1/auth/mfa/verify",
  // Управление MFA для авторизованного пользователя
  MFA_SETUP: "/api/v1/auth/mfa/setup",
  MFA_CONFIRM: "/api/v1/auth/mfa/confirm",
  MFA_DISABLE: "/api/v1/auth/mfa/disable",

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

  // ==================== TASKS MODULE (/modules/tasks) ====================
  // Общие задачи модуля /tasks (не связаны с /personal-tasks).
  TASKS_BOARD: "/api/v1/tasks/board",
  TASKS_STATS: "/api/v1/tasks/stats",
  TASK_BY_ID: "/api/v1/tasks/:id",
  TASK_STATUS: "/api/v1/tasks/:id/status",
  TASK_ATTACHMENTS: "/api/v1/tasks/:id/attachments",
  TASK_ATTACHMENT_DOWNLOAD:
    "/api/v1/tasks/:id/attachments/:attachmentId/download",
  TASK_ATTACHMENT_DELETE: "/api/v1/tasks/:id/attachments/:attachmentId",

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
  // Отдаёт сам файл вложения через API (Bearer + CORS), как /api/v1/my-files/:id/download.
  // ?inline=1 — показать в браузере (Content-Disposition: inline), без параметра — скачать.
  DOWNLOAD_CORRESPONDENCE_ATTACHMENT:
    "/api/v1/correspondence-attachments/:id/download",
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
  // Загрузка фото паспорта + OCR-распознавание. multipart/form-data:
  // passport_front (обязательный), passport_back (необязательный).
  // Возвращает passport_front_path/passport_back_path/passport_ocr_scanned_at/passport_ocr_data.
  PASSPORT_OCR: "/api/v1/admin/users/passport-ocr",
  SET_USER_ROLES: "/api/v1/admin/users/assign-roles",
  // Полная картина прав пользователя: roles/role_permissions/direct_permissions/denied_permissions/effective_permissions
  GET_USER_PERMISSIONS: "/api/v1/admin/users/:id/permissions",
  UPDATE_USER_DIRECT_PERMISSIONS: "/api/v1/admin/users/:id/permissions/direct",
  UPDATE_USER_DENIED_PERMISSIONS: "/api/v1/admin/users/:id/permissions/denied",
  // Экспорт сотрудников в Excel (временный тестовый роут — заменю на боевой)
  EXPORT_USERS_EXCEL: "/test-users-excel-download",

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

  // HR Documents
  GET_HR_DOCUMENTS: "/api/v1/admin/hr/documents",
  CREATE_HR_DOCUMENT: "/api/v1/admin/hr/documents",
  DOWNLOAD_HR_DOCUMENT: "/api/v1/admin/hr/documents/:id/download",

  // HR Orders
  GET_HR_ORDERS: "/api/v1/admin/hr/orders",
  CREATE_HR_ORDER: "/api/v1/admin/hr/orders",
  DOWNLOAD_HR_ORDER_ATTACHMENT:
    "/api/v1/admin/hr/orders/:orderId/attachments/:attachmentId/download",

  // Staffing
  GET_STAFFING_STRUCTURE: "/api/v1/admin/hr/staffing/structure",
  CREATE_SUB_ORGANIZATION: "/api/v1/admin/hr/staffing/sub-organizations",
  CREATE_STAFFING_POSITION: "/api/v1/admin/hr/staffing/positions",
  ASSIGN_POSITION_EMPLOYEES: "/api/v1/admin/hr/staffing/positions/:id/employees",

  // Timesheet
  GET_TIMESHEET: "/api/v1/admin/hr/timesheet",

  // ==================== INTERNAL CORRESPONDENCE ====================
  // Справочники для document_type / priority (подписи берём отсюда, не хардкодим)
  GET_INTERNAL_META: "/api/v1/internal-correspondences/meta",
  GET_INTERNAL_COUNTERS: "/api/v1/internal-correspondences/counters",
  GET_INTERNAL_INCOMING: "/api/v1/internal-correspondences/inbox",
  GET_INTERNAL_INCOMING_PICKER: "/api/v1/internal-correspondences/picker/inbox",
  ATTACH_INTERNAL_INCOMING:
    "/api/v1/internal-correspondences/:id/incoming/attach",
  GET_INTERNAL_OUTGOING: "/api/v1/internal-correspondences/sent",
  GET_INTERNAL_DRAFTS: "/api/v1/internal-correspondences/drafts",
  GET_INTERNAL_TO_SIGN: "/api/v1/internal-correspondences/to-sign",
  GET_INTERNAL_TO_APPROVE: "/api/v1/internal-correspondences/to-approve",
  GET_INTERNAL_PROCESSED: "/api/v1/internal-correspondences/processed",
  GET_INTERNAL_TRASH: "/api/v1/internal-correspondences/trash",
  CREATE_INTERNAL: "/api/v1/internal-correspondences",
  PUT_INTERNAL: "/api/v1/internal-correspondences/:id",
  GET_INTERNAL_BY_ID: "/api/v1/internal-correspondences/:id",
  SEND_INTERNAL: "/api/v1/internal-correspondences/:id/send",
  READ_INTERNAL: "/api/v1/internal-correspondences/:id/read",
  DELETE_INTERNAL: "/api/v1/internal-correspondences/:id",
  RESTORE_INTERNAL: "/api/v1/internal-correspondences/:id/restore",
  GET_INTERNAL_STRUCTURE: "/api/v1/internal-correspondences/:id/structure",

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
  INTERNAL_SIGNATURES_CANCEL:
    "/api/v1/internal-correspondences/:id/signatures/cancel",
  INTERNAL_APPROVALS_CONFIRM:
    "/api/v1/internal-correspondences/approvals/:id/status",

  // Folder
  INTERNAL_MOVE_FOLDER: "/api/v1/internal-correspondences/:id/move-folder",
  CREATE_INTERNAL_FOLDER: "/api/v1/internal-mail-folders",
  GET_INTERNAL_FOLDERS: "/api/v1/internal-mail-folders",
  GET_INTERNAL_FOLDER: "/api/v1/internal-mail-folders/:id",
  UPDATE_INTERNAL_FOLDER: "/api/v1/internal-mail-folders/:id",
  DELETE_INTERNAL_FOLDER: "/api/v1/internal-mail-folders/:id",

  // Version
  GET_INTERNAL_VERSIONS: "/api/v1/internal-correspondences/:id/versions",
  SELECT_INTERNAL_VERISION_FOR_SIGN:
    "/api/v1/internal-correspondences/:correspondenceId/versions/:versionId/select",

  // ==================== MY FILES (PERSONAL STORAGE) ====================
  MY_FILES: "/api/v1/my-files",
  MY_FILES_SHARED_WITH_ME: "/api/v1/my-files/shared-with-me",
  MY_FILES_UPLOAD: "/api/v1/my-files/upload",
  MY_FILES_META: "/api/v1/my-files/meta",
  MY_FILES_ID: "/api/v1/my-files/:id",
  MY_FILES_DOWNLOAD: "/api/v1/my-files/:id/download",
  MY_FILES_INVITE: "/api/v1/my-files/:id/invite",
  MY_FILES_SHARES: "/api/v1/my-files/:id/shares",
  MY_FILES_SHARES_ID: "/api/v1/my-files/:id/shares/:shareId",
  MY_FILES_BULK_SHARE: "/api/v1/my-files/bulk-share",
  MY_FILES_BULK_DELETE: "/api/v1/my-files/bulk-delete",

  MY_FILE_FOLDERS: "/api/v1/my-file-folders",
  MY_FILE_FOLDERS_SHARED_WITH_ME: "/api/v1/my-file-folders/shared-with-me",
  MY_FILE_FOLDERS_ID: "/api/v1/my-file-folders/:id",
  MY_FILE_FOLDERS_INVITE: "/api/v1/my-file-folders/:id/invite",
  MY_FILE_FOLDERS_SHARES: "/api/v1/my-file-folders/:id/shares",
  MY_FILE_FOLDERS_SHARES_ID: "/api/v1/my-file-folders/:id/shares/:shareId",

  // ==================== PERSONAL ANALYTICS (личный кабинет) ====================
  // Аналитика только по личным задачам и встречам текущего авторизованного пользователя.
  // Query-параметры: year (год календарной статистики), limit (кол-во задач в блоке прогресса).
  PERSONAL_ANALYTICS: "/api/v1/personal-analytics",

  // ==================== NOTIFICATIONS (личный кабинет) ====================
  // Данные возвращаются только для текущего авторизованного пользователя
  NOTIFICATIONS: "/api/v1/notifications",
  NOTIFICATIONS_COUNTERS: "/api/v1/notifications/counters",
  NOTIFICATIONS_READ_ALL: "/api/v1/notifications/read-all",
  NOTIFICATION_READ: "/api/v1/notifications/:id/read",
  NOTIFICATION_DELETE: "/api/v1/notifications/:id",
  PERSONAL_TASKS: "/api/v1/personal-tasks",
  PERSONAL_TASKS_BOARD: "/api/v1/personal-tasks/board",
  PERSONAL_TASKS_BY_ID: "/api/v1/personal-tasks/:id",
  PERSONAL_TASKS_STATUS: "/api/v1/personal-tasks/:id/status",
} as const;

type ApiRoutes = (typeof ApiRoutes)[keyof typeof ApiRoutes];
