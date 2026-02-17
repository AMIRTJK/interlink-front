import { Outlet, useLocation } from "react-router-dom";
import { ModuleMenu } from "./ModuleMenu";
import { Header } from "./Header";
import { If } from "@shared/ui";
import { useCorrespondenceRoute } from "@shared/lib";
import { Navbar } from "@widgets/Navbar";
import { useNavbar } from "@shared/lib/hooks";

export const MainLayout = () => {
  const { shouldHideUI } = useCorrespondenceRoute();
  const { pathname } = useLocation();
  const { variant } = useNavbar();

  const isModulesPage = pathname.includes("modules");

  return (
    <div className={`bg-[#F2F5FF] min-h-screen flex flex-col`}>
      <If is={!shouldHideUI}>
        {variant === "ios" ? (
          <Navbar />
        ) : (
          <>
            <div>
              <Header isModulesPage={isModulesPage} />
            </div>
            <ModuleMenu variant="modern" />
          </>
        )}
      </If>
      <div>
        <Outlet />
      </div>
    </div>
  );
};

