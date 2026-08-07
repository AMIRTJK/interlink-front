import { AppRoutes } from "@shared/config";

interface IDetermineBackRouteParams {
  type?: string;
  data?: any;
  fromState?: string;
}

/**
 * Определяет маршрут возврата для кнопки «Назад» при просмотре/создании письма:
 * 1. Если в location.state передан явный реестр открытия (`fromRegistry`), использует его.
 * 2. Для черновиков (`status === "draft"` / `is_draft` / `folder === "drafts"`) перенаправляет в реестр «Черновики» (/modules/correspondence/internal/drafts).
 * 3. Для отправленных/обработанных исходящих перенаправляет в реестр «Исходящие» (/modules/correspondence/internal/outgoing).
 * 4. Для входящих перенаправляет в реестр «Входящие» (/modules/correspondence/internal/incoming).
 */
export const determineCorrespondenceBackRoute = ({
  type,
  data,
  fromState,
}: IDetermineBackRouteParams): string => {
  // 1. Если передан явный реестр, из которого пользователь открыл документ
  if (
    fromState &&
    typeof fromState === "string" &&
    fromState.startsWith("/modules/correspondence")
  ) {
    return fromState;
  }

  const letterItem = data?.item || data || {};
  const rawStatus = (letterItem?.status || data?.status || "")
    .toString()
    .toLowerCase();

  const isDraft =
    rawStatus === "draft" ||
    rawStatus === "черновик" ||
    rawStatus === "drafts" ||
    letterItem?.is_draft === true ||
    letterItem?.folder === "drafts" ||
    data?.folder === "drafts";

  const t = type || "";

  // 2. Внутренние входящие
  if (t.includes("internal-incoming")) {
    return AppRoutes.CORRESPONDENCE_INTERNAL_INCOMING;
  }

  // 3. Внутренние исходящие / черновики
  if (
    t.includes("internal-outgoing") ||
    t.includes("internal-drafts") ||
    t.includes("internal")
  ) {
    if (isDraft) {
      return AppRoutes.CORRESPONDENCE_INTERNAL_DRAFTS;
    }
    return AppRoutes.CORRESPONDENCE_INTERNAL_OUTGOING;
  }

  // 4. Внешняя корреспонденция
  if (t.includes("external-incoming"))
    return AppRoutes.CORRESPONDENCE_EXTERNAL_INCOMING;
  if (t.includes("external-outgoing"))
    return AppRoutes.CORRESPONDENCE_EXTERNAL_OUTGOING;

  return AppRoutes.CORRESPONDENCE;
};
