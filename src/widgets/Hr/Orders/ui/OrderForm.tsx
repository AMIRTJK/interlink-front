import React, { useMemo } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { ApiRoutes } from '@shared/api';
import { useGetQuery } from '@shared/lib';
import { IOrderRecord } from '../model';
import { useOrderForm } from './useOrderForm';
import { renderOrderFields } from './renderOrderFields';

export interface IOrderFormProps {
  initialRecord: IOrderRecord | null;
  orderCounter: number;
  title?: string;
  onClose: () => void;
  onSave: (payload: any) => void;
}

export const OrderForm = ({
  initialRecord,
  orderCounter,
  title,
  onClose,
  onSave,
}: IOrderFormProps) => {
  const { state, methods } = useOrderForm(initialRecord, orderCounter);

  const { data: usersData } = useGetQuery({
    url: ApiRoutes.GET_USERS,
    useToken: true,
  });

  const { data: orgsData } = useGetQuery({
    url: ApiRoutes.GET_ORGANIZATIONS,
    useToken: true,
  });

  const users = useMemo(() => {
    const raw = (usersData?.data?.data || usersData?.data || usersData || []) as any[];
    return raw.map((u: any) => ({
      id: u.id,
      name: `${u.last_name || ''} ${u.first_name || ''} ${u.middle_name || ''}`.trim() || 'Без имени',
      orgId: u.organization_id || u.organization?.id,
    }));
  }, [usersData]);

  const orgs = useMemo(() => {
    const raw = (orgsData?.data?.data || orgsData?.data || orgsData || []) as any[];
    return raw.map((o: any) => ({
      id: o.id,
      name: o.name,
    }));
  }, [orgsData]);

  const handleSave = () => {
    const finalNum = state.orderNum.trim() || state.orderNumber;
    
    let newStatus = state.orderStatus;
    if (state.ministerSigned && state.orderStatus === 'draft') {
      newStatus = 'signed';
    }

    onSave({
      organization_id: state.organizationId,
      employee_id: state.employeeId,
      executor_id: state.executorId,
      type: state.orderType,
      number: finalNum,
      order_date: state.orderDate,
      basis: state.additionalBasis,
      points: state.orderPoints.map((p: any) => p.value).filter((v: string) => v.trim() !== ''),
      minister_name: state.ministerName,
      minister_signed: state.ministerSigned,
      executor_signed: initialRecord?.executorSigned ?? false,
      status: newStatus,
    });
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col overflow-auto bg-gradient-to-br from-slate-100 to-indigo-50">
      {/* Sticky Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-white shadow-sm sticky top-0 z-10 shrink-0 animate-in slide-in-from-top-4 duration-300">
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Назад</span>
        </button>
        <h1 className="text-base font-semibold text-gray-900">
          {title ?? 'Новый приказ'}
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#1E3A5F] text-white text-sm font-medium hover:bg-[#152a45] hover:shadow-md transition-all active:scale-[0.98]"
          >
            <Check size={16} />
            <span>Сохранить</span>
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 max-w-5xl w-full mx-auto p-6 lg:p-8 shrink-0">
        <div className="flex flex-col lg:flex-row gap-8">
          {renderOrderFields({ state, methods, orgs, users })}
        </div>
      </div>
    </div>
  );
};
