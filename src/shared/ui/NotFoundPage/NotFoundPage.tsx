import { Link } from "react-router-dom";
import { AppRoutes } from "@shared/config/AppRoutes";

export const NotFoundPage = () => {
    return (
        <div style={{ textAlign: "center", padding: "50px" }}>
            <h1>404 — Страница не найдена</h1>
            <p>Извините, такой страницы не существует.</p>
            <Link to={AppRoutes.PROFILE}>На главную</Link>
        </div>
    );
};
