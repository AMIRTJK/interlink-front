import { useLocation } from "react-router-dom";
import { Result, Button } from "antd";

export const PlaceholderPage = () => {
  const { pathname } = useLocation();

  return (
    <div style={{ padding: "50px" }}>
      <Result
        status="info"
        title={`Модуль "${pathname}" находится в разработке`}
        subTitle="Мы уже работаем над тем, чтобы эта страница стала доступна."
        extra={<Button type="primary">Вернуться назад</Button>}
      />
    </div>
  );
};
