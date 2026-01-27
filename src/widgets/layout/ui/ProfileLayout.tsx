import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { ModuleMenu } from "./ModuleMenu";

export const ProfileLayout = () => (
  <div className="bg-[#e5e9f5] min-h-screen flex flex-col">
    <div className="p-6">
      <Header />
    </div>
    <div className="p-2">
      <ModuleMenu variant="horizontal" /> 
    </div>
    <main>
      <Outlet /> 
    </main>
  </div>
);
