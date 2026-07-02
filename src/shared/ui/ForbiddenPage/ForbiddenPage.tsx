import { Result, Button } from "antd";
import { Link } from "react-router-dom";
import { AppRoutes } from "@shared/config";

export const ForbiddenPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Result
        status="403"
        title="403"
        subTitle="У вас недостаточно прав для просмотра этой страницы."
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
