import { AppRoutes } from "@shared/config";
import { useLocation } from "react-router-dom";
export const useCurrentTab = () => {
  const { pathname } = useLocation();
  if (pathname.includes(AppRoutes.PROFILE_CALENDAR)) return "calendar";
  if (pathname.includes(AppRoutes.PROFILE_ANALYTICS)) return "analytics";
  return "tasks";
};
