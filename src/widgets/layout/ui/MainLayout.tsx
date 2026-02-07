import { Outlet } from "react-router-dom";
import { ModuleMenu } from "./ModuleMenu";
import { Header } from "./Header";
import { If } from "@shared/ui";
import { useCorrespondenceRoute } from "@shared/lib";

export const MainLayout = () => {
  const { shouldHideUI } = useCorrespondenceRoute();

  return (
    <div
      className={`${!shouldHideUI ? "p-6!" : "p-0"}  bg-[#F2F5FF] min-h-screen flex flex-col`}
    >
      <If is={!shouldHideUI}>
        <div className="mb-6">
          <Header />
        </div>
      </If>
      <If is={!shouldHideUI}>
        <div>
          <ModuleMenu variant="modern" />
        </div>
      </If>
      <div>
        <Outlet />
      </div>
    </div>
  );
};
