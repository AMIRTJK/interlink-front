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

    const { scope, type, actionOrId } = match?.params || {};

    const isCreate = actionOrId === "create";
    const isShow = !!actionOrId && actionOrId !== "create";

    const isDetailView = isCreate || isShow;

    const shouldHideUI = (() => {
      if (!match) return false;

      if (scope === "internal") {
        if (type === "outgoing") {
          return true;
        }

        if (type === "external-incoming" && !isCreate) {
          return true;
        }
      }

      return false;
    })();

    return {
      scope,
      type,
      actionOrId,
      isCreate,
      isShow,
      isDetailView,
      shouldHideUI,
    };
  }, [pathname]);

  return routeState;
};
