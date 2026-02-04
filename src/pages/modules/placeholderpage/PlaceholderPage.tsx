import { useLocation, useNavigate } from "react-router-dom";
import { Result, Button } from "antd";
import { AppRoutes } from "@shared/config";

export const PlaceholderPage = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  return (
    <div style={{ padding: "50px" }}>
      <Result
        status="info"
        title={`Модуль "${pathname}" находится в разработке`}
        subTitle="Мы уже работаем над тем, чтобы эта страница стала доступна."
        extra={<Button type="primary" onClick={() => navigate(AppRoutes.PROFILE)}>Вернуться назад</Button>}
      />
    </div>
  );
};
