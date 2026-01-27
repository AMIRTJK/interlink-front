import { If } from "@shared/ui";
import { RegistrySidebar } from "@widgets/RegistrySidebar";
import { matchPath, Outlet, useLocation } from "react-router-dom";

export const CorrespondencePage = () => {
  const location = useLocation();

  const path = location.pathname;

  const isIncomingCreate = matchPath(
    { path: "/modules/correspondence/incoming/create" },
    path,
  );
  const isIncomingShow = matchPath(
    { path: "/modules/correspondence/incoming/:id" },
    path,
  );
  const isIncomingDetail =
    !!isIncomingCreate ||
    (!!isIncomingShow && isIncomingShow.params.id !== "create");

  const isOutgoingCreate = matchPath(
    { path: "/modules/correspondence/outgoing/create" },
    path,
  );
  const isOutgoingShow = matchPath(
    { path: "/modules/correspondence/outgoing/:id" },
    path,
  );
  const isOutgoingDetail =
    !!isOutgoingCreate ||
    (!!isOutgoingShow && isOutgoingShow.params.id !== "create");

  const isDetailView = isIncomingDetail || isOutgoingDetail;

  const hiddenPatterns = [
    "/modules/correspondence/outgoing/create",
    "/modules/correspondence/outgoing/:id",
  ];

  const shouldHideUI = hiddenPatterns.some((pattern) =>
    matchPath({ path: pattern, end: true }, location.pathname),
  );

  return (
    <div className="flex w-full gap-3 h-full">
      <If is={!shouldHideUI}>
        <aside>
          <RegistrySidebar isDetailView={isDetailView} />
        </aside>
      </If>
      <main className="w-full min-w-0">
        <Outlet />
      </main>
    </div>
  );
};
