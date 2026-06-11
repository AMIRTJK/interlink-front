import { ApiRoutes } from "@shared/api";
import { useGetQuery } from "@shared/lib";
import { HrHeader, EmployeesWidget } from "@widgets/Hr";

// Страница «Сотрудники»
export const HrEmployeesPage: React.FC = () => {
  const { data } = useGetQuery({ url: ApiRoutes.GET_USERS, useToken: true });
  const count = (data?.data?.data || data?.data || data || []).length ?? 0;

  return (
    <div>
      <HrHeader title="Управление персоналом и кадрами" subtitle={`${count} сотрудников`} />
      <EmployeesWidget />
    </div>
  );
};
