import { HrHeader, StaffingWidget } from "@widgets/Hr";

export const HrStaffingPage: React.FC = () => {
  return (
    <div className="flex flex-col h-[calc(100vh-140px)] overflow-hidden">
      <HrHeader title="Штатное расписание" subtitle="Структура должностей и штатных единиц" />
      <div className="flex-1 overflow-hidden">
        <StaffingWidget />
      </div>
    </div>
  );
};
