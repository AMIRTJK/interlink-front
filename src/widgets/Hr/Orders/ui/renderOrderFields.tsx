import { OrderRequisitesCard } from './renderOrderFields/OrderRequisitesCard';
import { OrderDocumentCard } from './renderOrderFields/OrderDocumentCard';
import { OrderExecutorCard } from './renderOrderFields/OrderExecutorCard';
import type { IOrderFieldsProps } from './renderOrderFields/orderFieldsModel';

export const renderOrderFields = ({
  state,
  methods,
  orgs = [],
  users = [],
}: IOrderFieldsProps) => (
  <div className="flex flex-col gap-6 w-full">
    <OrderRequisitesCard state={state} orgs={orgs} users={users} />

    <div className="flex flex-col lg:flex-row gap-6">
      <OrderDocumentCard state={state} methods={methods} />
      <OrderExecutorCard state={state} methods={methods} users={users} />
    </div>
  </div>
);
