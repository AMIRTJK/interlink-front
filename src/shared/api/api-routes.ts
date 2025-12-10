export const ApiRoutes = {
  LOGIN: "/api/v1/auth/login",
} as const;

type ApiRoutes = (typeof ApiRoutes)[keyof typeof ApiRoutes];
