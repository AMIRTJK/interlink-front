import { Profile } from "@features/profile";
import { ModuleMenu } from "@widgets/layout";
import { Header } from "@widgets/layout/Header";

export const ProfilePage = () => {
  return (
    <div className="bg-[#e5e9f5] h-screen">
      <div className="p-6">
        <Header />
      </div>
      <div className="p-2">
        <ModuleMenu />
      </div>
      <div className="main-content-area bg-[#e5e9f5]">
        <Profile />
      </div>
    </div>
  );
};
