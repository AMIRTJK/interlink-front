import { useState, useRef } from 'react';
import { IOrderRecord, TOrderStatus } from '../model';

export interface IOrderPointItem {
  id: string;
  value: string;
  removing: boolean;
}

export interface IOrderAttachment {
  id: string;
  name: string;
  size: number;
}

export const useOrderForm = (
  initialRecord: IOrderRecord | null,
  orderCounter: number
) => {
  const [orderType, setOrderType] = useState(initialRecord?.type ?? '');
  const [orderNumber] = useState(initialRecord?.number ?? `ПР-2026-00${orderCounter}`);
  const [orderDate, setOrderDate] = useState(
    initialRecord?.orderDate || initialRecord?.date || new Date().toISOString().split('T')[0]
  );
  
  const [organizationId, setOrganizationId] = useState<number | null>(
    initialRecord?.organizationId ?? null
  );
  const [employeeId, setEmployeeId] = useState<number | null>(
    initialRecord?.employeeId ?? null
  );
  const [executorId, setExecutorId] = useState<number | null>(
    initialRecord?.executorId ?? null
  );
  
  const [orderStatus, setOrderStatus] = useState<TOrderStatus>(
    initialRecord?.status ?? 'draft'
  );
  
  const [orderPoints, setOrderPoints] = useState<IOrderPointItem[]>(() => {
    if (initialRecord && initialRecord.points.length > 0) {
      return initialRecord.points.map((value, i) => ({
        id: `point-${i + 1}`,
        value,
        removing: false,
      }));
    }
    return [{ id: 'point-1', value: '', removing: false }];
  });

  const [additionalBasis, setAdditionalBasis] = useState(initialRecord?.basis ?? '');
  const [orderNum, setOrderNum] = useState(initialRecord?.number ?? '');
  const [ministerName, setMinisterName] = useState(initialRecord?.ministerName ?? 'Ф.Қаҳҳорзода');
  const [ministerSigned, setMinisterSigned] = useState(
    initialRecord?.status === 'signed' || initialRecord?.status === 'approved'
  );
  const [attachments, setAttachments] = useState<IOrderAttachment[]>([]);
  const attachInputRef = useRef<HTMLInputElement>(null);
  
  const addAttachments = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const newFiles: IOrderAttachment[] = Array.from(fileList).map((file, i) => ({
      id: `att-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
      name: file.name,
      size: file.size,
    }));
    setAttachments((prev) => [...prev, ...newFiles]);
  };

  const handleAttachInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addAttachments(e.target.files);
    if (attachInputRef.current) attachInputRef.current.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const addPoint = () => {
    setOrderPoints((prev) => [
      ...prev,
      { id: `point-${Date.now()}`, value: '', removing: false },
    ]);
  };

  const updatePoint = (id: string, value: string) => {
    setOrderPoints((prev) =>
      prev.map((p) => (p.id === id ? { ...p, value } : p))
    );
  };

  const removePoint = (id: string) => {
    setOrderPoints((prev) =>
      prev.map((p) => (p.id === id ? { ...p, removing: true } : p))
    );
    setTimeout(() => {
      setOrderPoints((prev) => prev.filter((p) => p.id !== id));
    }, 280);
  };

  return {
    state: {
      orderType, setOrderType,
      orderNumber,
      orderDate, setOrderDate,
      organizationId, setOrganizationId,
      employeeId, setEmployeeId,
      executorId, setExecutorId,
      orderStatus, setOrderStatus,
      orderPoints, setOrderPoints,
      additionalBasis, setAdditionalBasis,
      orderNum, setOrderNum,
      ministerName, setMinisterName,
      ministerSigned, setMinisterSigned,
      attachments, setAttachments,
      attachInputRef,
    },
    methods: {
      addAttachments,
      handleAttachInputChange,
      removeAttachment,
      addPoint,
      updatePoint,
      removePoint,
    },
  };
};
