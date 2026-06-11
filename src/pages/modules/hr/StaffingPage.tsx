import { HrHeader, StaffingWidget } from "@widgets/Hr";

// Страница «Штатное расписание»
export const HrStaffingPage: React.FC = () => {
  return (
    <div>
      <HrHeader />
      <StaffingWidget />
    </div>
  );
};
