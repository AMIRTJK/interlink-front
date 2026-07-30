import { getEnvVar } from "@shared/config";
import type { LayoutMode } from "../designSettings";

export interface IProps {
  currentTheme?: string;
  setCurrentTheme?: (theme: string) => void;
  currentBg?: string;
  setCurrentBg?: (bg: string) => void;
  layoutMode?: LayoutMode;
  setLayoutMode?: (layout: LayoutMode) => void;
}

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
