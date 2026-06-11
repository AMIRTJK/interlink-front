import { Outlet } from "react-router-dom";

// Layout HR-модуля: контент вкладок рендерится через вложенные роуты
export const HrLayoutPage: React.FC = () => {
  return (
    <div className="p-4 md:p-6">
      <Outlet />
    </div>
  );
};
