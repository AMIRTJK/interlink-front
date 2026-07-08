import { HrHeader, AccessWidget } from "@widgets/Hr";

export const HrAccessPage: React.FC = () => {
  return (
    <div>
      <HrHeader title="Доступ" subtitle="Организации, отделы, роли и права" />
      <AccessWidget />
    </div>
  );
};
