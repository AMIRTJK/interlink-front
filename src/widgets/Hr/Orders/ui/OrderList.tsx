import React from 'react';
import { BookOpen } from 'lucide-react';
import { If } from '@shared/ui/If';
import { IOrderRecord } from '../model';
import { OrderCard } from './OrderCard';

export interface IOrderListProps {
  orders: IOrderRecord[];
  onOrderClick: (order: IOrderRecord) => void;
}

export const OrderList = ({ orders, onOrderClick }: IOrderListProps) => {
  const cols = [
    { label: '№', width: 'w-10' },
    { label: 'Вид приказа', width: '' },
    { label: 'Номер', width: 'w-36 hidden sm:table-cell' },
    { label: 'Дата', width: 'w-28 hidden md:table-cell' },
    { label: 'Исполнитель', width: 'w-44 hidden lg:table-cell' },
    { label: 'Министр', width: 'w-44 hidden lg:table-cell' },
    { label: 'Пунктов', width: 'w-24 hidden md:table-cell text-center' },
    { label: 'Приложений', width: 'w-28 hidden md:table-cell text-center' },
    { label: 'Статус', width: 'w-36' },
    { label: '', width: 'w-8' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 bg-white">
              {cols.map((col) => (
                <th key={col.label} className={`px-5 py-4 ${col.width}`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <If is={orders.length === 0}>
              <tr>
                <td colSpan={10} className="text-center py-16">
                  <div className="flex flex-col items-center gap-2">
                    <BookOpen size={36} className="text-slate-200" />
                    <p className="text-sm text-slate-400">Приказы не найдены</p>
                  </div>
                </td>
              </tr>
            </If>
            
            <If is={orders.length > 0}>
              {orders.map((order, idx) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  index={idx}
                  onClick={onOrderClick}
                />
              ))}
            </If>
          </tbody>
        </table>
      </div>
    </div>
  );
};
