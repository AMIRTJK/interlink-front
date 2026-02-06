import { Outlet, useLocation } from "react-router-dom";
import { ModuleMenu } from "./ModuleMenu";
import { Header } from "./Header";
import { If } from "@shared/ui";
import { useCorrespondenceRoute } from "@shared/lib";
import { motion } from "framer-motion";

export const MainLayout = () => {
  const { shouldHideUI } = useCorrespondenceRoute();
  const location = useLocation();

  return (
    <div
      className={`${!shouldHideUI ? "p-6!" : "p-0"}  bg-[#F2F5FF] min-h-screen flex flex-col`}
    >
      <If is={!shouldHideUI}>
        <div className="mb-6">
          <Header />
        </div>
      </If>
      <If is={!shouldHideUI}>
        <div>
          <ModuleMenu variant="modern" />
        </div>
      </If>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <Outlet />
      </motion.div>
    </div>
  );
};
