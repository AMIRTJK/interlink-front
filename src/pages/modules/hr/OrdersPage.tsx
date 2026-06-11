import { HrHeader, OrdersWidget } from "@widgets/Hr";

// Страница «Приказы»
export const HrOrdersPage: React.FC = () => {
  return (
    <div>
      <HrHeader title="Приказы" />
      <OrdersWidget />
    </div>
  );
};
