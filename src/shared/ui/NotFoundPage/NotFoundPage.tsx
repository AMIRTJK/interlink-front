import { Result, Button } from "antd";
import { Link } from "react-router-dom";
import { AppRoutes } from "@shared/config";

export const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Result
        status="404"
        title="404"
        subTitle="Извините, такой страницы не существует."
        className="bg-white rounded-2xl shadow-md px-8 py-12"
        extra={
          <Link to={AppRoutes.PROFILE}>
            <Button type="primary" size="large">
              На главную
            </Button>
          </Link>
        }
      />
    </div>
  );
};
