import { RegistrySidebar } from "@widgets/RegistrySidebar";
import { Outlet, useLocation } from "react-router-dom";

export const CorrespondencePage = () => {
  return (
    <div className="flex w-full gap-6 h-full">
      <aside>
        <RegistrySidebar />
      </aside>
      <main className="w-full">
        <Outlet />
      </main>
    </div>
  );
};
