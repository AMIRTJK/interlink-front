import { HrHeader, OrdersWidget } from "@widgets/Hr";

export const HrOrdersPage: React.FC = () => {
  return (
    <div>
      <HrHeader title="Приказы" subtitle="Учет и ведение приказов" />
      <OrdersWidget />
    </div>
  );
};
