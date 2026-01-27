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

  // const currentType = isOutgoingDetail ? "outgoing" : "incoming";

  return (
    <div className="flex w-full gap-3 h-full">
      <aside>
        <RegistrySidebar isDetailView={isDetailView} />
      </aside>
      <main className="w-full min-w-0">
        <Outlet />
      </main>
    </div>
  );
};
