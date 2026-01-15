import { Outlet } from "react-router-dom";
import { ModuleMenu } from "./ModuleMenu";
import { Header } from "./Header";

export const MainLayout = () => (
  <div className="p-6 bg-[#F2F5FF] min-h-screen flex flex-col">
    <div className="mb-6">
      <Header />
    </div>
    <div>
      <ModuleMenu variant="compact" />
    </div>
    <div>
      <Outlet />
    </div>
  </div>
);
