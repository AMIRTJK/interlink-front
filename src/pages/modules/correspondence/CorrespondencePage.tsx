import { useCorrespondenceRoute } from "@shared/lib";
import { If } from "@shared/ui";
import { RegistrySidebar } from "@widgets/RegistrySidebar";
import { Outlet } from "react-router-dom";

export const CorrespondencePage = () => {
  const { isDetailView, shouldHideUI } = useCorrespondenceRoute();

  return (
    <div className="flex flex-col w-full gap-3 h-full">
      <If is={!shouldHideUI}>
        <RegistrySidebar isDetailView={isDetailView} />
      </If>
      <main className="w-full min-w-0">
        <Outlet />
      </main>
    </div>
  );
};
