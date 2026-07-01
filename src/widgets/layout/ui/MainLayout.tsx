import { Outlet } from "react-router-dom";
import { ModuleMenu } from "./ModuleMenu";
import { Header } from "./Header";
import { If } from "@shared/ui";
import { useCorrespondenceRoute } from "@shared/lib";
import { Navbar } from "@widgets/Navbar";
import { useNavbar, useTabs } from "@shared/lib/hooks";

export const MainLayout = () => {
  const { shouldHideUI } = useCorrespondenceRoute();
  const { variant } = useNavbar();
  const { tabMode } = useTabs();

  return (
    <div className="bg-[#F2F5FF] min-h-screen flex flex-col">
      <If is={!shouldHideUI}>
        <div>
          <Header />
        </div>
        {variant === "ios" ? (
          <Navbar />
        ) : (
          <ModuleMenu variant="modern" hideTopLevel />
        )}
      </If>
      <div className={variant === "ios" || tabMode === "on" ? "pb-30" : ""}>
        <Outlet />
      </div>
    </div>
  );
};

