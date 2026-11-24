import { AppRoutes } from "@shared/config";
import { tokenControl } from "@shared/lib";
import { Navigate, Outlet } from "react-router-dom";
import { SessionLockGate } from "@features/Profile/ui/DesktopMode";

// Экран блокировки висит здесь, а не в раскладках: так он закрывает все
// приватные маршруты, включая экраны без хедера и боковой панели.
const PrivateRoute = () => {
    const token = tokenControl.get();
    if (!token) {
        return <Navigate to={AppRoutes.LOGIN} replace />;
    }
    return (
        <>
            <Outlet />
            <SessionLockGate />
        </>
    );
};

export default PrivateRoute;
