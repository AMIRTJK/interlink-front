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
      <div className={shouldHideUI ? "flex-grow flex flex-col min-w-0" : "relative z-10 flex flex-col flex-grow gap-6 px-6 py-4 transition-all duration-300 ease-in-out min-w-0"}>
        <If is={!shouldHideUI}>
          <Header />
          {variant === "ios" ? (
            <Navbar />
          ) : (
            <ModuleMenu variant="modern" hideTopLevel />
          )}
        </If>
        <main className={`flex-grow min-w-0 ${variant === "ios" || tabMode === "on" ? "pb-30" : ""}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

