import { HrHeader, TimesheetWidget } from "@widgets/Hr";

export const HrTimesheetPage: React.FC = () => {
  return (
    <div>
      <HrHeader title="Табель" subtitle="Учет рабочего времени сотрудников" />
      <TimesheetWidget />
    </div>
  );
};
