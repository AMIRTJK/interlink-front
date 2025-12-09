import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthLayout } from "@features/auth/AuthLayout";
import { MainLayout } from "@widgets/layout/MainLayout";
import { ProfilePage } from "@pages/profile/ProfilePage";
import { ROUTES } from "@shared/config/routes";

export const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path={ROUTES.LOGIN} element={<AuthLayout />} />
                <Route element={<MainLayout />}>
                    <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
                </Route>
                <Route path="*" element={<Navigate to={ROUTES.PROFILE} replace />} />
            </Routes>
        </BrowserRouter>
    );
};
