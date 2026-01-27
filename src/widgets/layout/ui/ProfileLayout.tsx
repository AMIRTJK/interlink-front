import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { ModuleMenu } from "./ModuleMenu";
import { DrawerActionsModal } from "@widgets/Drawer";

export const ProfileLayout = () => (
  <div className="bg-[#e5e9f5] min-h-screen flex flex-col">
    <div className="p-6">
      <Header />
      <DrawerActionsModal open={true} onClose={() => {}} />
    </div>
    <div className="p-2">
      <ModuleMenu variant="horizontal" /> {/* Добавим пропс варианта */}
    </div>
    <main className="flex-grow">
      <Outlet /> {/* Сюда рендерятся ProfilePage и его дети */}
    </main>
  </div>
);
