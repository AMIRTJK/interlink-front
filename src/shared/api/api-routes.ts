export const ApiRoutes = {
  LOGIN: "/api/v1/auth/login",
  FETCH_USER_BY_ID:"/api/v1/admin/users/"
} as const;

type ApiRoutes = (typeof ApiRoutes)[keyof typeof ApiRoutes];
