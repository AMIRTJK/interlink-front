import { Outlet, useLocation } from "react-router-dom";
import { ModuleMenu } from "./ModuleMenu";
import { Header } from "./Header";
import { If } from "@shared/ui";
import { useCorrespondenceRoute } from "@shared/lib";
import { Navbar } from "@widgets/Navbar";
import { useNavbar, useTabs } from "@shared/lib/hooks";



export const MainLayout = () => {
  const { shouldHideUI } = useCorrespondenceRoute();
  const { pathname } = useLocation();
  const { variant } = useNavbar();
  const { tabMode } = useTabs();

  const isModulesPage = pathname.includes("modules");


  return (
    <div className={`bg-[#F2F5FF] min-h-screen flex flex-col`}>
      <If is={!shouldHideUI}>
        <div>
          <Header isModulesPage={isModulesPage} />
        </div>
        
        {/* Независимый UI вкладок теперь рендерится в AppRouter, чтобы быть видным везде (включая Профиль) */}

        {variant === "ios" ? (
          <Navbar />
        ) : (
          <ModuleMenu variant="modern" />
        )}
      </If>
      <div className={variant === "ios" || tabMode === "on" ? "pb-30" : ""}>
        <Outlet />
      </div>

    </div>
  );
};

