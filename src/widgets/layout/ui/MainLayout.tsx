import { Outlet } from "react-router-dom";
import { ModuleMenu } from "./ModuleMenu";

export const MainLayout = () => (
  <div className="p-6 bg-[#F2F5FF] min-h-screen flex flex-col">
    <div>
      <ModuleMenu variant="compact" />
    </div>
    <div>
      <Outlet />
    </div>
  </div>
);
