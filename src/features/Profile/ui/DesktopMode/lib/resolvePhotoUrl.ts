import { getEnvVar } from "@shared/config";

export const resolvePhotoUrl = (path?: string | null): string => {
  if (!path) return "";
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:")
  ) {
    return path;
  }
  const apiHost = getEnvVar("VITE_API_URL") || "";
  const host = apiHost.endsWith("/") ? apiHost.slice(0, -1) : apiHost;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${host}${p}`;
};
