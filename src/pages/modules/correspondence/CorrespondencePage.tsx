import { RegistrySidebar } from "@widgets/RegistrySidebar";
import { Outlet, useLocation } from "react-router-dom";

export const CorrespondencePage = () => {
  const { pathname } = useLocation();

  const isCreatePage = pathname.endsWith("/create");

  const heightClass = isCreatePage ? "h-auto" : "h-[800px]";

  return (
    <div className="flex w-full gap-6 h-full">
      <aside className={heightClass}>
        <RegistrySidebar />
      </aside>
      <main className={`w-full ${heightClass}`}>
        <Outlet />
      </main>
    </div>
  );
};
