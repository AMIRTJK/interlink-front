import { useLocation, matchPath } from "react-router-dom";
import { useMemo } from "react";

interface CorrespondenceRouteState {
  scope?: string;
  type?: string;
  actionOrId?: string;
  isCreate: boolean;
  isShow: boolean;
  isDetailView: boolean;
  shouldHideUI: boolean;
}

export const useCorrespondenceRoute = (): CorrespondenceRouteState => {
  const { pathname } = useLocation();

  const routeState = useMemo(() => {
    const match = matchPath(
      { path: "/modules/correspondence/:scope/:type/:actionOrId" },
      pathname,
    );

    const internalDetailMatch = matchPath(
      { path: "/modules/correspondence/internal/:type/:id" },
      pathname,
    );

    const { scope, type, actionOrId } = match?.params || {};

    const effectiveType = type || internalDetailMatch?.params.type;
    const effectiveId = actionOrId || internalDetailMatch?.params.id;

    const isCreate = effectiveId === "create";
    const isShow = !!effectiveId && effectiveId !== "create";

    const isFolderRoute = internalDetailMatch?.params.type === "folder" || type === "folder";

    const isDetailView = !isFolderRoute && (isCreate || isShow);

    const shouldHideUI = (() => {
      if (internalDetailMatch && isShow && internalDetailMatch.params.type !== "folder") {
        return true;
      }

      if (match && scope === "internal" && type !== "folder") {
        if (isShow) return true;

        if (effectiveType === "outgoing" && isCreate) {
          return true;
        }
      }

      return false;
    })();

    return {
      scope: scope || "internal",
      type: effectiveType,
      actionOrId: effectiveId,
      isCreate,
      isShow,
      isDetailView,
      shouldHideUI,
    };
  }, [pathname]);

  return routeState;
};
