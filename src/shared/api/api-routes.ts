export const ApiRoutes = {
  LOGIN: "/api/v1/auth/login",
  FETCH_USER_BY_ID:"/api/v1/admin/users/",
  ADD_TASK:"/api/v1/tasks",
  GET_TASKS:"/api/v1/tasks",
} as const;

type ApiRoutes = (typeof ApiRoutes)[keyof typeof ApiRoutes];
