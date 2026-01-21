import { RegistrySidebar } from "@widgets/RegistrySidebar";
import { matchPath, Outlet, useLocation } from "react-router-dom";

export const CorrespondencePage = () => {
  const location = useLocation();

  const isCreatePage = matchPath(
    { path: "/modules/correspondence/incoming/create" },
    location.pathname,
  );

  const isShowPage = matchPath(
    { path: "/modules/correspondence/incoming/:id" },
    location.pathname,
  );

  const isDetailView =
    !!isCreatePage || (!!isShowPage && isShowPage.params.id !== "create");

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
