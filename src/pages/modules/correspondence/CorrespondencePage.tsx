import { RegistrySidebar } from "@widgets/RegistrySidebar";
import { Outlet } from "react-router-dom";

export const CorrespondencePage = () => {
  return (
    <div className="flex w-full gap-3 h-full">
      <aside>
        <RegistrySidebar />
      </aside>
      <main className="w-full min-w-0">
        <Outlet />
      </main>
    </div>
  );
};
