import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AppRoutes, welcomeStorage } from "@shared/config";
import { tokenControl } from "@shared/lib";
import { If } from "@shared/ui";

const WelcomeRoute = () => {
  const hasToken = !!tokenControl.get();
  const [isAllowed] = useState(() => hasToken && welcomeStorage.isPending());
  const fallback = hasToken ? AppRoutes.PROFILE : AppRoutes.LOGIN;

  return (
    <>
      <If is={isAllowed}>
        <Outlet />
      </If>
      <If is={!isAllowed}>
        <Navigate to={fallback} replace />
      </If>
    </>
  );
};

export default WelcomeRoute;
