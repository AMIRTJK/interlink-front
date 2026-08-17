import { AppRoutes } from "@shared/config";

/**
 * Маршрут просмотра письма для реестра: карточка и переход к версии ведут в
 * один и тот же экран, поэтому маршрут считаем один раз по типу реестра.
 */
export const getRegistryShowRoute = (type: string): string => {
  if (type.includes("external-incoming")) {
    return AppRoutes.CORRESPONDENCE_INCOMING_SHOW;
  }

  if (type.includes("internal-incoming")) {
    return AppRoutes.INTERNAL_INCOMING_SHOW;
  }

  if (
    type.includes("internal-outgoing") ||
    type.includes("internal-drafts") ||
    type.includes("internal-to-sign") ||
    type.includes("internal-to-approve")
  ) {
    return AppRoutes.INTERNAL_OUTGOING_SHOW;
  }

  return "";
};
