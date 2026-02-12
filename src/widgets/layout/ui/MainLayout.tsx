import { Outlet, useLocation } from "react-router-dom";
import { ModuleMenu } from "./ModuleMenu";
import { Header } from "./Header";
import { If } from "@shared/ui";
import { useCorrespondenceRoute } from "@shared/lib";

export const MainLayout = () => {
  const { shouldHideUI } = useCorrespondenceRoute();

  const { pathname } = useLocation();

  const isModulesPage = pathname.includes("modules");

  return (
    <div
      // className={`${!shouldHideUI ? "p-6!" : "p-0"}  bg-[#F2F5FF] min-h-screen flex flex-col gap-6`}
      className={`bg-[#F2F5FF] min-h-screen flex flex-col`}
    >
      <If is={!shouldHideUI}>
        <div>
          <Header isModulesPage={isModulesPage} />
        </div>
      </If>
      <If is={!shouldHideUI}>
        <div>
          <ModuleMenu variant="compact" />
        </div>
      </If>
      <div>
        <Outlet />
      </div>
    </div>
  );
};
