import { ApiRoutes } from "@shared/api";
import { useGetQuery } from "@shared/lib";
import { HrHeader, EmployeesWidget } from "@widgets/Hr";

export const HrEmployeesPage: React.FC = () => {
  const { data } = useGetQuery({ url: ApiRoutes.GET_USERS, useToken: true });
  const count = (data?.data?.data || data?.data || data || []).length ?? 0;

  return (
    <div>
      <HrHeader title="Сотрудники" subtitle={`${count} сотрудников`} />
      <EmployeesWidget />
    </div>
  );
};
