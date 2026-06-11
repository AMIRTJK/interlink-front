import { HrHeader, TimesheetWidget } from "@widgets/Hr";

// Страница «Табель»
export const HrTimesheetPage: React.FC = () => {
  return (
    <div>
      <HrHeader title="Табель" />
      <TimesheetWidget />
    </div>
  );
};
