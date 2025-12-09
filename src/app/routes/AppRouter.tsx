import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Auth } from "@features/auth/Auth";
import { Main } from "@widgets/layout/Main";
import { ProfilePage } from "@pages/profile/ProfilePage";
import { ROUTES } from "@shared/config/routes";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<Auth />} />
        <Route element={<Main />}>
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<Navigate to={ROUTES.PROFILE} replace />} />
      </Routes>
    </BrowserRouter>
  );
};
