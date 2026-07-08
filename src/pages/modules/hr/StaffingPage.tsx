import { HrHeader, StaffingWidget } from "@widgets/Hr";

export const HrStaffingPage: React.FC = () => {
  return (
    <div>
      <HrHeader title="Штатное расписание" subtitle="Структура должностей и штатных единиц" />
      <StaffingWidget />
    </div>
  );
};
