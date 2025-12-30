import { RegistrySidebar } from "@widgets/RegistrySidebar";
import { Outlet } from "react-router-dom";

export const CorrespondencePage = () => {
  return (
    <div className="flex w-full gap-6 h-full">
      <aside className="h-[800px]">
        <RegistrySidebar />
      </aside>
      <main className="w-full h-[800px] rounded-2xl">
        <Outlet />
      </main>
    </div>
  );
};
