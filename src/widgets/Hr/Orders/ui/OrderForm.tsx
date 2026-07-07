import React from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { IOrderRecord } from '../model';
import { useOrderForm } from './useOrderForm';
import { renderOrderFields } from './renderOrderFields';

export interface IOrderFormProps {
  initialRecord: IOrderRecord | null;
  orderCounter: number;
  title?: string;
  onClose: () => void;
  onSave: (order: IOrderRecord) => void;
}

export const OrderForm = ({
  initialRecord,
  orderCounter,
  title,
  onClose,
  onSave,
}: IOrderFormProps) => {
  const { state, methods } = useOrderForm(initialRecord, orderCounter);

  const handleSave = () => {
    const finalNum = state.orderNum.trim() || state.orderNumber;
    
    // Status logic: if minister signed and draft -> signed, else keep status
    let newStatus = state.orderStatus;
    if (state.ministerSigned && state.orderStatus === 'Черновик') {
      newStatus = 'Подписан';
    }

    onSave({
      id: initialRecord?.id ?? `ord-${Date.now()}`,
      type: state.orderType,
      number: finalNum,
      date: state.orderDate,
      executorName: state.executorName,
      status: newStatus,
      points: state.orderPoints.map((p) => p.value).filter((v) => v.trim() !== ''),
      basis: state.additionalBasis,
      ministerName: state.ministerName,
      ministerSigned: state.ministerSigned,
      executorSigned: initialRecord?.executorSigned ?? false,
      attachments: state.attachments.map((a) => a.name),
      createdAt: initialRecord?.createdAt ?? new Date().toLocaleDateString('ru-RU'),
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
          {renderOrderFields({ state, methods })}
        </div>
      </div>
    </div>
  );
};
