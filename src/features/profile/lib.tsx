import { AppRoutes } from "@shared/config";
import { useLocation } from "react-router-dom";
export const useCurrentTab = () => {
  const location = useLocation();
  const path = location.pathname;
  if (path.includes(AppRoutes.PROFILE_CALENDAR)) return "calendar";
  if (path.includes(AppRoutes.PROFILE_ANALYTICS)) return "analytics";
  return "tasks";
};