import { AppRoutes } from "@shared/config";
import { tokenControl } from "@shared/lib";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
    const token = tokenControl.get();
    if (!token) {
        return <Navigate to={AppRoutes.LOGIN} replace />;
    }
    return <Outlet />;
};

export default PrivateRoute;
