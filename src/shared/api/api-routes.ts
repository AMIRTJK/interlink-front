export const ApiRoutes = {
  LOGIN: "/api/v1/auth/login",
  FETCH_USER_BY_ID: "/api/v1/admin/users/",
  FETCH_PERMISSIONS:"/api/v1/admin/permissions",
  ADD_TASK: "/api/v1/tasks",
  ADD_EVENT: "/api/v1/events",
  GET_TASKS: "/api/v1/tasks",
  GET_EVENTS: "/api/v1/events",
  GET_ASSIGNEES: "/api/v1/tasks/assignees",
  UPDATE_TASK_STATUS: "/api/v1/tasks",
  GET_ANALYTICS: "/api/v1/analytics",
  DELETE_TASK_BY_ID: "/api/v1/tasks/",
  UPDATE_EVENT: "/api/v1/events",
} as const;

type ApiRoutes = (typeof ApiRoutes)[keyof typeof ApiRoutes];
