import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { ModuleMenu } from "./ModuleMenu";
import { Navbar } from "@widgets/Navbar";
import { useNavbar } from "@shared/lib/hooks";

export const ProfileLayout = () => {
  const { variant } = useNavbar();

  return (
    <div className="bg-[#e5e9f5] min-h-screen flex flex-col">
      <div className="p-6">
        <Header />
      </div>
      {variant === "ios" ? (
        <Navbar />
      ) : (
        <div className="p-2">
          <ModuleMenu variant="horizontal" />
        </div>
      )}
      <main className={variant === "ios" ? "pb-40" : ""}>
        <Outlet />
      </main>
    </div>
  );
};
